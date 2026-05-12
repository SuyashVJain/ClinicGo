// using ClinicGo.API.Data;
// using ClinicGo.API.DTOs;
// using ClinicGo.API.Models;
// using ClinicGo.API.Services;
// using Microsoft.AspNetCore.Mvc;
// using Microsoft.EntityFrameworkCore;

// namespace ClinicGo.API.Controllers;

// [ApiController]
// [Route("api/v1/auth")]
// public class AuthController : ControllerBase
// {
//     private readonly AppDbContext _db;
//     private readonly TokenService _tokenService;

//     public AuthController(AppDbContext db, TokenService tokenService)
//     {
//         _db = db;
//         _tokenService = tokenService;
//     }

//     // POST /api/v1/auth/register  - patients only, self-registration
//     [HttpPost("register")]
//     public async Task<IActionResult> Register(RegisterRequest req)
//     {
//         if (await _db.Users.AnyAsync(u => u.Email == req.Email))
//             return Conflict(new { message = "Email already registered." });

//         var user = new User
//         {
//             Name         = req.Name,
//             Email        = req.Email,
//             PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
//             Phone        = req.Phone,
//             Role         = "PATIENT",
//             Status       = "PENDING"   // awaits receptionist approval
//         };

//         _db.Users.Add(user);
//         await _db.SaveChangesAsync();

//         return Ok(new { message = "Registration successful. Awaiting approval.", userId = user.UserId });
//     }

//     // POST /api/v1/auth/login  - all roles
//     [HttpPost("login")]
//     public async Task<IActionResult> Login(LoginRequest req)
//     {
//         var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == req.Email);

//         if (user == null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
//             return Unauthorized(new { message = "Invalid email or password." });

//         if (user.Status == "INACTIVE")
//             return Unauthorized(new { message = "Account has been deactivated." });

//         var token = _tokenService.GenerateToken(user);

//         return Ok(new AuthResponse
//         {
//             Token  = token,
//             Role   = user.Role,
//             Status = user.Status,
//             UserId = user.UserId,
//             Name   = user.Name
//         });
//     }

//     // GET /api/v1/auth/me  - returns current user from token
//     [HttpGet("me")]
//     [Microsoft.AspNetCore.Authorization.Authorize]
//     public async Task<IActionResult> Me()
//     {
//         var userId = int.Parse(User.FindFirst(
//             System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

//         var user = await _db.Users.FindAsync(userId);
//         if (user == null) return NotFound();

//         return Ok(new AuthResponse
//         {
//             UserId = user.UserId,
//             Name   = user.Name,
//             Role   = user.Role,
//             Status = user.Status,
//             Token  = ""
//         });
//     }
// }
using ClinicGo.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicGo.API.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly TokenService _tokenService;

    private static readonly List<(int Id, string Name, string Email, string Password, string Role, string Status)> _users = new()
    {
        (1, "Mr. Kapoor",       "admin@clinicgo.com",        "Admin@1234",   "ADMIN",        "ACTIVE"),
        (2, "Priya Joshi",      "receptionist@clinicgo.com", "Staff@1234",   "RECEPTIONIST", "ACTIVE"),
        (3, "Dr. Anil Mehta",   "doctor@clinicgo.com",       "Doctor@1234",  "DOCTOR",       "ACTIVE"),
        (4, "Dr. Sneha Iyer",   "doctor2@clinicgo.com",      "Doctor@1234",  "DOCTOR",       "ACTIVE"),
        (5, "Riya Sharma",      "riya@gmail.com",            "Patient@1234", "PATIENT",      "ACTIVE"),
        (6, "Arjun Verma",      "arjun@gmail.com",           "Patient@1234", "PATIENT",      "ACTIVE"),
        (7, "Meena Patel",      "meena@gmail.com",           "Patient@1234", "PATIENT",      "ACTIVE"),
        (8, "Rohit Singh",      "rohit@gmail.com",           "Patient@1234", "PATIENT",      "ACTIVE"),
    };

    public AuthController(TokenService tokenService) => _tokenService = tokenService;

    [HttpPost("register")]
    public IActionResult Register([FromBody] object req)
        => Ok(new { message = "Registration successful. Awaiting approval.", userId = 9 });

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest req)
    {
        var user = _users.FirstOrDefault(u => u.Email == req.Email && u.Password == req.Password);
        if (user == default)
            return Unauthorized(new { message = "Invalid email or password." });

        var fakeUser = new ClinicGo.API.Models.User
        {
            UserId = user.Id, Name = user.Name,
            Email  = user.Email, Role = user.Role, Status = user.Status
        };
        var token = _tokenService.GenerateToken(fakeUser);
        return Ok(new { Token = token, Role = user.Role, Status = user.Status, UserId = user.Id, Name = user.Name });
    }

    [HttpGet("me")]
    [Authorize]
    public IActionResult Me()
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        var user = _users.FirstOrDefault(u => u.Id == userId);
        if (user == default) return NotFound();
        return Ok(new { UserId = user.Id, Name = user.Name, Role = user.Role, Status = user.Status, Token = "" });
    }
}

public class LoginRequest { public string Email { get; set; } = ""; public string Password { get; set; } = ""; }