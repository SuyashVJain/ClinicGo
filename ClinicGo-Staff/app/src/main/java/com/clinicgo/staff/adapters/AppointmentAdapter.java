package com.clinicgo.staff.adapters;

import android.content.Context;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.RecyclerView;

import com.clinicgo.staff.R;
import com.clinicgo.staff.fragments.PrescriptionWriterFragment;
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

        if (holder.tvPatient != null) holder.tvPatient.setText(appt.getPatientDisplayName());
        if (holder.tvTime    != null) holder.tvTime.setText(
            appt.slotTime != null && appt.slotTime.length() >= 5
                ? appt.slotTime.substring(0, 5) : "");
        if (holder.tvToken  != null) holder.tvToken.setText("#" + appt.tokenNumber);
        if (holder.tvStatus != null) {
            holder.tvStatus.setText(formatStatus(appt.status));
            applyStatusChip(holder.tvStatus, appt.status);
        }
        if (holder.tvType   != null) holder.tvType.setText(appt.type);

        // Left status accent bar
        if (holder.viewStatusBar != null) {
            holder.viewStatusBar.setBackgroundColor(statusBarColor(appt.status));
        }

        // Doctor: Write Prescription button (navigates to PrescriptionWriterFragment)
        if (holder.btnComplete != null) {
            if ("CONFIRMED".equals(appt.status)) {
                holder.btnComplete.setVisibility(View.VISIBLE);
                holder.btnComplete.setOnClickListener(v -> {
                    PrescriptionWriterFragment frag = new PrescriptionWriterFragment();
                    Bundle args = new Bundle();
                    args.putInt("appointmentId", appt.appointmentId);
                    args.putString("patientName", appt.patientName != null ? appt.patientName : "");
                    frag.setArguments(args);
                    ((AppCompatActivity) context)
                        .getSupportFragmentManager()
                        .beginTransaction()
                        .replace(R.id.fragment_container, frag)
                        .addToBackStack(null)
                        .commit();
                });
            } else {
                holder.btnComplete.setVisibility(View.GONE);
            }
        }

        // Receptionist: confirm button (only for PENDING_CONFIRMATION)
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

        // Receptionist: cancel button (for PENDING_CONFIRMATION or CONFIRMED)
        if (holder.btnCancel != null) {
            boolean canCancel = "PENDING_CONFIRMATION".equals(appt.status)
                             || "CONFIRMED".equals(appt.status);
            holder.btnCancel.setVisibility(canCancel ? View.VISIBLE : View.GONE);
            if (canCancel) {
                holder.btnCancel.setOnClickListener(v -> {
                    ApiClient.getService().cancelAppointment(appt.appointmentId)
                        .enqueue(new Callback<Map<String, Object>>() {
                            @Override
                            public void onResponse(Call<Map<String, Object>> call,
                                                   Response<Map<String, Object>> response) {
                                if (response.isSuccessful()) {
                                    appt.status = "CANCELLED";
                                    notifyItemChanged(position);
                                    Toast.makeText(context, "Appointment cancelled.", Toast.LENGTH_SHORT).show();
                                }
                            }
                            @Override public void onFailure(Call<Map<String, Object>> call, Throwable t) {
                                Toast.makeText(context, "Failed to cancel", Toast.LENGTH_SHORT).show();
                            }
                        });
                });
            }
        }
    }

    @Override
    public int getItemCount() { return items.size(); }

    private static int statusBarColor(String status) {
        switch (status != null ? status : "") {
            case "CONFIRMED":            return 0xFF2E7D32;
            case "COMPLETED":            return 0xFF1565C0;
            case "CANCELLED":            return 0xFFC62828;
            case "NO_SHOW":              return 0xFF6D4C41;
            default:                     return 0xFFE65100; // PENDING_CONFIRMATION
        }
    }

    private static String formatStatus(String status) {
        if (status == null) return "";
        switch (status) {
            case "CONFIRMED":            return "Confirmed";
            case "COMPLETED":            return "Completed";
            case "CANCELLED":            return "Cancelled";
            case "NO_SHOW":              return "No Show";
            case "PENDING_CONFIRMATION": return "Pending";
            default:                     return status.replace("_", " ");
        }
    }

    private static void applyStatusChip(TextView tv, String status) {
        int textColor, bgColor;
        switch (status != null ? status : "") {
            case "CONFIRMED":
                textColor = 0xFF2E7D32; bgColor = 0xFFE8F5E9; break;
            case "COMPLETED":
                textColor = 0xFF1565C0; bgColor = 0xFFE3F2FD; break;
            case "CANCELLED":
                textColor = 0xFFC62828; bgColor = 0xFFFFEBEE; break;
            case "NO_SHOW":
                textColor = 0xFF6D4C41; bgColor = 0xFFEFEBE9; break;
            default: // PENDING_CONFIRMATION
                textColor = 0xFFE65100; bgColor = 0xFFFFF3E0; break;
        }
        tv.setTextColor(textColor);
        GradientDrawable chip = new GradientDrawable();
        chip.setShape(GradientDrawable.RECTANGLE);
        chip.setCornerRadius(40f);
        chip.setColor(bgColor);
        tv.setBackground(chip);
        tv.setPadding(20, 6, 20, 6);
    }

    public static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvPatient, tvTime, tvToken, tvStatus, tvType;
        Button   btnConfirm, btnComplete, btnCancel;
        View     viewStatusBar;

        ViewHolder(View v) {
            super(v);
            tvPatient     = v.findViewById(R.id.tv_patient);
            tvTime        = v.findViewById(R.id.tv_time);
            tvToken       = v.findViewById(R.id.tv_token);
            tvStatus      = v.findViewById(R.id.tv_status);
            tvType        = v.findViewById(R.id.tv_type);
            btnConfirm    = v.findViewById(R.id.btn_confirm);
            btnComplete   = v.findViewById(R.id.btn_complete);
            btnCancel     = v.findViewById(R.id.btn_cancel);
            viewStatusBar = v.findViewById(R.id.view_status_bar);
        }
    }
}
