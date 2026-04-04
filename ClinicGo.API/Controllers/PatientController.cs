using ClinicGo.API.Data;
using ClinicGo.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClinicGo.API.Controllers;

[ApiController]
[Route("api/v1/patients")]
[Authorize]
public class PatientController : ControllerBase
{
    private readonly AppDbContext _db;

    public PatientController(AppDbContext db)
    {
        _db = db;
    }

    // GET /api/v1/patients/pending - receptionist sees all pending registrations
    [HttpGet("pending")]
    [Authorize(Roles = "RECEPTIONIST,ADMIN")]
    public async Task<IActionResult> GetPending()
    {
        var pending = await _db.Users
            .Where(u => u.Role == "PATIENT" && u.Status == "PENDING")
            .Select(u => new
            {
                u.UserId,
                u.Name,
                u.Email,
                u.Phone,
                u.CreatedAt
            })
            .OrderBy(u => u.CreatedAt)
            .ToListAsync();

        return Ok(pending);
    }

    // PUT /api/v1/patients/{id}/approve - receptionist approves patient
    [HttpPut("{id}/approve")]
    [Authorize(Roles = "RECEPTIONIST,ADMIN")]
    public async Task<IActionResult> Approve(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null || user.Role != "PATIENT")
            return NotFound(new { message = "Patient not found." });

        if (user.Status == "ACTIVE")
            return BadRequest(new { message = "Patient is already active." });

        user.Status = "ACTIVE";
        await _db.SaveChangesAsync();

        return Ok(new { message = $"{user.Name} has been approved.", userId = id });
    }

    // PUT /api/v1/patients/{id}/reject - receptionist rejects patient
    [HttpPut("{id}/reject")]
    [Authorize(Roles = "RECEPTIONIST,ADMIN")]
    public async Task<IActionResult> Reject(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null || user.Role != "PATIENT")
            return NotFound(new { message = "Patient not found." });

        user.Status = "INACTIVE";
        await _db.SaveChangesAsync();

        return Ok(new { message = $"{user.Name} has been rejected.", userId = id });
    }

    // GET /api/v1/patients/{id}/history - full appointment + prescription history
    [HttpGet("{id}/history")]
    [Authorize(Roles = "DOCTOR,RECEPTIONIST,ADMIN")]
    public async Task<IActionResult> GetHistory(int id)
    {
        var patient = await _db.Users.FindAsync(id);
        if (patient == null || patient.Role != "PATIENT")
            return NotFound(new { message = "Patient not found." });

        var history = await _db.Appointments
            .Include(a => a.Doctor.User)
            .Include(a => a.Prescription)
                .ThenInclude(p => p!.Medicines)
            .Where(a => a.PatientId == id)
            .OrderByDescending(a => a.AppointmentDate)
            .Select(a => new
            {
                a.AppointmentId,
                a.AppointmentDate,
                a.SlotTime,
                a.TokenNumber,
                a.Type,
                a.Status,
                a.BookingChannel,
                Doctor = a.Doctor.User.Name,
                Specialization = a.Doctor.Specialization,
                Prescription = a.Prescription == null ? null : new
                {
                    a.Prescription.PrescriptionId,
                    a.Prescription.Diagnosis,
                    a.Prescription.FollowUpInstructions,
                    a.Prescription.CreatedAt,
                    Medicines = a.Prescription.Medicines.Select(m => new
                    {
                        m.MedicineName,
                        m.Dosage,
                        m.Frequency,
                        m.Duration
                    })
                }
            })
            .ToListAsync();

        return Ok(new
        {
            patient.UserId,
            patient.Name,
            patient.Email,
            patient.Phone,
            TotalVisits = history.Count,
            History = history
        });
    }

    // GET /api/v1/patients - search patients (receptionist/doctor)
    [HttpGet]
    [Authorize(Roles = "DOCTOR,RECEPTIONIST,ADMIN")]
    public async Task<IActionResult> Search([FromQuery] string? name)
    {
        var query = _db.Users.Where(u => u.Role == "PATIENT");

        if (!string.IsNullOrEmpty(name))
            query = query.Where(u => u.Name.Contains(name));

        var patients = await query
            .Select(u => new
            {
                u.UserId,
                u.Name,
                u.Email,
                u.Phone,
                u.Status,
                u.CreatedAt
            })
            .OrderBy(u => u.Name)
            .ToListAsync();

        return Ok(patients);
    }
}