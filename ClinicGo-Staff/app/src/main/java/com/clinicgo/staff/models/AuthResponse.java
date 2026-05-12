package com.clinicgo.staff.models;
public class AuthResponse {
    public String token;
    public String role;
    public String status;
    public int    userId;
    public String name;
    public int    doctorId;  // populated for DOCTOR role; 0 otherwise
}
