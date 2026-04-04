using ClinicGo.API.Data;
using ClinicGo.API.DTOs;
using ClinicGo.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ClinicGo.API.Services;

public class AppointmentService
{
    private readonly AppDbContext _db;

    public AppointmentService(AppDbContext db)
    {
        _db = db;
    }

    // Returns all slots for a doctor on a date, marked available or taken
    public async Task<List<AvailableSlot>> GetAvailableSlotsAsync(
        int doctorId, DateOnly date)
    {
        var dayName = date.DayOfWeek.ToString().ToUpper()[..3]; // MON, TUE etc

        var schedule = await _db.DoctorSchedules
            .FirstOrDefaultAsync(s =>
                s.DoctorId == doctorId &&
                s.DayOfWeek == dayName &&
                s.IsActive);

        if (schedule == null) return [];

        // Get already-booked slots for this doctor on this date
        var bookedSlots = await _db.Appointments
            .Where(a =>
                a.DoctorId == doctorId &&
                a.AppointmentDate == date &&
                a.Status != "CANCELLED" &&
                a.Status != "NO_SHOW")
            .Select(a => a.SlotTime)
            .ToListAsync();

        // Generate all slots from start to end
        var slots = new List<AvailableSlot>();
        var current = schedule.StartTime;

        while (current.AddMinutes(schedule.SlotDurationMins) <= schedule.EndTime)
        {
            slots.Add(new AvailableSlot
            {
                SlotTime    = current,
                IsAvailable = !bookedSlots.Contains(current)
            });
            current = current.AddMinutes(schedule.SlotDurationMins);
        }

        return slots;
    }

    // Assigns the next token number for a doctor on a date
    public async Task<int> GetNextTokenAsync(int doctorId, DateOnly date)
    {
        var maxToken = await _db.Appointments
            .Where(a =>
                a.DoctorId == doctorId &&
                a.AppointmentDate == date &&
                a.Status != "CANCELLED")
            .MaxAsync(a => (int?)a.TokenNumber) ?? 0;

        return maxToken + 1;
    }

    public async Task<AppointmentResponse?> GetByIdAsync(int id)
    {
        return await _db.Appointments
            .Include(a => a.Patient)
            .Include(a => a.Doctor.User)
            .Where(a => a.AppointmentId == id)
            .Select(a => MapToResponse(a))
            .FirstOrDefaultAsync();
    }

    public static AppointmentResponse MapToResponse(Appointment a) => new()
    {
        AppointmentId   = a.AppointmentId,
        PatientId       = a.PatientId,
        PatientName     = a.Patient.Name,
        DoctorId        = a.DoctorId,
        DoctorName      = a.Doctor.User.Name,
        AppointmentDate = a.AppointmentDate,
        SlotTime        = a.SlotTime,
        TokenNumber     = a.TokenNumber,
        Type            = a.Type,
        Status          = a.Status,
        BookingChannel  = a.BookingChannel,
        CreatedAt       = a.CreatedAt
    };
}