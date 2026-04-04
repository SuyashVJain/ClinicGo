using ClinicGo.API.Data;
using ClinicGo.API.DTOs;
using ClinicGo.API.Models;
using ClinicGo.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClinicGo.API.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly TokenService _tokenService;

    public AuthController(AppDbContext db, TokenService tokenService)
    {
        _db = db;
        _tokenService = tokenService;
    }

    // POST /api/v1/auth/register  — patients only, self-registration
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest req)
    {
        if (await _db.Users.AnyAsync(u => u.Email == req.Email))
            return Conflict(new { message = "Email already registered." });

        var user = new User
        {
            Name         = req.Name,
            Email        = req.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            Phone        = req.Phone,
            Role         = "PATIENT",
            Status       = "PENDING"   // awaits receptionist approval
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Registration successful. Awaiting approval.", userId = user.UserId });
    }

    // POST /api/v1/auth/login  — all roles
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest req)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == req.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid email or password." });

        if (user.Status == "INACTIVE")
            return Unauthorized(new { message = "Account has been deactivated." });

        var token = _tokenService.GenerateToken(user);

        return Ok(new AuthResponse
        {
            Token  = token,
            Role   = user.Role,
            Status = user.Status,
            UserId = user.UserId,
            Name   = user.Name
        });
    }

    // GET /api/v1/auth/me  — returns current user from token
    [HttpGet("me")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> Me()
    {
        var userId = int.Parse(User.FindFirst(
            System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound();

        return Ok(new AuthResponse
        {
            UserId = user.UserId,
            Name   = user.Name,
            Role   = user.Role,
            Status = user.Status,
            Token  = ""
        });
    }
}