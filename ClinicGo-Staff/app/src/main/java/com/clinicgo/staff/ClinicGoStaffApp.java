package com.clinicgo.staff;

import android.app.Application;
import com.clinicgo.staff.network.ApiClient;

public class ClinicGoStaffApp extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
        ApiClient.init(this);
    }
}
