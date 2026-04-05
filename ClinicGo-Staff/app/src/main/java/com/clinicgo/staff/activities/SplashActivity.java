package com.clinicgo.staff.activities;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;

import androidx.appcompat.app.AppCompatActivity;

import com.clinicgo.staff.R;
import com.clinicgo.staff.utils.SessionManager;

public class SplashActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash);
        new Handler().postDelayed(() -> {
            SessionManager session = new SessionManager(this);
            Intent intent = session.isLoggedIn()
                ? new Intent(this, HomeActivity.class)
                : new Intent(this, LoginActivity.class);
            startActivity(intent);
            finish();
        }, 1200);
    }
}
