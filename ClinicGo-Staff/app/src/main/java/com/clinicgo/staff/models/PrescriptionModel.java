package com.clinicgo.staff.models;
import java.util.List;
public class PrescriptionModel {
    public int    prescriptionId;
    public int    appointmentId;
    public String diagnosis;
    public String followUpInstructions;
    public String createdAt;
    public List<MedicineRequest> medicines;
}
