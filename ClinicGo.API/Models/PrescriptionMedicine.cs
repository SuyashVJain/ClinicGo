using System.ComponentModel.DataAnnotations;
namespace ClinicGo.API.Models;

public class PrescriptionMedicine
{
    [Key]
    public int MedicineId { get; set; }
    public int PrescriptionId { get; set; }
    public string MedicineName { get; set; } = "";
    public string Dosage { get; set; } = ""; // e.g. "500mg"
    public string Frequency { get; set; } = ""; // e.g. "Twice daily"
    public string Duration { get; set; } = ""; // e.g. "7 days"

    // Navigation
    public Prescription Prescription { get; set; } = null!;
}