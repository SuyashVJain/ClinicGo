package com.clinicgo.patient.fragments;

import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
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

    private static final String FILTER_ALL       = "ALL";
    private static final String FILTER_UPCOMING  = "UPCOMING";
    private static final String FILTER_COMPLETED = "COMPLETED";
    private static final String FILTER_CANCELLED = "CANCELLED";

    private RecyclerView rvAppointments;
    private AppointmentAdapter adapter;
    private SessionManager session;
    private Button btnBookNew;
    private TextView chipAll, chipUpcoming, chipCompleted, chipCancelled;

    private List<AppointmentModel> allAppointments = new ArrayList<>();
    private String activeFilter = FILTER_ALL;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_appointments, container, false);

        session         = new SessionManager(requireContext());
        rvAppointments  = view.findViewById(R.id.rv_appointments);
        btnBookNew      = view.findViewById(R.id.btn_book_new);
        chipAll         = view.findViewById(R.id.chip_all);
        chipUpcoming    = view.findViewById(R.id.chip_upcoming);
        chipCompleted   = view.findViewById(R.id.chip_completed);
        chipCancelled   = view.findViewById(R.id.chip_cancelled);

        adapter = new AppointmentAdapter(new ArrayList<>(), requireContext());
        rvAppointments.setLayoutManager(new LinearLayoutManager(requireContext()));
        rvAppointments.setAdapter(adapter);

        setupChips();
        loadAppointments();

        btnBookNew.setOnClickListener(v ->
            getParentFragmentManager()
                .beginTransaction()
                .replace(R.id.fragment_container, new BookAppointmentFragment())
                .addToBackStack(null)
                .commit());

        return view;
    }

    private void setupChips() {
        chipAll.setOnClickListener(v       -> selectFilter(FILTER_ALL));
        chipUpcoming.setOnClickListener(v  -> selectFilter(FILTER_UPCOMING));
        chipCompleted.setOnClickListener(v -> selectFilter(FILTER_COMPLETED));
        chipCancelled.setOnClickListener(v -> selectFilter(FILTER_CANCELLED));
        applyChipStyles(); // set initial selected state on "All"
    }

    private void selectFilter(String filter) {
        activeFilter = filter;
        applyChipStyles();
        applyFilter();
    }

    private void applyChipStyles() {
        styleChip(chipAll,       FILTER_ALL.equals(activeFilter));
        styleChip(chipUpcoming,  FILTER_UPCOMING.equals(activeFilter));
        styleChip(chipCompleted, FILTER_COMPLETED.equals(activeFilter));
        styleChip(chipCancelled, FILTER_CANCELLED.equals(activeFilter));
    }

    private void styleChip(TextView chip, boolean selected) {
        GradientDrawable bg = new GradientDrawable();
        bg.setShape(GradientDrawable.RECTANGLE);
        bg.setCornerRadius(40f);
        if (selected) {
            bg.setColor(0xFF1976D2);
            chip.setTextColor(0xFFFFFFFF);
        } else {
            bg.setColor(0xFFFFFFFF);
            bg.setStroke(2, 0xFF1976D2);
            chip.setTextColor(0xFF1976D2);
        }
        chip.setBackground(bg);
    }

    private void applyFilter() {
        List<AppointmentModel> filtered = new ArrayList<>();
        for (AppointmentModel a : allAppointments) {
            switch (activeFilter) {
                case FILTER_UPCOMING:
                    if ("CONFIRMED".equals(a.status) || "PENDING_CONFIRMATION".equals(a.status))
                        filtered.add(a);
                    break;
                case FILTER_COMPLETED:
                    if ("COMPLETED".equals(a.status)) filtered.add(a);
                    break;
                case FILTER_CANCELLED:
                    if ("CANCELLED".equals(a.status) || "NO_SHOW".equals(a.status))
                        filtered.add(a);
                    break;
                default: // ALL
                    filtered.add(a);
            }
        }
        adapter.updateData(filtered);
    }

    private void loadAppointments() {
        ApiClient.getService()
            .getPatientAppointments(session.getUserId())
            .enqueue(new Callback<List<AppointmentModel>>() {
                @Override
                public void onResponse(Call<List<AppointmentModel>> call,
                                       Response<List<AppointmentModel>> response) {
                    if (response.isSuccessful() && response.body() != null) {
                        allAppointments = response.body();
                        applyFilter();
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
