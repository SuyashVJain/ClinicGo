package com.clinicgo.staff.models;

public class AppointmentModel {
    public int    appointmentId;
    public int    patientId;
    public String patientName;   // flat field from appointment endpoints
    public int    doctorId;
    public String doctorName;
    public String appointmentDate;
    public String slotTime;
    public int    tokenNumber;
    public String type;
    public String status;
    public String bookingChannel;
    public String createdAt;

    // Queue endpoint returns nested Patient object instead of flat patientName
    public PatientInfo patient;

    public static class PatientInfo {
        public int    userId;
        public String name;
        public String phone;
    }

    /** Returns patient display name regardless of API response shape. */
    public String getPatientDisplayName() {
        if (patientName != null && !patientName.isEmpty()) return patientName;
        if (patient != null && patient.name != null)        return patient.name;
        return "";
    }
}
