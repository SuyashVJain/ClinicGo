package com.clinicgo.patient.activities;

import android.content.Intent;
import android.os.Bundle;

import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;

import com.clinicgo.patient.R;
import com.clinicgo.patient.fragments.AppointmentsFragment;
import com.clinicgo.patient.fragments.HomeFragment;
import com.clinicgo.patient.fragments.MessagesFragment;
import com.clinicgo.patient.fragments.HistoryFragment;
import com.clinicgo.patient.fragments.ProfileFragment;
import com.clinicgo.patient.utils.SessionManager;
import com.google.android.material.bottomnavigation.BottomNavigationView;

public class HomeActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Redirect to login if not logged in
        SessionManager session = new SessionManager(this);
        if (!session.isLoggedIn()) {
            startActivity(new Intent(this, LoginActivity.class));
            finish();
            return;
        }

        setContentView(R.layout.activity_home);

        BottomNavigationView bottomNav = findViewById(R.id.bottom_navigation);

        // Load home fragment by default
        loadFragment(new HomeFragment());

        bottomNav.setOnItemSelectedListener(item -> {
            Fragment fragment;
            int id = item.getItemId();

            if (id == R.id.nav_home) {
                fragment = new HomeFragment();
            } else if (id == R.id.nav_appointments) {
                fragment = new AppointmentsFragment();
            } else if (id == R.id.nav_messages) {
                fragment = new MessagesFragment();
            } else if (id == R.id.nav_history) {
                fragment = new HistoryFragment();
            } else if (id == R.id.nav_profile) {
                fragment = new ProfileFragment();
            } else {
                fragment = new HomeFragment();
            }

            return loadFragment(fragment);
        });
    }

    private boolean loadFragment(Fragment fragment) {
        getSupportFragmentManager()
            .beginTransaction()
            .replace(R.id.fragment_container, fragment)
            .commit();
        return true;
    }
}
