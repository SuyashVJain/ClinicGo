package com.clinicgo.patient.adapters;

import android.content.Context;
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
        holder.tvDoctor.setText(appt.doctorName);
        holder.tvDate.setText(appt.appointmentDate + " · " +
            (appt.slotTime != null ? appt.slotTime.substring(0, 5) : ""));
        holder.tvToken.setText("Token #" + appt.tokenNumber);
        holder.tvStatus.setText(appt.status.replace("_", " "));
        holder.tvType.setText(appt.type);

        // Color-code status
        int color;
        switch (appt.status) {
            case "CONFIRMED":
                color = context.getColor(R.color.status_confirmed);
                break;
            case "COMPLETED":
                color = context.getColor(R.color.status_completed);
                break;
            case "CANCELLED":
                color = context.getColor(R.color.status_cancelled);
                break;
            default:
                color = context.getColor(R.color.status_pending);
        }
        holder.tvStatus.setTextColor(color);
    }

    @Override
    public int getItemCount() { return appointments.size(); }

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
