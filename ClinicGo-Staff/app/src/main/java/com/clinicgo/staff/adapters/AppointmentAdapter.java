package com.clinicgo.staff.adapters;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.clinicgo.staff.R;
import com.clinicgo.staff.models.AppointmentModel;
import com.clinicgo.staff.network.ApiClient;

import java.util.List;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class AppointmentAdapter extends RecyclerView.Adapter<AppointmentAdapter.ViewHolder> {

    private List<AppointmentModel> items;
    private final Context context;
    private final boolean isDoctorView;

    public AppointmentAdapter(List<AppointmentModel> items, Context context, boolean isDoctorView) {
        this.items        = items;
        this.context      = context;
        this.isDoctorView = isDoctorView;
    }

    public void updateData(List<AppointmentModel> data) {
        this.items = data;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        int layout = isDoctorView
            ? R.layout.item_appointment_doctor
            : R.layout.item_appointment_receptionist;
        View view = LayoutInflater.from(context).inflate(layout, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        AppointmentModel appt = items.get(position);

        if (holder.tvPatient != null) holder.tvPatient.setText(appt.patientName);
        if (holder.tvTime    != null) holder.tvTime.setText(
            appt.slotTime != null && appt.slotTime.length() >= 5
                ? appt.slotTime.substring(0, 5) : "");
        if (holder.tvToken  != null) holder.tvToken.setText("#" + appt.tokenNumber);
        if (holder.tvStatus != null) holder.tvStatus.setText(
            appt.status != null ? appt.status.replace("_", " ") : "");
        if (holder.tvType   != null) holder.tvType.setText(appt.type);

        // Doctor: complete button
        if (holder.btnComplete != null) {
            if ("CONFIRMED".equals(appt.status)) {
                holder.btnComplete.setVisibility(View.VISIBLE);
                holder.btnComplete.setOnClickListener(v -> {
                    ApiClient.getService().completeAppointment(appt.appointmentId)
                        .enqueue(new Callback<Map<String, Object>>() {
                            @Override
                            public void onResponse(Call<Map<String, Object>> call,
                                                   Response<Map<String, Object>> response) {
                                if (response.isSuccessful()) {
                                    appt.status = "COMPLETED";
                                    notifyItemChanged(position);
                                    Toast.makeText(context, "Marked complete", Toast.LENGTH_SHORT).show();
                                }
                            }
                            @Override public void onFailure(Call<Map<String, Object>> call, Throwable t) {}
                        });
                });
            } else {
                holder.btnComplete.setVisibility(View.GONE);
            }
        }

        // Receptionist: confirm button
        if (holder.btnConfirm != null) {
            if ("PENDING_CONFIRMATION".equals(appt.status)) {
                holder.btnConfirm.setVisibility(View.VISIBLE);
                holder.btnConfirm.setOnClickListener(v -> {
                    ApiClient.getService().confirmAppointment(appt.appointmentId)
                        .enqueue(new Callback<Map<String, Object>>() {
                            @Override
                            public void onResponse(Call<Map<String, Object>> call,
                                                   Response<Map<String, Object>> response) {
                                if (response.isSuccessful()) {
                                    appt.status = "CONFIRMED";
                                    notifyItemChanged(position);
                                    Toast.makeText(context, "Appointment confirmed!", Toast.LENGTH_SHORT).show();
                                }
                            }
                            @Override public void onFailure(Call<Map<String, Object>> call, Throwable t) {}
                        });
                });
            } else {
                holder.btnConfirm.setVisibility(View.GONE);
            }
        }
    }

    @Override
    public int getItemCount() { return items.size(); }

    public static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvPatient, tvTime, tvToken, tvStatus, tvType;
        Button   btnConfirm, btnComplete;

        ViewHolder(View v) {
            super(v);
            tvPatient   = v.findViewById(R.id.tv_patient);
            tvTime      = v.findViewById(R.id.tv_time);
            tvToken     = v.findViewById(R.id.tv_token);
            tvStatus    = v.findViewById(R.id.tv_status);
            tvType      = v.findViewById(R.id.tv_type);
            btnConfirm  = v.findViewById(R.id.btn_confirm);
            btnComplete = v.findViewById(R.id.btn_complete);
        }
    }
}
