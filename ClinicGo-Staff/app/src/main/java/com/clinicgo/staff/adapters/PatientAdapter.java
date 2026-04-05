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
import com.clinicgo.staff.models.PatientModel;
import com.clinicgo.staff.network.ApiClient;

import java.util.List;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class PatientAdapter extends RecyclerView.Adapter<PatientAdapter.ViewHolder> {

    private List<PatientModel> items;
    private final Context context;
    private final boolean isPendingView;

    public PatientAdapter(List<PatientModel> items, Context context, boolean isPendingView) {
        this.items         = items;
        this.context       = context;
        this.isPendingView = isPendingView;
    }

    public void updateData(List<PatientModel> data) {
        this.items = data;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_patient, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        PatientModel patient = items.get(position);
        holder.tvName.setText(patient.name);
        holder.tvEmail.setText(patient.email);
        holder.tvPhone.setText(patient.phone != null ? patient.phone : "");

        if (isPendingView && holder.btnApprove != null) {
            holder.btnApprove.setVisibility(View.VISIBLE);
            holder.btnApprove.setOnClickListener(v -> {
                ApiClient.getService().approvePatient(patient.userId)
                    .enqueue(new Callback<Map<String, Object>>() {
                        @Override
                        public void onResponse(Call<Map<String, Object>> call,
                                               Response<Map<String, Object>> response) {
                            if (response.isSuccessful()) {
                                items.remove(position);
                                notifyItemRemoved(position);
                                Toast.makeText(context,
                                    patient.name + " approved!", Toast.LENGTH_SHORT).show();
                            }
                        }
                        @Override public void onFailure(Call<Map<String, Object>> call, Throwable t) {}
                    });
            });
        } else if (holder.btnApprove != null) {
            holder.btnApprove.setVisibility(View.GONE);
        }
    }

    @Override
    public int getItemCount() { return items.size(); }

    public static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvName, tvEmail, tvPhone;
        Button   btnApprove;
        ViewHolder(View v) {
            super(v);
            tvName     = v.findViewById(R.id.tv_name);
            tvEmail    = v.findViewById(R.id.tv_email);
            tvPhone    = v.findViewById(R.id.tv_phone);
            btnApprove = v.findViewById(R.id.btn_approve);
        }
    }
}
