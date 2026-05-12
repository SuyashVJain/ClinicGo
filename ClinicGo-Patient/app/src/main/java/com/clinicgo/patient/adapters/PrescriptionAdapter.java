package com.clinicgo.patient.adapters;

import android.graphics.Typeface;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.clinicgo.patient.R;
import com.clinicgo.patient.models.MedicineModel;
import com.clinicgo.patient.models.PrescriptionModel;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class PrescriptionAdapter extends RecyclerView.Adapter<PrescriptionAdapter.ViewHolder> {

    private List<PrescriptionModel> prescriptions;
    private final Set<Integer> expandedPositions = new HashSet<>();

    public PrescriptionAdapter(List<PrescriptionModel> prescriptions) {
        this.prescriptions = prescriptions;
    }

    public void updateData(List<PrescriptionModel> data) {
        this.prescriptions = data;
        expandedPositions.clear();
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

        holder.tvDoctor.setText(p.doctorName != null ? p.doctorName : "");
        holder.tvDiagnosis.setText(p.diagnosis != null ? p.diagnosis : "");
        holder.tvDate.setText(p.createdAt != null && p.createdAt.length() >= 10
            ? p.createdAt.substring(0, 10) : "");

        int count = p.medicines != null ? p.medicines.size() : 0;
        holder.tvMedicines.setText(count + (count == 1 ? " medicine prescribed" : " medicines prescribed"));

        boolean expanded = expandedPositions.contains(position);
        holder.tvExpandIcon.setText(expanded ? "▲" : "▼");
        holder.llMedicinesDetail.setVisibility(expanded ? View.VISIBLE : View.GONE);
        holder.tvFollowUp.setVisibility(View.GONE);

        if (expanded) {
            buildMedicineRows(holder, p);
            String followUp = p.followUpInstructions;
            if (followUp != null && !followUp.trim().isEmpty()) {
                holder.tvFollowUp.setText("Follow-up: " + followUp);
                holder.tvFollowUp.setVisibility(View.VISIBLE);
            }
        }

        holder.llMedicineHeader.setOnClickListener(v -> {
            int pos = holder.getAdapterPosition();
            if (expandedPositions.contains(pos)) expandedPositions.remove(pos);
            else                                  expandedPositions.add(pos);
            notifyItemChanged(pos);
        });
    }

    private void buildMedicineRows(ViewHolder holder, PrescriptionModel p) {
        holder.llMedicinesDetail.removeAllViews();
        if (p.medicines == null || p.medicines.isEmpty()) return;

        for (int i = 0; i < p.medicines.size(); i++) {
            MedicineModel med = p.medicines.get(i);

            LinearLayout row = new LinearLayout(holder.itemView.getContext());
            row.setOrientation(LinearLayout.VERTICAL);
            int pad = dpToPx(holder, 8);
            row.setPadding(pad, dpToPx(holder, 6), pad, dpToPx(holder, 6));

            TextView tvName = new TextView(holder.itemView.getContext());
            tvName.setText("• " + (med.medicineName != null ? med.medicineName : ""));
            tvName.setTextSize(13f);
            tvName.setTypeface(null, Typeface.BOLD);
            tvName.setTextColor(0xFF212121);
            row.addView(tvName);

            StringBuilder detail = new StringBuilder();
            if (med.dosage    != null && !med.dosage.isEmpty())    detail.append(med.dosage);
            if (med.frequency != null && !med.frequency.isEmpty()) {
                if (detail.length() > 0) detail.append("  ·  ");
                detail.append(med.frequency);
            }
            if (med.duration  != null && !med.duration.isEmpty()) {
                if (detail.length() > 0) detail.append("  ·  ");
                detail.append(med.duration);
            }
            if (detail.length() > 0) {
                TextView tvDetail = new TextView(holder.itemView.getContext());
                tvDetail.setText(detail.toString());
                tvDetail.setTextSize(11.5f);
                tvDetail.setTextColor(0xFF757575);
                LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT);
                lp.topMargin = dpToPx(holder, 2);
                tvDetail.setLayoutParams(lp);
                row.addView(tvDetail);
            }

            holder.llMedicinesDetail.addView(row);

            if (i < p.medicines.size() - 1) {
                View divider = new View(holder.itemView.getContext());
                divider.setBackgroundColor(0xFFE0E0E0);
                LinearLayout.LayoutParams dp = new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT, 1);
                dp.topMargin = dpToPx(holder, 2);
                divider.setLayoutParams(dp);
                holder.llMedicinesDetail.addView(divider);
            }
        }
    }

    private static int dpToPx(ViewHolder holder, int dp) {
        float d = holder.itemView.getContext().getResources().getDisplayMetrics().density;
        return Math.round(dp * d);
    }

    @Override
    public int getItemCount() { return prescriptions.size(); }

    public static class ViewHolder extends RecyclerView.ViewHolder {
        TextView     tvDoctor, tvDiagnosis, tvDate, tvMedicines, tvExpandIcon, tvFollowUp;
        LinearLayout llMedicineHeader, llMedicinesDetail;

        ViewHolder(View itemView) {
            super(itemView);
            tvDoctor          = itemView.findViewById(R.id.tv_doctor);
            tvDiagnosis       = itemView.findViewById(R.id.tv_diagnosis);
            tvDate            = itemView.findViewById(R.id.tv_date);
            tvMedicines       = itemView.findViewById(R.id.tv_medicines);
            tvExpandIcon      = itemView.findViewById(R.id.tv_expand_icon);
            tvFollowUp        = itemView.findViewById(R.id.tv_follow_up);
            llMedicineHeader  = itemView.findViewById(R.id.ll_medicine_header);
            llMedicinesDetail = itemView.findViewById(R.id.ll_medicines_detail);
        }
    }
}
