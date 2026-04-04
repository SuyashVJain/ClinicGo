package com.clinicgo.patient.models;
import java.util.List;
public class PrescriptionModel {
    public int    prescriptionId;
    public int    appointmentId;
    public int    doctorId;
    public String doctorName;
    public String diagnosis;
    public String followUpInstructions;
    public String createdAt;
    public List<MedicineModel> medicines;
}
