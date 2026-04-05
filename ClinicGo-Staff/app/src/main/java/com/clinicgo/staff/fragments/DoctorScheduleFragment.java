package com.clinicgo.staff.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.clinicgo.staff.R;
import com.clinicgo.staff.adapters.AppointmentAdapter;
import com.clinicgo.staff.models.AppointmentModel;
import com.clinicgo.staff.network.ApiClient;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class DoctorScheduleFragment extends Fragment {

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_schedule, container, false);
        RecyclerView rv = view.findViewById(R.id.rv_appointments);
        AppointmentAdapter adapter = new AppointmentAdapter(new ArrayList<>(), requireContext(), true);
        rv.setLayoutManager(new LinearLayoutManager(requireContext()));
        rv.setAdapter(adapter);

        ApiClient.getService().getTodaySchedule(1).enqueue(new Callback<List<AppointmentModel>>() {
            @Override
            public void onResponse(Call<List<AppointmentModel>> call, Response<List<AppointmentModel>> response) {
                if (response.isSuccessful() && response.body() != null)
                    adapter.updateData(response.body());
            }
            @Override public void onFailure(Call<List<AppointmentModel>> call, Throwable t) {}
        });

        return view;
    }
}
