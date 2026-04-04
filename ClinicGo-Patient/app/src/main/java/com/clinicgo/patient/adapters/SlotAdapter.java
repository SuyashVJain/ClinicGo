package com.clinicgo.patient.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.clinicgo.patient.R;
import com.clinicgo.patient.models.SlotModel;

import java.util.ArrayList;
import java.util.List;

public class SlotAdapter extends RecyclerView.Adapter<SlotAdapter.ViewHolder> {

    public interface OnSlotClickListener {
        void onSlotClick(SlotModel slot);
    }

    private List<SlotModel> slots = new ArrayList<>();
    private final OnSlotClickListener listener;
    private int selectedPosition = -1;

    public SlotAdapter(OnSlotClickListener listener) {
        this.listener = listener;
    }

    public void updateSlots(List<SlotModel> newSlots) {
        this.slots = newSlots;
        selectedPosition = -1;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
            .inflate(R.layout.item_slot, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        SlotModel slot = slots.get(position);
        String time = slot.slotTime != null ? slot.slotTime.substring(0, 5) : "";
        holder.tvTime.setText(time);

        if (!slot.isAvailable) {
            holder.itemView.setAlpha(0.4f);
            holder.itemView.setEnabled(false);
            holder.tvTime.setBackgroundResource(R.drawable.bg_slot_unavailable);
        } else if (position == selectedPosition) {
            holder.itemView.setAlpha(1f);
            holder.tvTime.setBackgroundResource(R.drawable.bg_slot_selected);
            holder.tvTime.setTextColor(0xFFFFFFFF);
        } else {
            holder.itemView.setAlpha(1f);
            holder.itemView.setEnabled(true);
            holder.tvTime.setBackgroundResource(R.drawable.bg_slot_available);
            holder.tvTime.setTextColor(0xFF005DAC);
        }

        holder.itemView.setOnClickListener(v -> {
            if (slot.isAvailable) {
                int prev = selectedPosition;
                selectedPosition = holder.getAdapterPosition();
                notifyItemChanged(prev);
                notifyItemChanged(selectedPosition);
                listener.onSlotClick(slot);
            }
        });
    }

    @Override
    public int getItemCount() { return slots.size(); }

    public static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvTime;
        ViewHolder(View itemView) {
            super(itemView);
            tvTime = itemView.findViewById(R.id.tv_slot_time);
        }
    }
}
