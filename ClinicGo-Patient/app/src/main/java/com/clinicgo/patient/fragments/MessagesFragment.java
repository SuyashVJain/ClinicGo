package com.clinicgo.patient.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.clinicgo.patient.R;
import com.clinicgo.patient.models.AppointmentModel;
import com.clinicgo.patient.network.ApiClient;
import com.clinicgo.patient.network.ApiService;
import com.clinicgo.patient.utils.SessionManager;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MessagesFragment extends Fragment {

    private RecyclerView recyclerView;
    private LinearLayout emptyState;
    private SessionManager session;

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_messages, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        recyclerView = view.findViewById(R.id.rvConversations);
        emptyState   = view.findViewById(R.id.llEmptyState);
        session      = new SessionManager(requireContext());

        recyclerView.setLayoutManager(new LinearLayoutManager(requireContext()));
        loadConversations();
    }

    private void loadConversations() {
        ApiService api = ApiClient.getService();
        api.getPatientAppointments(session.getUserId())
                .enqueue(new Callback<List<AppointmentModel>>() {
                    @Override
                    public void onResponse(@NonNull Call<List<AppointmentModel>> call,
                                           @NonNull Response<List<AppointmentModel>> response) {
                        if (!isAdded()) return;
                        if (response.isSuccessful() && response.body() != null) {
                            Map<Integer, AppointmentModel> doctorMap = new LinkedHashMap<>();
                            for (AppointmentModel a : response.body()) {
                                if ("CONFIRMED".equals(a.status) || "COMPLETED".equals(a.status)) {
                                    if (!doctorMap.containsKey(a.doctorId))
                                        doctorMap.put(a.doctorId, a);
                                }
                            }
                            showConversations(new ArrayList<>(doctorMap.values()));
                        }
                    }

                    @Override
                    public void onFailure(@NonNull Call<List<AppointmentModel>> call,
                                          @NonNull Throwable t) {
                        if (isAdded())
                            Toast.makeText(requireContext(),
                                    "Failed to load conversations", Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private void showConversations(List<AppointmentModel> appointments) {
        if (appointments.isEmpty()) {
            recyclerView.setVisibility(View.GONE);
            emptyState.setVisibility(View.VISIBLE);
            return;
        }
        recyclerView.setVisibility(View.VISIBLE);
        emptyState.setVisibility(View.GONE);

        ConversationAdapter adapter = new ConversationAdapter(appointments, appt -> {
            Bundle args = new Bundle();
            args.putInt("appointmentId", appt.appointmentId);
            args.putInt("doctorId",      appt.doctorId);
            args.putString("doctorName", appt.doctorName != null ? appt.doctorName : "Doctor");

            ChatFragment chatFragment = new ChatFragment();
            chatFragment.setArguments(args);

            requireActivity().getSupportFragmentManager()
                    .beginTransaction()
                    .replace(R.id.fragment_container, chatFragment)
                    .addToBackStack(null)
                    .commit();
        });
        recyclerView.setAdapter(adapter);
    }

    // ── Inner adapter ─────────────────────────────────────────────────────────
    static class ConversationAdapter
            extends RecyclerView.Adapter<ConversationAdapter.VH> {

        interface OnClickListener { void onClick(AppointmentModel appt); }

        private final List<AppointmentModel> items;
        private final OnClickListener listener;

        ConversationAdapter(List<AppointmentModel> items, OnClickListener listener) {
            this.items    = items;
            this.listener = listener;
        }

        @NonNull
        @Override
        public VH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            View v = LayoutInflater.from(parent.getContext())
                    .inflate(R.layout.item_conversation, parent, false);
            return new VH(v);
        }

        @Override
        public void onBindViewHolder(@NonNull VH holder, int position) {
            AppointmentModel appt = items.get(position);
            String name = appt.doctorName != null ? appt.doctorName : "Doctor";
            holder.tvName.setText(name);
            holder.tvSub.setText("Appointment #" + appt.appointmentId + "  •  " + appt.status);
            String[] parts = name.split(" ");
            holder.tvInitial.setText(String.valueOf(parts[parts.length - 1].charAt(0)));
            holder.itemView.setOnClickListener(v -> listener.onClick(appt));
        }

        @Override
        public int getItemCount() { return items.size(); }

        static class VH extends RecyclerView.ViewHolder {
            TextView tvName, tvSub, tvInitial;
            VH(View v) {
                super(v);
                tvName    = v.findViewById(R.id.tvDoctorName);
                tvSub     = v.findViewById(R.id.tvLastMessage);
                tvInitial = v.findViewById(R.id.tvInitial);
            }
        }
    }
}