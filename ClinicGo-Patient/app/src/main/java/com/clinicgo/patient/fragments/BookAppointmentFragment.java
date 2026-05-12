package com.clinicgo.patient.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.clinicgo.patient.R;
import com.clinicgo.patient.adapters.SlotAdapter;
import com.clinicgo.patient.models.AppointmentModel;
import com.clinicgo.patient.models.SlotModel;
import com.clinicgo.patient.network.ApiClient;
import com.clinicgo.patient.utils.SessionManager;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TimeZone;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class BookAppointmentFragment extends Fragment {

    private static final int DOCTOR_ID = 1; // Dr. Anil Mehta (seeded)

    private RecyclerView rvSlots;
    private SlotAdapter  slotAdapter;
    private TextView     tvDate, tvDoctorName, tvFee;
    private Button       btnBook, btnPrevDay, btnNextDay;
    private String       selectedDate;
    private String       selectedSlot;
    private SessionManager session;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_book_appointment, container, false);

        session       = new SessionManager(requireContext());
        tvDate        = view.findViewById(R.id.tv_date);
        tvDoctorName  = view.findViewById(R.id.tv_doctor_name);
        tvFee         = view.findViewById(R.id.tv_fee);
        btnBook       = view.findViewById(R.id.btn_confirm_book);
        btnPrevDay    = view.findViewById(R.id.btn_prev_day);
        btnNextDay    = view.findViewById(R.id.btn_next_day);
        rvSlots       = view.findViewById(R.id.rv_slots);

        tvDoctorName.setText("Dr. Anil Mehta — General Physician");
        tvFee.setText("Consultation Fee: ₹300");

        // Set today as default date
        selectedDate = getTodayDate();
        tvDate.setText(selectedDate);

        rvSlots.setLayoutManager(new GridLayoutManager(requireContext(), 3));
        slotAdapter = new SlotAdapter(slot -> {
            selectedSlot = slot.slotTime;
            btnBook.setEnabled(true);
        });
        rvSlots.setAdapter(slotAdapter);

        loadSlots();

        btnPrevDay.setOnClickListener(v -> changeDate(-1));
        btnNextDay.setOnClickListener(v -> changeDate(1));

        btnBook.setEnabled(false);
        btnBook.setOnClickListener(v -> bookAppointment());

        return view;
    }

    private void loadSlots() {
        ApiClient.getService()
            .getSlots(DOCTOR_ID, selectedDate)
            .enqueue(new Callback<List<SlotModel>>() {
                @Override
                public void onResponse(Call<List<SlotModel>> call,
                                       Response<List<SlotModel>> response) {
                    if (response.isSuccessful() && response.body() != null) {
                        slotAdapter.updateSlots(response.body());
                    }
                }

                @Override
                public void onFailure(Call<List<SlotModel>> call, Throwable t) {
                    Toast.makeText(requireContext(),
                        "Failed to load slots", Toast.LENGTH_SHORT).show();
                }
            });
    }

    private void bookAppointment() {
        if (selectedSlot == null) return;

        btnBook.setEnabled(false);
        btnBook.setText("Booking...");

        Map<String, Object> body = new HashMap<>();
        body.put("doctorId",        DOCTOR_ID);
        body.put("appointmentDate", selectedDate);
        body.put("slotTime",        selectedSlot);
        body.put("type",            "NEW");
        body.put("bookingChannel",  "ONLINE");

        ApiClient.getService().bookAppointment(body)
            .enqueue(new Callback<AppointmentModel>() {
                @Override
                public void onResponse(Call<AppointmentModel> call,
                                       Response<AppointmentModel> response) {
                    btnBook.setEnabled(true);
                    btnBook.setText("Confirm Booking");

                    if (response.isSuccessful() && response.body() != null) {
                        AppointmentModel appt = response.body();
                        // Navigate to payment screen
                        PaymentFragment payFrag = new PaymentFragment();
                        Bundle args = new Bundle();
                        args.putInt("appointmentId", appt.appointmentId);
                        args.putDouble("amount", 300.0); // Dr. Anil Mehta new patient fee
                        args.putString("doctorName", "Dr. Anil Mehta");
                        payFrag.setArguments(args);
                        requireActivity().getSupportFragmentManager()
                            .beginTransaction()
                            .replace(R.id.fragment_container, payFrag)
                            .addToBackStack(null)
                            .commit();
                    } else {
                        Toast.makeText(requireContext(),
                            "Slot no longer available. Please choose another.",
                            Toast.LENGTH_SHORT).show();
                        loadSlots();
                    }
                }

                @Override
                public void onFailure(Call<AppointmentModel> call, Throwable t) {
                    btnBook.setEnabled(true);
                    btnBook.setText("Confirm Booking");
                    Toast.makeText(requireContext(),
                        "Booking failed", Toast.LENGTH_SHORT).show();
                }
            });
    }

    private void changeDate(int days) {
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
            sdf.setTimeZone(TimeZone.getTimeZone("Asia/Kolkata"));
            Calendar cal = Calendar.getInstance(TimeZone.getTimeZone("Asia/Kolkata"));
            cal.setTime(sdf.parse(selectedDate));
            cal.add(Calendar.DAY_OF_MONTH, days);
            selectedDate = sdf.format(cal.getTime());
            tvDate.setText(selectedDate);
            selectedSlot = null;
            btnBook.setEnabled(false);
            loadSlots();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private String getTodayDate() {
        // Always use IST explicitly so the correct date is sent to the backend
        // even if the device clock is misconfigured or running in a different TZ.
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
        sdf.setTimeZone(TimeZone.getTimeZone("Asia/Kolkata"));
        return sdf.format(Calendar.getInstance(TimeZone.getTimeZone("Asia/Kolkata")).getTime());
    }
}
