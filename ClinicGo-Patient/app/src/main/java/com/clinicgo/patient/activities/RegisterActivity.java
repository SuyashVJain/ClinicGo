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
import com.clinicgo.patient.models.RegisterRequest;
import com.clinicgo.patient.network.ApiClient;

import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class RegisterActivity extends AppCompatActivity {

    private EditText etName, etEmail, etPhone, etPassword, etConfirmPassword;
    private Button   btnRegister;
    private ProgressBar progressBar;
    private TextView tvError, tvLogin;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);

        etName            = findViewById(R.id.et_name);
        etEmail           = findViewById(R.id.et_email);
        etPhone           = findViewById(R.id.et_phone);
        etPassword        = findViewById(R.id.et_password);
        etConfirmPassword = findViewById(R.id.et_confirm_password);
        btnRegister       = findViewById(R.id.btn_register);
        progressBar       = findViewById(R.id.progress_bar);
        tvError           = findViewById(R.id.tv_error);
        tvLogin           = findViewById(R.id.tv_login);

        btnRegister.setOnClickListener(v -> attemptRegister());
        tvLogin.setOnClickListener(v -> finish());
    }

    private void attemptRegister() {
        String name     = etName.getText().toString().trim();
        String email    = etEmail.getText().toString().trim();
        String phone    = etPhone.getText().toString().trim();
        String password = etPassword.getText().toString().trim();
        String confirm  = etConfirmPassword.getText().toString().trim();

        if (name.isEmpty() || email.isEmpty() || phone.isEmpty() || password.isEmpty()) {
            showError("All fields are required");
            return;
        }

        if (!password.equals(confirm)) {
            showError("Passwords do not match");
            return;
        }

        if (password.length() < 6) {
            showError("Password must be at least 6 characters");
            return;
        }

        tvError.setVisibility(View.GONE);
        btnRegister.setEnabled(false);
        progressBar.setVisibility(View.VISIBLE);

        RegisterRequest req = new RegisterRequest();
        req.name     = name;
        req.email    = email;
        req.phone    = phone;
        req.password = password;

        ApiClient.getService().register(req)
            .enqueue(new Callback<Map<String, Object>>() {
                @Override
                public void onResponse(Call<Map<String, Object>> call,
                                       Response<Map<String, Object>> response) {
                    progressBar.setVisibility(View.GONE);
                    btnRegister.setEnabled(true);

                    if (response.isSuccessful()) {
                        // Show success and go back to login
                        Intent intent = new Intent(RegisterActivity.this, LoginActivity.class);
                        intent.putExtra("registered", true);
                        startActivity(intent);
                        finish();
                    } else {
                        showError("Registration failed. Email may already be registered.");
                    }
                }

                @Override
                public void onFailure(Call<Map<String, Object>> call, Throwable t) {
                    progressBar.setVisibility(View.GONE);
                    btnRegister.setEnabled(true);
                    showError("Connection failed. Is the server running?");
                }
            });
    }

    private void showError(String msg) {
        tvError.setText(msg);
        tvError.setVisibility(View.VISIBLE);
    }
}
