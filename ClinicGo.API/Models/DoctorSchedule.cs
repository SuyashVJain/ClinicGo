using System.ComponentModel.DataAnnotations;

namespace ClinicGo.API.Models;

public class DoctorSchedule
{
    [Key]
    public int ScheduleId { get; set; }
    public int DoctorId { get; set; }
    public string DayOfWeek { get; set; } = ""; // MON | TUE | WED | THU | FRI | SAT | SUN
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public int SlotDurationMins { get; set; } = 20;
    public bool IsActive { get; set; } = true;

    // Navigation
    public Doctor Doctor { get; set; } = null!;
}