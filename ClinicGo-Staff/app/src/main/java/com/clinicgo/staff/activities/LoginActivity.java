package com.clinicgo.staff.activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

import com.clinicgo.staff.R;
import com.clinicgo.staff.models.AuthResponse;
import com.clinicgo.staff.models.LoginRequest;
import com.clinicgo.staff.network.ApiClient;
import com.clinicgo.staff.utils.SessionManager;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LoginActivity extends AppCompatActivity {

    private EditText    etEmail, etPassword;
    private Button      btnLogin;
    private ProgressBar progressBar;
    private TextView    tvError;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        etEmail     = findViewById(R.id.et_email);
        etPassword  = findViewById(R.id.et_password);
        btnLogin    = findViewById(R.id.btn_login);
        progressBar = findViewById(R.id.progress_bar);
        tvError     = findViewById(R.id.tv_error);

        btnLogin.setOnClickListener(v -> attemptLogin());
    }

    private void attemptLogin() {
        String email    = etEmail.getText().toString().trim();
        String password = etPassword.getText().toString().trim();

        if (email.isEmpty() || password.isEmpty()) {
            showError("Please enter email and password");
            return;
        }

        tvError.setVisibility(View.GONE);
        btnLogin.setEnabled(false);
        progressBar.setVisibility(View.VISIBLE);

        ApiClient.getService().login(new LoginRequest(email, password))
            .enqueue(new Callback<AuthResponse>() {
                @Override
                public void onResponse(Call<AuthResponse> call, Response<AuthResponse> response) {
                    progressBar.setVisibility(View.GONE);
                    btnLogin.setEnabled(true);
                    if (response.isSuccessful() && response.body() != null) {
                        AuthResponse auth = response.body();
                        if (!"DOCTOR".equals(auth.role) && !"RECEPTIONIST".equals(auth.role)) {
                            showError("This app is for doctors and receptionists only.");
                            return;
                        }
                        new SessionManager(LoginActivity.this)
                            .saveSession(auth.token, auth.userId, auth.name, email, auth.role, auth.doctorId);
                        startActivity(new Intent(LoginActivity.this, HomeActivity.class));
                        finish();
                    } else {
                        showError("Invalid email or password");
                    }
                }

                @Override
                public void onFailure(Call<AuthResponse> call, Throwable t) {
                    progressBar.setVisibility(View.GONE);
                    btnLogin.setEnabled(true);
                    showError("Connection failed. Is the server running?");
                }
            });
    }

    private void showError(String msg) {
        tvError.setText(msg);
        tvError.setVisibility(View.VISIBLE);
    }
}
