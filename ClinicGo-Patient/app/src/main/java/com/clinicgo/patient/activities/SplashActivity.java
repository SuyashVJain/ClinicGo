package com.clinicgo.patient.activities;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;

import androidx.appcompat.app.AppCompatActivity;

import com.clinicgo.patient.R;
import com.clinicgo.patient.utils.SessionManager;

public class SplashActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash);

        new Handler().postDelayed(() -> {
            SessionManager session = new SessionManager(this);
            Intent intent;
            if (session.isLoggedIn()) {
                intent = new Intent(this, HomeActivity.class);
            } else {
                intent = new Intent(this, LoginActivity.class);
            }
            startActivity(intent);
            finish();
        }, 1500);
    }
}
