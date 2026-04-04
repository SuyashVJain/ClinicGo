package com.clinicgo.patient.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.Toast;

import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.clinicgo.patient.R;
import com.clinicgo.patient.adapters.AppointmentAdapter;
import com.clinicgo.patient.models.AppointmentModel;
import com.clinicgo.patient.network.ApiClient;
import com.clinicgo.patient.utils.SessionManager;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class AppointmentsFragment extends Fragment {

    private RecyclerView rvAppointments;
    private AppointmentAdapter adapter;
    private SessionManager session;
    private Button btnBookNew;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_appointments, container, false);

        session         = new SessionManager(requireContext());
        rvAppointments  = view.findViewById(R.id.rv_appointments);
        btnBookNew      = view.findViewById(R.id.btn_book_new);

        adapter = new AppointmentAdapter(new ArrayList<>(), requireContext());
        rvAppointments.setLayoutManager(new LinearLayoutManager(requireContext()));
        rvAppointments.setAdapter(adapter);

        loadAppointments();

        btnBookNew.setOnClickListener(v -> {
            // Navigate to booking flow
            getParentFragmentManager()
                .beginTransaction()
                .replace(R.id.fragment_container, new BookAppointmentFragment())
                .addToBackStack(null)
                .commit();
        });

        return view;
    }

    private void loadAppointments() {
        ApiClient.getService()
            .getPatientAppointments(session.getUserId())
            .enqueue(new Callback<List<AppointmentModel>>() {
                @Override
                public void onResponse(Call<List<AppointmentModel>> call,
                                       Response<List<AppointmentModel>> response) {
                    if (response.isSuccessful() && response.body() != null) {
                        adapter.updateData(response.body());
                    }
                }

                @Override
                public void onFailure(Call<List<AppointmentModel>> call, Throwable t) {
                    Toast.makeText(requireContext(),
                        "Failed to load appointments", Toast.LENGTH_SHORT).show();
                }
            });
    }
}
