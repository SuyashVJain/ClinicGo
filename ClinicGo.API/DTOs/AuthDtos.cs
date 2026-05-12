namespace ClinicGo.API.DTOs;

public class RegisterRequest
{
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
    public string Phone { get; set; } = "";
}

public class LoginRequest
{
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
}

public class AuthResponse
{
    public string Token { get; set; } = "";
    public string Role { get; set; } = "";
    public string Status { get; set; } = "";
    public int UserId { get; set; }
    public string Name { get; set; } = "";
    public int DoctorId { get; set; }  // populated for DOCTOR role; 0 otherwise
}