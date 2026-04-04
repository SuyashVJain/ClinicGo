using System.ComponentModel.DataAnnotations;

namespace ClinicGo.API.Models;

public class Doctor
{
    [Key]
    public int DoctorId { get; set; }
    public int UserId { get; set; }
    public string Specialization { get; set; } = "";
    public decimal NewPatientFee { get; set; }
    public decimal FollowUpFee { get; set; }
    public bool IsAvailable { get; set; } = true;
    public decimal AverageRating { get; set; } = 0;

    // Navigation
    public User User { get; set; } = null!;
    public ICollection<DoctorSchedule> Schedules { get; set; } = [];
    public ICollection<Appointment> Appointments { get; set; } = [];
    public ICollection<Prescription> Prescriptions { get; set; } = [];
}