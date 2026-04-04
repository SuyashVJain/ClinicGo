using System.Security.Claims;
using ClinicGo.API.Data;
using ClinicGo.API.DTOs;
using ClinicGo.API.Models;
using ClinicGo.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClinicGo.API.Controllers;

[ApiController]
[Route("api/v1/appointments")]
[Authorize]
public class AppointmentController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly AppointmentService _svc;

    public AppointmentController(AppDbContext db, AppointmentService svc)
    {
        _db  = db;
        _svc = svc;
    }

    // GET /api/v1/appointments/slots?doctorId=1&date=2026-04-10
    [HttpGet("slots")]
    public async Task<IActionResult> GetSlots(
        [FromQuery] int doctorId, [FromQuery] DateOnly date)
    {
        var slots = await _svc.GetAvailableSlotsAsync(doctorId, date);
        if (!slots.Any())
            return NotFound(new { message = "No schedule found for this doctor on that day." });
        return Ok(slots);
    }

    // POST /api/v1/appointments - patient self-book or receptionist walk-in
    [HttpPost]
    public async Task<IActionResult> Book(BookAppointmentRequest req)
    {
        var role = User.FindFirst(ClaimTypes.Role)?.Value;
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        // Determine patient
        int patientId;
        if (role == "RECEPTIONIST" && req.PatientId.HasValue)
            patientId = req.PatientId.Value;
        else if (role == "PATIENT")
            patientId = userId;
        else
            return Forbid();

        // Check patient is ACTIVE
        var patient = await _db.Users.FindAsync(patientId);
        if (patient == null || patient.Status != "ACTIVE")
            return BadRequest(new { message = "Patient account is not active." });

        // Check slot is still available
        var slots = await _svc.GetAvailableSlotsAsync(req.DoctorId, req.AppointmentDate);
        var slot  = slots.FirstOrDefault(s => s.SlotTime == req.SlotTime);
        if (slot == null || !slot.IsAvailable)
            return Conflict(new { message = "This slot is no longer available." });

        // Determine initial status
        var status = req.BookingChannel == "WALKIN"
            ? "CONFIRMED"              // walk-ins are auto-confirmed
            : "PENDING_CONFIRMATION";  // online bookings need receptionist confirm

        var token = await _svc.GetNextTokenAsync(req.DoctorId, req.AppointmentDate);

        var appointment = new Appointment
        {
            PatientId       = patientId,
            DoctorId        = req.DoctorId,
            AppointmentDate = req.AppointmentDate,
            SlotTime        = req.SlotTime,
            TokenNumber     = token,
            Type            = req.Type,
            Status          = status,
            BookingChannel  = req.BookingChannel
        };

        _db.Appointments.Add(appointment);
        await _db.SaveChangesAsync();

        var response = await _svc.GetByIdAsync(appointment.AppointmentId);
        return CreatedAtAction(nameof(GetById),
            new { id = appointment.AppointmentId }, response);
    }

    // GET /api/v1/appointments/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var appt = await _svc.GetByIdAsync(id);
        if (appt == null) return NotFound();
        return Ok(appt);
    }

    // GET /api/v1/appointments/doctor/{doctorId}/today
    [HttpGet("doctor/{doctorId}/today")]
    public async Task<IActionResult> GetTodaySchedule(int doctorId)
    {
        var today = DateOnly.FromDateTime(DateTime.Today);
        var list  = await _db.Appointments
            .Include(a => a.Patient)
            .Include(a => a.Doctor.User)
            .Where(a => a.DoctorId == doctorId &&
                        a.AppointmentDate == today &&
                        a.Status != "CANCELLED")
            .OrderBy(a => a.TokenNumber)
            .Select(a => AppointmentService.MapToResponse(a))
            .ToListAsync();
        return Ok(list);
    }

    // GET /api/v1/appointments/patient/{patientId}
    [HttpGet("patient/{patientId}")]
    public async Task<IActionResult> GetPatientAppointments(int patientId)
    {
        var list = await _db.Appointments
            .Include(a => a.Patient)
            .Include(a => a.Doctor.User)
            .Where(a => a.PatientId == patientId)
            .OrderByDescending(a => a.AppointmentDate)
            .Select(a => AppointmentService.MapToResponse(a))
            .ToListAsync();
        return Ok(list);
    }

    // PUT /api/v1/appointments/{id}/confirm - receptionist only
    [HttpPut("{id}/confirm")]
    [Authorize(Roles = "RECEPTIONIST")]
    public async Task<IActionResult> Confirm(int id)
    {
        var appt = await _db.Appointments.FindAsync(id);
        if (appt == null) return NotFound();
        if (appt.Status != "PENDING_CONFIRMATION")
            return BadRequest(new { message = "Appointment is not pending confirmation." });

        appt.Status = "CONFIRMED";
        await _db.SaveChangesAsync();
        return Ok(new { message = "Appointment confirmed.", appointmentId = id });
    }

    // PUT /api/v1/appointments/{id}/cancel - patient or receptionist
    [HttpPut("{id}/cancel")]
    public async Task<IActionResult> Cancel(int id)
    {
        var appt = await _db.Appointments.FindAsync(id);
        if (appt == null) return NotFound();
        if (appt.Status == "COMPLETED" || appt.Status == "CANCELLED")
            return BadRequest(new { message = "Cannot cancel this appointment." });

        appt.Status = "CANCELLED";
        await _db.SaveChangesAsync();
        return Ok(new { message = "Appointment cancelled.", appointmentId = id });
    }

    // PUT /api/v1/appointments/{id}/complete - doctor only
    [HttpPut("{id}/complete")]
    [Authorize(Roles = "DOCTOR")]
    public async Task<IActionResult> Complete(int id)
    {
        var appt = await _db.Appointments.FindAsync(id);
        if (appt == null) return NotFound();
        if (appt.Status != "CONFIRMED")
            return BadRequest(new { message = "Appointment must be confirmed before completing." });

        appt.Status = "COMPLETED";
        await _db.SaveChangesAsync();
        return Ok(new { message = "Appointment marked complete.", appointmentId = id });
    }
}