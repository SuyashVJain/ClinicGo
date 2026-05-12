package com.clinicgo.patient.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.fragment.app.Fragment;

import com.clinicgo.patient.R;
import com.clinicgo.patient.models.PaymentModel;
import com.clinicgo.patient.network.ApiClient;

import java.util.HashMap;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class PaymentFragment extends Fragment {

    private int    appointmentId;
    private double amount;
    private String doctorName;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_payment, container, false);

        if (getArguments() != null) {
            appointmentId = getArguments().getInt("appointmentId", 0);
            amount        = getArguments().getDouble("amount", 0.0);
            doctorName    = getArguments().getString("doctorName", "Doctor");
        }

        TextView tvDoctor  = view.findViewById(R.id.tv_payment_doctor);
        TextView tvAmount  = view.findViewById(R.id.tv_payment_amount);
        TextView tvApptId  = view.findViewById(R.id.tv_payment_appt_id);
        Button   btnPay    = view.findViewById(R.id.btn_pay);
        Button   btnCancel = view.findViewById(R.id.btn_cancel_payment);

        tvDoctor.setText(doctorName.startsWith("Dr") ? doctorName : "Dr. " + doctorName);
        tvAmount.setText("₹" + (int) amount);
        tvApptId.setText("Appointment #" + appointmentId);
        btnPay.setText("Pay ₹" + (int) amount + " with UPI");

        btnPay.setOnClickListener(v -> initiatePayment(btnPay));

        btnCancel.setOnClickListener(v -> {
            // Cancel the appointment then go back
            ApiClient.getService().cancelAppointment(appointmentId)
                .enqueue(new Callback<Map<String, Object>>() {
                    @Override
                    public void onResponse(Call<Map<String, Object>> call,
                                           Response<Map<String, Object>> response) {
                        Toast.makeText(requireContext(),
                            "Booking cancelled.", Toast.LENGTH_SHORT).show();
                        navigateToHome();
                    }
                    @Override
                    public void onFailure(Call<Map<String, Object>> call, Throwable t) {
                        navigateToHome();
                    }
                });
        });

        return view;
    }

    private void initiatePayment(Button btnPay) {
        if (appointmentId <= 0) {
            Toast.makeText(requireContext(), "Invalid appointment", Toast.LENGTH_SHORT).show();
            return;
        }

        btnPay.setEnabled(false);
        btnPay.setText("Processing...");

        Map<String, Object> body = new HashMap<>();
        body.put("appointmentId", appointmentId);
        body.put("method",        "UPI");

        ApiClient.getService().initiatePayment(body)
            .enqueue(new Callback<PaymentModel>() {
                @Override
                public void onResponse(Call<PaymentModel> call,
                                       Response<PaymentModel> response) {
                    if (!isAdded()) return;
                    if (response.isSuccessful() && response.body() != null) {
                        Toast.makeText(requireContext(),
                            "Payment successful! ₹" + (int) amount + " paid. Appointment confirmed.",
                            Toast.LENGTH_LONG).show();
                        navigateToHome();
                    } else {
                        btnPay.setEnabled(true);
                        btnPay.setText("Pay ₹" + (int) amount + " with UPI");
                        Toast.makeText(requireContext(),
                            "Payment failed. Please try again.", Toast.LENGTH_SHORT).show();
                    }
                }

                @Override
                public void onFailure(Call<PaymentModel> call, Throwable t) {
                    if (!isAdded()) return;
                    btnPay.setEnabled(true);
                    btnPay.setText("Pay ₹" + (int) amount + " with UPI");
                    Toast.makeText(requireContext(),
                        "Connection failed. Please try again.", Toast.LENGTH_SHORT).show();
                }
            });
    }

    private void navigateToHome() {
        if (!isAdded()) return;
        // Pop the entire backstack back to home
        requireActivity().getSupportFragmentManager()
            .popBackStack(null, androidx.fragment.app.FragmentManager.POP_BACK_STACK_INCLUSIVE);
    }
}
