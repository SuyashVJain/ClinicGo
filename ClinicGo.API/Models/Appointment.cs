using System.ComponentModel.DataAnnotations;

namespace ClinicGo.API.Models;

public class Appointment
{
    [Key]
    public int AppointmentId { get; set; }
    public int PatientId { get; set; }
    public int DoctorId { get; set; }
    public DateOnly AppointmentDate { get; set; }
    public TimeOnly SlotTime { get; set; }
    public int TokenNumber { get; set; }
    public string Type { get; set; } = "NEW"; // NEW | FOLLOW_UP
    public string Status { get; set; } = "PENDING_CONFIRMATION";
    // PENDING_CONFIRMATION | CONFIRMED | COMPLETED | CANCELLED | NO_SHOW
    public string BookingChannel { get; set; } = "ONLINE"; // ONLINE | WALKIN
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User Patient { get; set; } = null!;
    public Doctor Doctor { get; set; } = null!;
    public Payment? Payment { get; set; }
    public Prescription? Prescription { get; set; }
    public ICollection<ChatMessage> ChatMessages { get; set; } = [];
}