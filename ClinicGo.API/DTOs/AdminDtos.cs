namespace ClinicGo.API.DTOs;

public class CreateDoctorRequest
{
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
    public string Phone { get; set; } = "";
    public string Specialization { get; set; } = "";
    public decimal NewPatientFee { get; set; }
    public decimal FollowUpFee { get; set; }
}

public class CreateStaffRequest
{
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
    public string Phone { get; set; } = "";
}

public class UpdateDoctorRequest
{
    public string? Specialization { get; set; }
    public decimal? NewPatientFee { get; set; }
    public decimal? FollowUpFee { get; set; }
    public bool? IsAvailable { get; set; }
}

public class ClinicConfigRequest
{
    public string OpenTime { get; set; } = "09:00";
    public string CloseTime { get; set; } = "17:00";
    public int DefaultSlotDurationMins { get; set; } = 20;
    public List<string> Holidays { get; set; } = [];
}
