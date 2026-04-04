package com.clinicgo.patient.activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

import com.clinicgo.patient.R;
import com.clinicgo.patient.models.AuthResponse;
import com.clinicgo.patient.models.LoginRequest;
import com.clinicgo.patient.network.ApiClient;
import com.clinicgo.patient.utils.SessionManager;

import java.util.HashMap;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LoginActivity extends AppCompatActivity {

    private EditText etEmail, etPassword;
    private Button   btnLogin;
    private ProgressBar progressBar;
    private TextView tvError, tvRegister;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        etEmail     = findViewById(R.id.et_email);
        etPassword  = findViewById(R.id.et_password);
        btnLogin    = findViewById(R.id.btn_login);
        progressBar = findViewById(R.id.progress_bar);
        tvError     = findViewById(R.id.tv_error);
        tvRegister  = findViewById(R.id.tv_register);

        btnLogin.setOnClickListener(v -> attemptLogin());

        tvRegister.setOnClickListener(v -> {
            startActivity(new Intent(this, RegisterActivity.class));
        });
    }

    private void attemptLogin() {
        String email    = etEmail.getText().toString().trim();
        String password = etPassword.getText().toString().trim();

        if (email.isEmpty() || password.isEmpty()) {
            tvError.setText("Please enter email and password");
            tvError.setVisibility(View.VISIBLE);
            return;
        }

        tvError.setVisibility(View.GONE);
        btnLogin.setEnabled(false);
        progressBar.setVisibility(View.VISIBLE);

        Map<String, String> body = new HashMap<>();
        body.put("email",    email);
        body.put("password", password);

        ApiClient.getService().login(new LoginRequest(email, password))
            .enqueue(new Callback<AuthResponse>() {
                @Override
                public void onResponse(Call<AuthResponse> call, Response<AuthResponse> response) {
                    progressBar.setVisibility(View.GONE);
                    btnLogin.setEnabled(true);

                    if (response.isSuccessful() && response.body() != null) {
                        AuthResponse auth = response.body();

                        if (!"PATIENT".equals(auth.role)) {
                            tvError.setText("This app is for patients only.");
                            tvError.setVisibility(View.VISIBLE);
                            return;
                        }

                        SessionManager session = new SessionManager(LoginActivity.this);
                        session.saveSession(auth.token, auth.userId,
                            auth.name, email, auth.role, auth.status);

                        startActivity(new Intent(LoginActivity.this, HomeActivity.class));
                        finish();
                    } else {
                        tvError.setText("Invalid email or password");
                        tvError.setVisibility(View.VISIBLE);
                    }
                }

                @Override
                public void onFailure(Call<AuthResponse> call, Throwable t) {
                    progressBar.setVisibility(View.GONE);
                    btnLogin.setEnabled(true);
                    tvError.setText("Connection failed. Is the server running?");
                    tvError.setVisibility(View.VISIBLE);
                }
            });
    }
}
