package com.clinicgo.patient.fragments;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.fragment.app.Fragment;

import com.clinicgo.patient.R;
import com.clinicgo.patient.activities.LoginActivity;
import com.clinicgo.patient.utils.SessionManager;

public class ProfileFragment extends Fragment {

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_profile, container, false);
        SessionManager session = new SessionManager(requireContext());

        TextView tvName   = view.findViewById(R.id.tv_name);
        TextView tvEmail  = view.findViewById(R.id.tv_email);
        TextView tvStatus = view.findViewById(R.id.tv_status);

        tvName.setText(session.getName());
        tvEmail.setText(session.getEmail());
        tvStatus.setText("Status: " + session.getStatus());

        view.findViewById(R.id.btn_logout).setOnClickListener(v -> {
            session.clearSession();
            Intent intent = new Intent(requireContext(), LoginActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
        });

        return view;
    }
}
