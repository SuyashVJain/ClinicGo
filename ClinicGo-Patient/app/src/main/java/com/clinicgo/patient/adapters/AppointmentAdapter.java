package com.clinicgo.patient.adapters;

import android.content.Context;
import android.graphics.drawable.GradientDrawable;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import com.clinicgo.patient.models.AppointmentModel;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.clinicgo.patient.R;
import java.util.List;

public class AppointmentAdapter extends RecyclerView.Adapter<AppointmentAdapter.ViewHolder> {

    private List<AppointmentModel> appointments;
    private final Context context;

    public AppointmentAdapter(List<AppointmentModel> appointments, Context context) {
        this.appointments = appointments;
        this.context      = context;
    }

    public void updateData(List<AppointmentModel> data) {
        this.appointments = data;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context)
                .inflate(R.layout.item_appointment, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        AppointmentModel appt = appointments.get(position);

        holder.tvDoctor.setText(appt.doctorName != null ? appt.doctorName : "Doctor");
        holder.tvDate.setText(appt.appointmentDate + " · " +
                (appt.slotTime != null ? appt.slotTime.substring(0, 5) : ""));

        // Token — show just the number bold
        holder.tvToken.setText("#" + appt.tokenNumber);

        // Type — human readable
        holder.tvType.setText(formatType(appt.type));

        // Status chip — text + background color
        String statusLabel = formatStatus(appt.status);
        holder.tvStatus.setText(statusLabel);
        applyStatusChip(holder.tvStatus, appt.status);
    }

    @Override
    public int getItemCount() { return appointments.size(); }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String formatType(String type) {
        if (type == null) return "";
        switch (type) {
            case "NEW":       return "New Patient";
            case "FOLLOW_UP": return "Follow Up";
            default:          return type;
        }
    }

    private String formatStatus(String status) {
        if (status == null) return "";
        switch (status) {
            case "CONFIRMED":             return "Confirmed";
            case "COMPLETED":             return "Completed";
            case "CANCELLED":             return "Cancelled";
            case "NO_SHOW":               return "No Show";
            case "PENDING_CONFIRMATION":  return "Pending";
            default:                      return status;
        }
    }

    private void applyStatusChip(TextView tv, String status) {
        int textColor;
        int bgColor;

        switch (status != null ? status : "") {
            case "CONFIRMED":
                textColor = 0xFF2E7D32;
                bgColor   = 0xFFE8F5E9;
                break;
            case "COMPLETED":
                textColor = 0xFF1565C0;
                bgColor   = 0xFFE3F2FD;
                break;
            case "CANCELLED":
                textColor = 0xFFC62828;
                bgColor   = 0xFFFFEBEE;
                break;
            case "NO_SHOW":
                textColor = 0xFF6D4C41;
                bgColor   = 0xFFEFEBE9;
                break;
            default: // PENDING_CONFIRMATION
                textColor = 0xFFE65100;
                bgColor   = 0xFFFFF3E0;
                break;
        }

        tv.setTextColor(textColor);

        // Apply rounded chip background programmatically
        GradientDrawable chip = new GradientDrawable();
        chip.setShape(GradientDrawable.RECTANGLE);
        chip.setCornerRadius(40f);
        chip.setColor(bgColor);
        tv.setBackground(chip);
    }

    // ── ViewHolder ────────────────────────────────────────────────────────────

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvDoctor, tvDate, tvToken, tvStatus, tvType;

        ViewHolder(View itemView) {
            super(itemView);
            tvDoctor = itemView.findViewById(R.id.tv_doctor);
            tvDate   = itemView.findViewById(R.id.tv_date);
            tvToken  = itemView.findViewById(R.id.tv_token);
            tvStatus = itemView.findViewById(R.id.tv_status);
            tvType   = itemView.findViewById(R.id.tv_type);
        }
    }
}