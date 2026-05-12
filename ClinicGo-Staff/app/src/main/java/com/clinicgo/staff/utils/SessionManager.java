package com.clinicgo.staff.utils;

import android.content.Context;
import android.content.SharedPreferences;

public class SessionManager {
    private static final String PREF_NAME   = "clinicgo_staff_prefs";
    private static final String KEY_TOKEN     = "jwt_token";
    private static final String KEY_USER_ID   = "user_id";
    private static final String KEY_NAME      = "user_name";
    private static final String KEY_EMAIL     = "user_email";
    private static final String KEY_ROLE      = "user_role";
    private static final String KEY_DOCTOR_ID = "doctor_id";

    private final SharedPreferences prefs;
    private final SharedPreferences.Editor editor;

    public SessionManager(Context context) {
        prefs  = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        editor = prefs.edit();
    }

    public void saveSession(String token, int userId, String name, String email, String role, int doctorId) {
        editor.putString(KEY_TOKEN,     token);
        editor.putInt(KEY_USER_ID,      userId);
        editor.putString(KEY_NAME,      name);
        editor.putString(KEY_EMAIL,     email);
        editor.putString(KEY_ROLE,      role);
        editor.putInt(KEY_DOCTOR_ID,    doctorId);
        editor.apply();
    }

    public boolean isLoggedIn()  { return prefs.getString(KEY_TOKEN, null) != null; }
    public String getToken()     { return prefs.getString(KEY_TOKEN, null); }
    public int    getUserId()    { return prefs.getInt(KEY_USER_ID, -1); }
    public int    getDoctorId()  { return prefs.getInt(KEY_DOCTOR_ID, -1); }
    public String getName()      { return prefs.getString(KEY_NAME, ""); }
    public String getEmail()     { return prefs.getString(KEY_EMAIL, ""); }
    public String getRole()      { return prefs.getString(KEY_ROLE, ""); }
    public void   clearSession() { editor.clear(); editor.apply(); }
}
