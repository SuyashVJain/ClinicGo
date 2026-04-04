package com.clinicgo.patient.network;

import com.clinicgo.patient.models.PaymentModel;
import com.clinicgo.patient.models.AppointmentModel;
import com.clinicgo.patient.models.AuthResponse;
import com.clinicgo.patient.models.LabReportModel;
import com.clinicgo.patient.models.LoginRequest;
import com.clinicgo.patient.models.PaymentModel;
import com.clinicgo.patient.models.PrescriptionModel;
import com.clinicgo.patient.models.RegisterRequest;
import com.clinicgo.patient.models.SlotModel;
import java.util.List;
import java.util.Map;

import okhttp3.MultipartBody;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.Multipart;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.Part;
import retrofit2.http.Path;
import retrofit2.http.Query;

public interface ApiService {

    // Auth
    @POST("auth/login")
    Call<AuthResponse> login(@Body LoginRequest request);

    @POST("auth/register")
    Call<Map<String, Object>> register(@Body RegisterRequest request);

    // Appointments
    @GET("appointments/slots")
    Call<List<SlotModel>> getSlots(
        @Query("doctorId") int doctorId,
        @Query("date") String date
    );

    @POST("appointments")
    Call<AppointmentModel> bookAppointment(@Body Map<String, Object> body);

    @GET("appointments/patient/{patientId}")
    Call<List<AppointmentModel>> getPatientAppointments(@Path("patientId") int patientId);

    @PUT("appointments/{id}/cancel")
    Call<Map<String, Object>> cancelAppointment(@Path("id") int id);

    // Prescriptions
    @GET("prescriptions/{appointmentId}")
    Call<PrescriptionModel> getPrescription(@Path("appointmentId") int appointmentId);

    @GET("prescriptions/patient/{patientId}")
    Call<List<PrescriptionModel>> getPatientPrescriptions(@Path("patientId") int patientId);

    // Payments
    @POST("payments/initiate")
    Call<PaymentModel> initiatePayment(@Body Map<String, Object> body);

    @GET("payments/patient/{patientId}/history")
    Call<List<PaymentModel>> getPaymentHistory(@Path("patientId") int patientId);

    // Lab Reports
    @Multipart
    @POST("reports/upload")
    Call<Map<String, Object>> uploadReport(@Part MultipartBody.Part file);

    @GET("reports/patient/{patientId}")
    Call<List<LabReportModel>> getLabReports(@Path("patientId") int patientId);
}
