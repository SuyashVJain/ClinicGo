using ClinicGo.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ClinicGo.API.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        // Only seed if Users table is empty
        if (await db.Users.AnyAsync()) return;

        // ── Admin ──────────────────────────────────────────
        var admin = new User
        {
            Name         = "Mr. Kapoor",
            Email        = "admin@clinicgo.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@1234"),
            Phone        = "9000000001",
            Role         = "ADMIN",
            Status       = "ACTIVE"
        };
        db.Users.Add(admin);

        // ── Receptionist ───────────────────────────────────
        var receptionist = new User
        {
            Name         = "Priya Joshi",
            Email        = "receptionist@clinicgo.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Staff@1234"),
            Phone        = "9000000002",
            Role         = "RECEPTIONIST",
            Status       = "ACTIVE"
        };
        db.Users.Add(receptionist);

        // ── Doctor user ────────────────────────────────────
        var doctorUser = new User
        {
            Name         = "Dr. Anil Mehta",
            Email        = "doctor@clinicgo.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Doctor@1234"),
            Phone        = "9000000003",
            Role         = "DOCTOR",
            Status       = "ACTIVE"
        };
        db.Users.Add(doctorUser);

        await db.SaveChangesAsync();

        // ── Doctor profile (needs UserId from above) ───────
        var doctorProfile = new Doctor
        {
            UserId         = doctorUser.UserId,
            Specialization = "General Physician",
            NewPatientFee  = 300,
            FollowUpFee    = 200,
            IsAvailable    = true,
            AverageRating  = 0
        };
        db.Doctors.Add(doctorProfile);
await db.SaveChangesAsync(); // ← save HERE so DoctorId gets assigned

        // ── Doctor schedule (Mon–Sat, 9AM–5PM, 20min slots) ─
        var days = new[] { "MON", "TUE", "WED", "THU", "FRI", "SAT" };
        foreach (var day in days)
        {
            db.DoctorSchedules.Add(new DoctorSchedule
            {
                DoctorId        = doctorProfile.DoctorId,
                DayOfWeek       = day,
                StartTime       = new TimeOnly(9, 0),
                EndTime         = new TimeOnly(17, 0),
                SlotDurationMins = 20,
                IsActive        = true
            });
        }

        await db.SaveChangesAsync();
    }
}