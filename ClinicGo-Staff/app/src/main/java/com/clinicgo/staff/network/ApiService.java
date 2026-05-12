package com.clinicgo.staff.network;

import com.clinicgo.staff.models.AppointmentModel;
import com.clinicgo.staff.models.AuthResponse;
import com.clinicgo.staff.models.ChatMessage;
import com.clinicgo.staff.models.LoginRequest;
import com.clinicgo.staff.models.PatientModel;
import com.clinicgo.staff.models.PrescriptionModel;
import com.clinicgo.staff.models.QueueModel;

import java.util.List;
import java.util.Map;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.Path;
import retrofit2.http.Query;

public interface ApiService {

    @POST("auth/login")
    Call<AuthResponse> login(@Body LoginRequest request);

    // Doctor - appointments
    @GET("appointments/doctor/{doctorId}")
    Call<List<AppointmentModel>> getDoctorAppointments(@Path("doctorId") int doctorId);

    @GET("appointments/doctor/{doctorId}/today")
    Call<List<AppointmentModel>> getTodaySchedule(@Path("doctorId") int doctorId);

    // Chat
    @GET("chat/history/{appointmentId}")
    Call<List<ChatMessage>> getChatHistory(@Path("appointmentId") int appointmentId);

    @PUT("appointments/{id}/complete")
    Call<Map<String, Object>> completeAppointment(@Path("id") int id);

    // Prescriptions
    @POST("prescriptions")
    Call<PrescriptionModel> createPrescription(@Body Map<String, Object> body);

    @GET("prescriptions/{appointmentId}")
    Call<PrescriptionModel> getPrescription(@Path("appointmentId") int appointmentId);

    @GET("prescriptions/patient/{patientId}")
    Call<List<PrescriptionModel>> getPatientPrescriptions(@Path("patientId") int patientId);

    // Queue
    @GET("queue/today/{doctorId}")
    Call<QueueModel> getTodayQueue(@Path("doctorId") int doctorId);

    @PUT("queue/{appointmentId}/next")
    Call<Map<String, Object>> callNext(@Path("appointmentId") int appointmentId);

    @PUT("queue/{appointmentId}/skip")
    Call<Map<String, Object>> skipPatient(@Path("appointmentId") int appointmentId);

    // Patients
    @GET("patients/pending")
    Call<List<PatientModel>> getPendingPatients();

    @PUT("patients/{id}/approve")
    Call<Map<String, Object>> approvePatient(@Path("id") int id);

    @PUT("patients/{id}/reject")
    Call<Map<String, Object>> rejectPatient(@Path("id") int id);

    @GET("patients/{id}/history")
    Call<Map<String, Object>> getPatientHistory(@Path("id") int id);

    @GET("patients")
    Call<List<PatientModel>> searchPatients(@Query("name") String name);

    // Appointments - receptionist
    @GET("appointments")
    Call<List<AppointmentModel>> getAllAppointments(
        @Query("date") String date,
        @Query("status") String status
    );

    @PUT("appointments/{id}/confirm")
    Call<Map<String, Object>> confirmAppointment(@Path("id") int id);

    @PUT("appointments/{id}/cancel")
    Call<Map<String, Object>> cancelAppointment(@Path("id") int id);

    @POST("appointments")
    Call<AppointmentModel> bookAppointment(@Body Map<String, Object> body);

    // Payments
    @POST("payments/record-cash")
    Call<Map<String, Object>> recordCashPayment(@Body Map<String, Object> body);
}
