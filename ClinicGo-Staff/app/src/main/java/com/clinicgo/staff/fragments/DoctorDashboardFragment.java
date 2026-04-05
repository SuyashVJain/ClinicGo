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
import com.clinicgo.staff.adapters.AppointmentAdapter;
import com.clinicgo.staff.models.QueueModel;
import com.clinicgo.staff.network.ApiClient;
import com.clinicgo.staff.utils.SessionManager;

import java.util.ArrayList;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class DoctorDashboardFragment extends Fragment {

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_doctor_dashboard, container, false);
        SessionManager session = new SessionManager(requireContext());

        TextView tvGreeting = view.findViewById(R.id.tv_greeting);
        TextView tvTotal    = view.findViewById(R.id.tv_total);
        TextView tvDone     = view.findViewById(R.id.tv_done);
        RecyclerView rv     = view.findViewById(R.id.rv_queue);

        tvGreeting.setText("Good morning,\n" + session.getName());

        AppointmentAdapter adapter = new AppointmentAdapter(new ArrayList<>(), requireContext(), true);
        rv.setLayoutManager(new LinearLayoutManager(requireContext()));
        rv.setAdapter(adapter);

        ApiClient.getService().getTodayQueue(1).enqueue(new Callback<QueueModel>() {
            @Override
            public void onResponse(Call<QueueModel> call, Response<QueueModel> response) {
                if (response.isSuccessful() && response.body() != null) {
                    QueueModel q = response.body();
                    if (q.queue != null) adapter.updateData(q.queue);
                    if (tvTotal != null) tvTotal.setText(String.valueOf(q.total));
                    if (tvDone  != null) tvDone.setText(String.valueOf(q.completed));
                }
            }
            @Override public void onFailure(Call<QueueModel> call, Throwable t) {}
        });

        return view;
    }
}
