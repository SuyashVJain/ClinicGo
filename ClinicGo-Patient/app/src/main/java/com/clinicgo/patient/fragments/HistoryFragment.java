package com.clinicgo.patient.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.clinicgo.patient.R;
import com.clinicgo.patient.adapters.PrescriptionAdapter;
import com.clinicgo.patient.models.PrescriptionModel;
import com.clinicgo.patient.network.ApiClient;
import com.clinicgo.patient.utils.SessionManager;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class HistoryFragment extends Fragment {

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_history, container, false);
        SessionManager session = new SessionManager(requireContext());

        RecyclerView rv = view.findViewById(R.id.rv_prescriptions);
        PrescriptionAdapter adapter = new PrescriptionAdapter(new ArrayList<>());
        rv.setLayoutManager(new LinearLayoutManager(requireContext()));
        rv.setAdapter(adapter);

        ApiClient.getService()
            .getPatientPrescriptions(session.getUserId())
            .enqueue(new Callback<List<PrescriptionModel>>() {
                @Override
                public void onResponse(Call<List<PrescriptionModel>> call,
                                       Response<List<PrescriptionModel>> response) {
                    if (response.isSuccessful() && response.body() != null)
                        adapter.updateData(response.body());
                }
                @Override
                public void onFailure(Call<List<PrescriptionModel>> call, Throwable t) {}
            });

        return view;
    }
}
