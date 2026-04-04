package com.clinicgo.patient.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.clinicgo.patient.R;
import com.clinicgo.patient.models.PrescriptionModel;

import java.util.List;

public class PrescriptionAdapter extends RecyclerView.Adapter<PrescriptionAdapter.ViewHolder> {

    private List<PrescriptionModel> prescriptions;

    public PrescriptionAdapter(List<PrescriptionModel> prescriptions) {
        this.prescriptions = prescriptions;
    }

    public void updateData(List<PrescriptionModel> data) {
        this.prescriptions = data;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
            .inflate(R.layout.item_prescription, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        PrescriptionModel p = prescriptions.get(position);
        holder.tvDoctor.setText(p.doctorName);
        holder.tvDiagnosis.setText(p.diagnosis);
        holder.tvDate.setText(p.createdAt != null && p.createdAt.length() >= 10
            ? p.createdAt.substring(0, 10) : "");
        holder.tvMedicines.setText(p.medicines != null
            ? p.medicines.size() + " medicines prescribed" : "");
    }

    @Override
    public int getItemCount() { return prescriptions.size(); }

    public static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvDoctor, tvDiagnosis, tvDate, tvMedicines;
        ViewHolder(View itemView) {
            super(itemView);
            tvDoctor    = itemView.findViewById(R.id.tv_doctor);
            tvDiagnosis = itemView.findViewById(R.id.tv_diagnosis);
            tvDate      = itemView.findViewById(R.id.tv_date);
            tvMedicines = itemView.findViewById(R.id.tv_medicines);
        }
    }
}
