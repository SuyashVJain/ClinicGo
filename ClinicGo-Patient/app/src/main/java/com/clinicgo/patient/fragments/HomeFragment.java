package com.clinicgo.patient.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

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

public class HomeFragment extends Fragment {

    private TextView tvGreeting, tvStatus;
    private RecyclerView rvUpcoming;
    private AppointmentAdapter adapter;
    private SessionManager session;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_home, container, false);

        session    = new SessionManager(requireContext());
        tvGreeting = view.findViewById(R.id.tv_greeting);
        tvStatus   = view.findViewById(R.id.tv_status);
        rvUpcoming = view.findViewById(R.id.rv_upcoming);

        tvGreeting.setText("Good morning,\n" + session.getName());

        String status = session.getStatus();
        if ("PENDING".equals(status)) {
            tvStatus.setVisibility(View.VISIBLE);
            tvStatus.setText("Your account is pending approval by the receptionist.");
        } else {
            tvStatus.setVisibility(View.GONE);
        }

        // Setup RecyclerView
        adapter = new AppointmentAdapter(new ArrayList<>(), requireContext());
        rvUpcoming.setLayoutManager(new LinearLayoutManager(requireContext()));
        rvUpcoming.setAdapter(adapter);

        loadUpcomingAppointments();

        // Quick book button
        view.findViewById(R.id.btn_quick_book).setOnClickListener(v -> {
            getParentFragmentManager()
                .beginTransaction()
                .replace(R.id.fragment_container, new AppointmentsFragment())
                .commit();
        });

        return view;
    }

    private void loadUpcomingAppointments() {
        int patientId = session.getUserId();
        ApiClient.getService().getPatientAppointments(patientId)
            .enqueue(new Callback<List<AppointmentModel>>() {
                @Override
                public void onResponse(Call<List<AppointmentModel>> call,
                                       Response<List<AppointmentModel>> response) {
                    if (response.isSuccessful() && response.body() != null) {
                        List<AppointmentModel> all = response.body();
                        // Show only upcoming (CONFIRMED or PENDING)
                        List<AppointmentModel> upcoming = new ArrayList<>();
                        for (AppointmentModel a : all) {
                            if ("CONFIRMED".equals(a.status) ||
                                "PENDING_CONFIRMATION".equals(a.status)) {
                                upcoming.add(a);
                            }
                        }
                        adapter.updateData(upcoming);
                    }
                }

                @Override
                public void onFailure(Call<List<AppointmentModel>> call, Throwable t) {}
            });
    }
}
