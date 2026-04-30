package com.clinicgo.patient.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.clinicgo.patient.R;
import com.clinicgo.patient.models.ChatMessage;
import java.util.List;

public class ChatAdapter extends RecyclerView.Adapter<RecyclerView.ViewHolder> {

    private static final int VIEW_TYPE_SENT     = 1;
    private static final int VIEW_TYPE_RECEIVED = 2;

    private final List<ChatMessage> messages;
    private final int currentUserId;

    public ChatAdapter(List<ChatMessage> messages, int currentUserId) {
        this.messages      = messages;
        this.currentUserId = currentUserId;
    }

    @Override
    public int getItemViewType(int position) {
        return messages.get(position).getSenderId() == currentUserId
                ? VIEW_TYPE_SENT : VIEW_TYPE_RECEIVED;
    }

    @NonNull
    @Override
    public RecyclerView.ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        LayoutInflater inflater = LayoutInflater.from(parent.getContext());
        if (viewType == VIEW_TYPE_SENT) {
            View v = inflater.inflate(R.layout.item_message_sent, parent, false);
            return new SentViewHolder(v);
        } else {
            View v = inflater.inflate(R.layout.item_message_received, parent, false);
            return new ReceivedViewHolder(v);
        }
    }

    @Override
    public void onBindViewHolder(@NonNull RecyclerView.ViewHolder holder, int position) {
        ChatMessage msg = messages.get(position);
        if (holder instanceof SentViewHolder) {
            ((SentViewHolder) holder).bind(msg);
        } else {
            ((ReceivedViewHolder) holder).bind(msg);
        }
    }

    @Override
    public int getItemCount() { return messages.size(); }

    public void addMessage(ChatMessage msg) {
        messages.add(msg);
        notifyItemInserted(messages.size() - 1);
    }

    // ── Sent ViewHolder ───────────────────────────────────────────────────────
    static class SentViewHolder extends RecyclerView.ViewHolder {
        TextView tvContent, tvTime;

        SentViewHolder(View v) {
            super(v);
            tvContent = v.findViewById(R.id.tvMessageContent);
            tvTime    = v.findViewById(R.id.tvMessageTime);
        }

        void bind(ChatMessage msg) {
            tvContent.setText(msg.getContent());
            tvTime.setText(formatTime(msg.getSentAt()));
        }
    }

    // ── Received ViewHolder ───────────────────────────────────────────────────
    static class ReceivedViewHolder extends RecyclerView.ViewHolder {
        TextView tvContent, tvTime, tvSender;

        ReceivedViewHolder(View v) {
            super(v);
            tvContent = v.findViewById(R.id.tvMessageContent);
            tvTime    = v.findViewById(R.id.tvMessageTime);
            tvSender  = v.findViewById(R.id.tvSenderName);
        }

        void bind(ChatMessage msg) {
            tvContent.setText(msg.getContent());
            tvTime.setText(formatTime(msg.getSentAt()));
            if (msg.getSenderName() != null)
                tvSender.setText(msg.getSenderName());
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private static String formatTime(String isoTime) {
        if (isoTime == null || isoTime.length() < 16) return "";
        try {
            // "2026-04-28T10:30:00" → "10:30"
            return isoTime.substring(11, 16);
        } catch (Exception e) {
            return "";
        }
    }
}
