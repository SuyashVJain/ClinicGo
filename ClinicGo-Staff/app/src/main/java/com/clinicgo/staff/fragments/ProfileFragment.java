package com.clinicgo.staff.fragments;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.fragment.app.Fragment;

import com.clinicgo.staff.R;
import com.clinicgo.staff.activities.LoginActivity;
import com.clinicgo.staff.utils.SessionManager;

public class ProfileFragment extends Fragment {

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_profile, container, false);
        SessionManager session = new SessionManager(requireContext());

        ((TextView) view.findViewById(R.id.tv_name)).setText(session.getName());
        ((TextView) view.findViewById(R.id.tv_email)).setText(session.getEmail());
        ((TextView) view.findViewById(R.id.tv_role)).setText(session.getRole());

        view.findViewById(R.id.btn_logout).setOnClickListener(v -> {
            session.clearSession();
            Intent intent = new Intent(requireContext(), LoginActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
        });

        return view;
    }
}
