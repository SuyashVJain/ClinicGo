namespace ClinicGo.API.DTOs;

public class CreatePrescriptionRequest
{
    public int AppointmentId { get; set; }
    public string Diagnosis { get; set; } = "";
    public string FollowUpInstructions { get; set; } = "";
    public List<MedicineRequest> Medicines { get; set; } = [];
}

public class MedicineRequest
{
    public string MedicineName { get; set; } = "";
    public string Dosage { get; set; } = "";
    public string Frequency { get; set; } = "";
    public string Duration { get; set; } = "";
}

public class PrescriptionResponse
{
    public int PrescriptionId { get; set; }
    public int AppointmentId { get; set; }
    public int DoctorId { get; set; }
    public string DoctorName { get; set; } = "";
    public string Diagnosis { get; set; } = "";
    public string FollowUpInstructions { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public List<MedicineResponse> Medicines { get; set; } = [];
}

public class MedicineResponse
{
    public int MedicineId { get; set; }
    public string MedicineName { get; set; } = "";
    public string Dosage { get; set; } = "";
    public string Frequency { get; set; } = "";
    public string Duration { get; set; } = "";
}
