package com.clinicgo.staff.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import android.widget.ScrollView;

import androidx.fragment.app.Fragment;

import com.clinicgo.staff.R;
import com.clinicgo.staff.models.PrescriptionModel;
import com.clinicgo.staff.network.ApiClient;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class PrescriptionWriterFragment extends Fragment {

    private EditText etAppointmentId, etDiagnosis, etFollowUp;
    private LinearLayout medicinesContainer;
    private View btnAddMedicine;
    private Button btnSubmit;
    private TextView tvPatientHeader;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_prescription_writer, container, false);

        etAppointmentId    = view.findViewById(R.id.et_appointment_id);
        etDiagnosis        = view.findViewById(R.id.et_diagnosis);
        etFollowUp         = view.findViewById(R.id.et_follow_up);
        medicinesContainer = view.findViewById(R.id.medicines_container);
        btnAddMedicine     = view.findViewById(R.id.btn_add_medicine);
        btnSubmit          = view.findViewById(R.id.btn_submit_prescription);
        tvPatientHeader    = view.findViewById(R.id.tv_patient_header);

        // Pre-fill appointment ID and patient name if launched from an appointment card
        if (getArguments() != null) {
            int prefilledId = getArguments().getInt("appointmentId", 0);
            if (prefilledId > 0) {
                etAppointmentId.setText(String.valueOf(prefilledId));
                etAppointmentId.setEnabled(false);
            }
            String patientName = getArguments().getString("patientName", "");
            if (tvPatientHeader != null && !patientName.isEmpty()) {
                tvPatientHeader.setText("Writing for: " + patientName);
                tvPatientHeader.setVisibility(View.VISIBLE);
            }
        }

        // Add first medicine row by default
        addMedicineRow();

        btnAddMedicine.setOnClickListener(v -> addMedicineRow());
        btnSubmit.setOnClickListener(v -> submitPrescription());

        return view;
    }

    private void addMedicineRow() {
        View row = LayoutInflater.from(requireContext())
            .inflate(R.layout.item_medicine_input, medicinesContainer, false);
        medicinesContainer.addView(row);
    }

    private void submitPrescription() {
        String apptIdStr = etAppointmentId.getText().toString().trim();
        String diagnosis = etDiagnosis.getText().toString().trim();
        String followUp  = etFollowUp.getText().toString().trim();

        if (apptIdStr.isEmpty() || diagnosis.isEmpty()) {
            Toast.makeText(requireContext(), "Appointment ID and diagnosis are required",
                Toast.LENGTH_SHORT).show();
            return;
        }

        // Collect medicines
        List<Map<String, String>> medicines = new ArrayList<>();
        for (int i = 0; i < medicinesContainer.getChildCount(); i++) {
            View row = medicinesContainer.getChildAt(i);
            EditText etName  = row.findViewById(R.id.et_medicine_name);
            EditText etDose  = row.findViewById(R.id.et_dosage);
            EditText etFreq  = row.findViewById(R.id.et_frequency);
            EditText etDur   = row.findViewById(R.id.et_duration);

            String name = etName.getText().toString().trim();
            if (!name.isEmpty()) {
                Map<String, String> med = new HashMap<>();
                med.put("medicineName", name);
                med.put("dosage",       etDose.getText().toString().trim());
                med.put("frequency",    etFreq.getText().toString().trim());
                med.put("duration",     etDur.getText().toString().trim());
                medicines.add(med);
            }
        }

        Map<String, Object> body = new HashMap<>();
        body.put("appointmentId",        Integer.parseInt(apptIdStr));
        body.put("diagnosis",            diagnosis);
        body.put("followUpInstructions", followUp);
        body.put("medicines",            medicines);

        btnSubmit.setEnabled(false);
        btnSubmit.setText("Submitting...");

        ApiClient.getService().createPrescription(body).enqueue(new Callback<PrescriptionModel>() {
            @Override
            public void onResponse(Call<PrescriptionModel> call, Response<PrescriptionModel> response) {
                btnSubmit.setEnabled(true);
                btnSubmit.setText("Submit Prescription");
                if (response.isSuccessful()) {
                    Toast.makeText(requireContext(),
                        "Prescription sent to patient! ✓", Toast.LENGTH_LONG).show();
                    // Navigate back to where we came from
                    requireActivity().getSupportFragmentManager().popBackStack();
                } else {
                    Toast.makeText(requireContext(),
                        "Failed to submit. Check appointment ID.", Toast.LENGTH_SHORT).show();
                }
            }
            @Override
            public void onFailure(Call<PrescriptionModel> call, Throwable t) {
                btnSubmit.setEnabled(true);
                btnSubmit.setText("Submit Prescription");
                Toast.makeText(requireContext(), "Connection failed", Toast.LENGTH_SHORT).show();
            }
        });
    }
}
