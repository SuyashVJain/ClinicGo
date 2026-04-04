using System.ComponentModel.DataAnnotations;
namespace ClinicGo.API.Models;

public class Prescription
{
    [Key]
    public int PrescriptionId { get; set; }
    public int AppointmentId { get; set; }
    public int DoctorId { get; set; }
    public string Diagnosis { get; set; } = "";
    public string FollowUpInstructions { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Appointment Appointment { get; set; } = null!;
    public Doctor Doctor { get; set; } = null!;
    public ICollection<PrescriptionMedicine> Medicines { get; set; } = [];
}