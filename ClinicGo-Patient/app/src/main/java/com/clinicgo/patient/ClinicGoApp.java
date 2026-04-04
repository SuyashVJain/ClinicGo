package com.clinicgo.patient;

import android.app.Application;
import com.clinicgo.patient.network.ApiClient;

public class ClinicGoApp extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
        ApiClient.init(this);
    }
}
