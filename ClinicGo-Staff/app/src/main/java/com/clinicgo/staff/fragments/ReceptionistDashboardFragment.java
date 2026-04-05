package com.clinicgo.staff.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.clinicgo.staff.R;
import com.clinicgo.staff.adapters.PatientAdapter;
import com.clinicgo.staff.models.PatientModel;
import com.clinicgo.staff.network.ApiClient;
import com.clinicgo.staff.utils.SessionManager;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ReceptionistDashboardFragment extends Fragment {

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_receptionist_dashboard, container, false);
        SessionManager session = new SessionManager(requireContext());

        TextView tvGreeting    = view.findViewById(R.id.tv_greeting);
        TextView tvPendingCount = view.findViewById(R.id.tv_pending_count);
        RecyclerView rv        = view.findViewById(R.id.rv_pending);

        tvGreeting.setText("Good morning,\n" + session.getName());

        PatientAdapter adapter = new PatientAdapter(new ArrayList<>(), requireContext(), true);
        rv.setLayoutManager(new LinearLayoutManager(requireContext()));
        rv.setAdapter(adapter);

        ApiClient.getService().getPendingPatients().enqueue(new Callback<List<PatientModel>>() {
            @Override
            public void onResponse(Call<List<PatientModel>> call, Response<List<PatientModel>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<PatientModel> pending = response.body();
                    adapter.updateData(pending);
                    tvPendingCount.setText(pending.size() + " pending approval");
                }
            }
            @Override public void onFailure(Call<List<PatientModel>> call, Throwable t) {}
        });

        return view;
    }
}
