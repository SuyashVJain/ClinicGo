using System.ComponentModel.DataAnnotations;
namespace ClinicGo.API.Models;

public class User
{
    [Key]
    public int UserId { get; set; }
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public string Phone { get; set; } = "";
    public string Role { get; set; } = ""; // PATIENT | DOCTOR | RECEPTIONIST | ADMIN
    public string Status { get; set; } = "PENDING"; // PENDING | ACTIVE | INACTIVE
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Doctor? Doctor { get; set; }
    public ICollection<Appointment> PatientAppointments { get; set; } = [];
    public ICollection<ChatMessage> SentMessages { get; set; } = [];
    public ICollection<ChatMessage> ReceivedMessages { get; set; } = [];
    public ICollection<LabReport> LabReports { get; set; } = [];
}