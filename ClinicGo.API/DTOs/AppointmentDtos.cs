namespace ClinicGo.API.DTOs;

public class BookAppointmentRequest
{
    public int DoctorId { get; set; }
    public DateOnly AppointmentDate { get; set; }
    public TimeOnly SlotTime { get; set; }
    public string Type { get; set; } = "NEW"; // NEW | FOLLOW_UP
    public string BookingChannel { get; set; } = "ONLINE"; // ONLINE | WALKIN
    public int? PatientId { get; set; } // receptionist sets this for walk-ins
}

public class AppointmentResponse
{
    public int AppointmentId { get; set; }
    public int PatientId { get; set; }
    public string PatientName { get; set; } = "";
    public int DoctorId { get; set; }
    public string DoctorName { get; set; } = "";
    public DateOnly AppointmentDate { get; set; }
    public TimeOnly SlotTime { get; set; }
    public int TokenNumber { get; set; }
    public string Type { get; set; } = "";
    public string Status { get; set; } = "";
    public string BookingChannel { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}

public class AvailableSlot
{
    public TimeOnly SlotTime { get; set; }
    public bool IsAvailable { get; set; }
}