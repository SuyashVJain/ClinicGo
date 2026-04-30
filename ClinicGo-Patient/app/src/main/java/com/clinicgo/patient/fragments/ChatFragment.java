package com.clinicgo.patient.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.widget.Toolbar;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.clinicgo.patient.R;
import com.clinicgo.patient.adapters.ChatAdapter;
import com.clinicgo.patient.models.ChatMessage;
import com.clinicgo.patient.network.ApiClient;
import com.clinicgo.patient.network.ApiService;
import com.clinicgo.patient.utils.SessionManager;
import com.microsoft.signalr.HubConnection;
import com.microsoft.signalr.HubConnectionBuilder;
import com.microsoft.signalr.HubConnectionState;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ChatFragment extends Fragment {

    private RecyclerView recyclerView;
    private EditText etMessage;
    private ImageButton btnSend;
    private TextView tvStatus;

    private ChatAdapter adapter;
    private final List<ChatMessage> messages = new ArrayList<>();

    private HubConnection hubConnection;
    private SessionManager session;

    private int appointmentId;
    private int doctorId;
    private String doctorName;

    // Hub URL — derived from the API base URL by stripping "api/v1/"
    // ApiClient.BASE_URL is private so we hardcode the hub path pattern here.
    // The base URL is the same host; we just replace the path segment.
    private String getHubUrl() {
        // Retrofit's baseUrl is accessible via the built client; simplest approach
        // is to build it from the known ngrok/server base. We call a helper on ApiClient.
        String base = ApiClient.getBaseUrl(); // we add this static method below
        return base.replace("api/v1/", "") + "chathub?access_token=" + session.getToken();
    }

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_chat, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        if (getArguments() != null) {
            appointmentId = getArguments().getInt("appointmentId");
            doctorId      = getArguments().getInt("doctorId");
            doctorName    = getArguments().getString("doctorName", "Doctor");
        }

        session = new SessionManager(requireContext());

        recyclerView = view.findViewById(R.id.rvMessages);
        etMessage    = view.findViewById(R.id.etMessage);
        btnSend      = view.findViewById(R.id.btnSend);
        tvStatus     = view.findViewById(R.id.tvConnectionStatus);

        Toolbar toolbar = view.findViewById(R.id.toolbar);
        if (toolbar != null) {
            toolbar.setTitle(doctorName);
            toolbar.setNavigationOnClickListener(v ->
                    requireActivity().getSupportFragmentManager().popBackStack());
        }

        LinearLayoutManager lm = new LinearLayoutManager(requireContext());
        lm.setStackFromEnd(true);
        recyclerView.setLayoutManager(lm);
        adapter = new ChatAdapter(messages, session.getUserId());
        recyclerView.setAdapter(adapter);

        btnSend.setOnClickListener(v -> sendMessage());

        loadHistory();
    }

    // ── Load history ──────────────────────────────────────────────────────────
    private void loadHistory() {
        ApiService api = ApiClient.getService();
        api.getChatHistory(appointmentId).enqueue(new Callback<List<ChatMessage>>() {
            @Override
            public void onResponse(@NonNull Call<List<ChatMessage>> call,
                                   @NonNull Response<List<ChatMessage>> response) {
                if (!isAdded()) return;
                if (response.isSuccessful() && response.body() != null) {
                    messages.addAll(response.body());
                    adapter.notifyDataSetChanged();
                    scrollToBottom();
                }
                connectSignalR();
            }

            @Override
            public void onFailure(@NonNull Call<List<ChatMessage>> call, @NonNull Throwable t) {
                if (isAdded()) connectSignalR();
            }
        });
    }

    // ── SignalR ───────────────────────────────────────────────────────────────
    private void connectSignalR() {
        String hubUrl = getHubUrl();

        hubConnection = HubConnectionBuilder.create(hubUrl).build();

        // Receive message from doctor
        hubConnection.on("ReceiveMessage", (payload) -> {
            if (!isAdded()) return;
            requireActivity().runOnUiThread(() -> {
                ChatMessage msg = parsePayload(payload);
                if (msg != null) {
                    adapter.addMessage(msg);
                    scrollToBottom();
                }
            });
        }, Object.class);

        hubConnection.onClosed(ex -> {
            if (!isAdded()) return;
            requireActivity().runOnUiThread(() -> tvStatus.setText("Disconnected"));
        });

        // SignalR Java client 8.x uses .start() which returns a Completable
        hubConnection.start()
                .doOnComplete(() -> {
                    if (!isAdded()) return;
                    requireActivity().runOnUiThread(() -> tvStatus.setText("Connected ●"));
                })
                .doOnError(ex -> {
                    if (!isAdded()) return;
                    requireActivity().runOnUiThread(() -> {
                        tvStatus.setText("Connection failed");
                        Toast.makeText(requireContext(),
                                "Chat error: " + ex.getMessage(), Toast.LENGTH_SHORT).show();
                    });
                })
                .subscribe();
    }

    // ── Send ──────────────────────────────────────────────────────────────────
    private void sendMessage() {
        String content = etMessage.getText().toString().trim();
        if (content.isEmpty()) return;

        if (hubConnection == null ||
                hubConnection.getConnectionState() != HubConnectionState.CONNECTED) {
            Toast.makeText(requireContext(), "Not connected to chat", Toast.LENGTH_SHORT).show();
            return;
        }

        // Optimistic UI
        ChatMessage optimistic = new ChatMessage(
                session.getUserId(), doctorId, appointmentId, content);
        optimistic.setSentAt(java.time.Instant.now().toString());
        adapter.addMessage(optimistic);
        scrollToBottom();
        etMessage.setText("");

        hubConnection.send("SendMessage", doctorId, appointmentId, content);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private void scrollToBottom() {
        if (adapter.getItemCount() > 0)
            recyclerView.smoothScrollToPosition(adapter.getItemCount() - 1);
    }

    @SuppressWarnings("unchecked")
    private ChatMessage parsePayload(Object payload) {
        try {
            if (payload instanceof Map) {
                Map<String, Object> map = (Map<String, Object>) payload;
                ChatMessage msg = new ChatMessage();
                if (map.get("senderId") instanceof Number)
                    msg.setSenderId(((Number) map.get("senderId")).intValue());
                if (map.get("receiverId") instanceof Number)
                    msg.setReceiverId(((Number) map.get("receiverId")).intValue());
                if (map.get("appointmentId") instanceof Number)
                    msg.setAppointmentId(((Number) map.get("appointmentId")).intValue());
                if (map.get("content") instanceof String)
                    msg.setContent((String) map.get("content"));
                if (map.get("sentAt") instanceof String)
                    msg.setSentAt((String) map.get("sentAt"));
                if (map.get("senderName") instanceof String)
                    msg.setSenderName((String) map.get("senderName"));
                return msg;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        if (hubConnection != null &&
                hubConnection.getConnectionState() == HubConnectionState.CONNECTED) {
            hubConnection.stop();
        }
    }
}