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

import java.util.ArrayList;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class QueueFragment extends Fragment {

    private AppointmentAdapter adapter;
    private TextView tvSummary;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_queue, container, false);

        tvSummary = view.findViewById(R.id.tv_summary);
        RecyclerView rv = view.findViewById(R.id.rv_queue);
        adapter = new AppointmentAdapter(new ArrayList<>(), requireContext(), false);
        rv.setLayoutManager(new LinearLayoutManager(requireContext()));
        rv.setAdapter(adapter);

        loadQueue();

        view.findViewById(R.id.btn_refresh).setOnClickListener(v -> loadQueue());

        return view;
    }

    private void loadQueue() {
        ApiClient.getService().getTodayQueue(1).enqueue(new Callback<QueueModel>() {
            @Override
            public void onResponse(Call<QueueModel> call, Response<QueueModel> response) {
                if (response.isSuccessful() && response.body() != null) {
                    QueueModel q = response.body();
                    if (q.queue != null) adapter.updateData(q.queue);
                    tvSummary.setText("Total: " + q.total
                        + "  |  Done: " + q.completed
                        + "  |  Waiting: " + q.waiting);
                }
            }
            @Override public void onFailure(Call<QueueModel> call, Throwable t) {}
        });
    }
}
