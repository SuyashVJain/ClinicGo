package com.clinicgo.staff.activities;

import android.content.Intent;
import android.os.Bundle;

import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;

import com.clinicgo.staff.R;
import com.clinicgo.staff.fragments.DoctorDashboardFragment;
import com.clinicgo.staff.fragments.DoctorScheduleFragment;
import com.clinicgo.staff.fragments.PrescriptionWriterFragment;
import com.clinicgo.staff.fragments.ReceptionistDashboardFragment;
import com.clinicgo.staff.fragments.QueueFragment;
import com.clinicgo.staff.fragments.AppointmentMgmtFragment;
import com.clinicgo.staff.fragments.ProfileFragment;
import com.clinicgo.staff.utils.SessionManager;
import com.google.android.material.bottomnavigation.BottomNavigationView;

public class HomeActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        SessionManager session = new SessionManager(this);
        if (!session.isLoggedIn()) {
            startActivity(new Intent(this, LoginActivity.class));
            finish();
            return;
        }
        setContentView(R.layout.activity_home);

        BottomNavigationView bottomNav = findViewById(R.id.bottom_navigation);
        String role = session.getRole();

        if ("DOCTOR".equals(role)) {
            bottomNav.inflateMenu(R.menu.doctor_nav_menu);
            loadFragment(new DoctorDashboardFragment());
            bottomNav.setOnItemSelectedListener(item -> {
                int id = item.getItemId();
                if (id == R.id.nav_home)         return loadFragment(new DoctorDashboardFragment());
                if (id == R.id.nav_schedule)     return loadFragment(new DoctorScheduleFragment());
                if (id == R.id.nav_prescription) return loadFragment(new PrescriptionWriterFragment());
                if (id == R.id.nav_profile)      return loadFragment(new ProfileFragment());
                return false;
            });
        } else {
            bottomNav.inflateMenu(R.menu.receptionist_nav_menu);
            loadFragment(new ReceptionistDashboardFragment());
            bottomNav.setOnItemSelectedListener(item -> {
                int id = item.getItemId();
                if (id == R.id.nav_home)         return loadFragment(new ReceptionistDashboardFragment());
                if (id == R.id.nav_queue)        return loadFragment(new QueueFragment());
                if (id == R.id.nav_appointments) return loadFragment(new AppointmentMgmtFragment());
                if (id == R.id.nav_profile)      return loadFragment(new ProfileFragment());
                return false;
            });
        }
    }

    private boolean loadFragment(Fragment fragment) {
        getSupportFragmentManager().beginTransaction()
            .replace(R.id.fragment_container, fragment).commit();
        return true;
    }
}
