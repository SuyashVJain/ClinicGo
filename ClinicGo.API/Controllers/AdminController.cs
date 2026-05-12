// using ClinicGo.API.Data;
// using ClinicGo.API.DTOs;
// using ClinicGo.API.Models;
// using Microsoft.AspNetCore.Authorization;
// using Microsoft.AspNetCore.Mvc;
// using Microsoft.EntityFrameworkCore;

// namespace ClinicGo.API.Controllers;

// [ApiController]
// [Route("api/v1/admin")]
// [Authorize(Roles = "ADMIN")]
// public class AdminController : ControllerBase
// {
//     private readonly AppDbContext _db;

//     public AdminController(AppDbContext db)
//     {
//         _db = db;
//     }

//     // GET /api/v1/admin/doctors
//     [HttpGet("doctors")]
//     public async Task<IActionResult> GetDoctors()
//     {
//         var doctors = await _db.Doctors
//             .Include(d => d.User)
//             .Select(d => new
//             {
//                 d.DoctorId,
//                 d.UserId,
//                 d.User.Name,
//                 d.User.Email,
//                 d.User.Phone,
//                 d.User.Status,
//                 d.Specialization,
//                 d.NewPatientFee,
//                 d.FollowUpFee,
//                 d.IsAvailable,
//                 d.AverageRating
//             })
//             .ToListAsync();
//         return Ok(doctors);
//     }

//     // POST /api/v1/admin/doctors - create doctor account
//     [HttpPost("doctors")]
//     public async Task<IActionResult> CreateDoctor(CreateDoctorRequest req)
//     {
//         if (await _db.Users.AnyAsync(u => u.Email == req.Email))
//             return Conflict(new { message = "Email already registered." });

//         var user = new User
//         {
//             Name         = req.Name,
//             Email        = req.Email,
//             PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
//             Phone        = req.Phone,
//             Role         = "DOCTOR",
//             Status       = "ACTIVE"
//         };
//         _db.Users.Add(user);
//         await _db.SaveChangesAsync();

//         var doctor = new Doctor
//         {
//             UserId         = user.UserId,
//             Specialization = req.Specialization,
//             NewPatientFee  = req.NewPatientFee,
//             FollowUpFee    = req.FollowUpFee,
//             IsAvailable    = true
//         };
//         _db.Doctors.Add(doctor);
//         await _db.SaveChangesAsync();

//         return Ok(new { message = "Doctor created.", doctorId = doctor.DoctorId, userId = user.UserId });
//     }

//     // PUT /api/v1/admin/doctors/{id}
//     [HttpPut("doctors/{id}")]
//     public async Task<IActionResult> UpdateDoctor(int id, UpdateDoctorRequest req)
//     {
//         var doctor = await _db.Doctors.FindAsync(id);
//         if (doctor == null) return NotFound();

//         if (req.Specialization != null) doctor.Specialization = req.Specialization;
//         if (req.NewPatientFee.HasValue) doctor.NewPatientFee = req.NewPatientFee.Value;
//         if (req.FollowUpFee.HasValue) doctor.FollowUpFee = req.FollowUpFee.Value;
//         if (req.IsAvailable.HasValue) doctor.IsAvailable = req.IsAvailable.Value;

//         await _db.SaveChangesAsync();
//         return Ok(new { message = "Doctor updated.", doctorId = id });
//     }

//     // DELETE /api/v1/admin/doctors/{id} - deactivate (not hard delete)
//     [HttpDelete("doctors/{id}")]
//     public async Task<IActionResult> DeactivateDoctor(int id)
//     {
//         var doctor = await _db.Doctors.Include(d => d.User).FirstOrDefaultAsync(d => d.DoctorId == id);
//         if (doctor == null) return NotFound();

//         doctor.User.Status  = "INACTIVE";
//         doctor.IsAvailable  = false;
//         await _db.SaveChangesAsync();
//         return Ok(new { message = "Doctor deactivated.", doctorId = id });
//     }

//     // GET /api/v1/admin/staff
//     [HttpGet("staff")]
//     public async Task<IActionResult> GetStaff()
//     {
//         var staff = await _db.Users
//             .Where(u => u.Role == "RECEPTIONIST")
//             .Select(u => new { u.UserId, u.Name, u.Email, u.Phone, u.Status, u.CreatedAt })
//             .ToListAsync();
//         return Ok(staff);
//     }

//     // POST /api/v1/admin/staff - create receptionist account
//     [HttpPost("staff")]
//     public async Task<IActionResult> CreateStaff(CreateStaffRequest req)
//     {
//         if (await _db.Users.AnyAsync(u => u.Email == req.Email))
//             return Conflict(new { message = "Email already registered." });

//         var user = new User
//         {
//             Name         = req.Name,
//             Email        = req.Email,
//             PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
//             Phone        = req.Phone,
//             Role         = "RECEPTIONIST",
//             Status       = "ACTIVE"
//         };
//         _db.Users.Add(user);
//         await _db.SaveChangesAsync();

//         return Ok(new { message = "Receptionist created.", userId = user.UserId });
//     }

//     // GET /api/v1/admin/analytics/snapshot
//     [HttpGet("analytics/snapshot")]
//     public async Task<IActionResult> GetSnapshot()
//     {
//         var snapshots = await _db.AnalyticsSnapshots
//             .OrderByDescending(s => s.ComputedAt)
//             .Take(20)
//             .ToListAsync();

//         if (!snapshots.Any())
//             return Ok(new { message = "No snapshots yet. Trigger a computation first." });

//         // Return latest value per metric key
//         var latest = snapshots
//             .GroupBy(s => s.MetricKey)
//             .Select(g => g.First())
//             .Select(s => new { s.MetricKey, s.MetricValue, s.SnapshotDate, s.ComputedAt });

//         return Ok(latest);
//     }

//     // POST /api/v1/admin/analytics/compute - trigger analytics recomputation
//     [HttpPost("analytics/compute")]
//     public async Task<IActionResult> Compute()
//     {
//         var today = DateOnly.FromDateTime(DateTime.Today);

//         // 1. Daily revenue
//         var dailyRevenue = await _db.Payments
//             .Where(p => p.PaidAt.HasValue &&
//                         DateOnly.FromDateTime(p.PaidAt.Value) == today &&
//                         p.Status == "PAID")
//             .SumAsync(p => p.Amount);

//         await UpsertSnapshot("DAILY_REVENUE", today,
//             System.Text.Json.JsonSerializer.Serialize(new { date = today, revenue = dailyRevenue }));

//         // 2. Appointment volume by hour (peak hours)
//         var byHour = await _db.Appointments
//             .Where(a => a.AppointmentDate == today)
//             .GroupBy(a => a.SlotTime.Hour)
//             .Select(g => new { hour = g.Key, count = g.Count() })
//             .OrderBy(x => x.hour)
//             .ToListAsync();

//         await UpsertSnapshot("APPOINTMENT_VOLUME_BY_HOUR", today,
//             System.Text.Json.JsonSerializer.Serialize(byHour));

//         // 3. Cancellation rate
//         var total = await _db.Appointments.CountAsync(a => a.AppointmentDate == today);
//         var cancelled = await _db.Appointments
//             .CountAsync(a => a.AppointmentDate == today && a.Status == "CANCELLED");
//         var rate = total > 0 ? Math.Round((double)cancelled / total * 100, 1) : 0;

//         await UpsertSnapshot("CANCELLATION_RATE", today,
//             System.Text.Json.JsonSerializer.Serialize(new { date = today, total, cancelled, rate }));

//         // 4. Doctor performance
//         var doctorStats = await _db.Appointments
//             .Include(a => a.Doctor.User)
//             .Where(a => a.AppointmentDate == today)
//             .GroupBy(a => new { a.DoctorId, a.Doctor.User.Name })
//             .Select(g => new
//             {
//                 doctorId   = g.Key.DoctorId,
//                 name       = g.Key.Name,
//                 total      = g.Count(),
//                 completed  = g.Count(a => a.Status == "COMPLETED"),
//                 noShow     = g.Count(a => a.Status == "NO_SHOW")
//             })
//             .ToListAsync();

//         await UpsertSnapshot("DOCTOR_PERFORMANCE", today,
//             System.Text.Json.JsonSerializer.Serialize(doctorStats));

//         await _db.SaveChangesAsync();

//         return Ok(new { message = "Analytics computed successfully.", computedAt = DateTime.UtcNow });
//     }

//     private async Task UpsertSnapshot(string key, DateOnly date, string value)
//     {
//         var existing = await _db.AnalyticsSnapshots
//             .FirstOrDefaultAsync(s => s.MetricKey == key && s.SnapshotDate == date);

//         if (existing != null)
//         {
//             existing.MetricValue = value;
//             existing.ComputedAt  = DateTime.UtcNow;
//         }
//         else
//         {
//             _db.AnalyticsSnapshots.Add(new AnalyticsSnapshot
//             {
//                 MetricKey    = key,
//                 SnapshotDate = date,
//                 MetricValue  = value,
//                 ComputedAt   = DateTime.UtcNow
//             });
//         }
//     }
// }
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicGo.API.Controllers;

[ApiController]
[Route("api/v1/admin")]
[Authorize(Roles = "ADMIN")]
public class AdminController : ControllerBase
{
    private static readonly List<object> _doctors = new()
    {
        new { DoctorId=1, UserId=3, Name="Dr. Anil Mehta",   Email="doctor@clinicgo.com",  Phone="9000000003", Status="ACTIVE", Specialization="General Physician", NewPatientFee=300, FollowUpFee=200, IsAvailable=true,  AverageRating=4.7 },
        new { DoctorId=2, UserId=4, Name="Dr. Sneha Iyer",   Email="doctor2@clinicgo.com", Phone="9000000004", Status="ACTIVE", Specialization="Dermatologist",      NewPatientFee=400, FollowUpFee=250, IsAvailable=true,  AverageRating=4.5 },
        new { DoctorId=3, UserId=9, Name="Dr. Ramesh Gupta", Email="doctor3@clinicgo.com", Phone="9000000005", Status="ACTIVE", Specialization="Paediatrician",      NewPatientFee=350, FollowUpFee=220, IsAvailable=false, AverageRating=4.8 },
    };

    private static readonly List<object> _staff = new()
    {
        new { UserId=2,  Name="Priya Joshi",  Email="receptionist@clinicgo.com",  Phone="9000000002", Status="ACTIVE", CreatedAt="2025-01-01T00:00:00Z" },
        new { UserId=10, Name="Suresh Kumar", Email="receptionist2@clinicgo.com", Phone="9000000006", Status="ACTIVE", CreatedAt="2025-01-15T00:00:00Z" },
    };

    private static readonly object _analytics = new
    {
        KpiCards = new
        {
            TotalPatientsToday    = 12,
            AppointmentsToday     = 18,
            RevenueToday          = 5400,
            ActiveDoctors         = 3,
            PendingConfirmations  = 4,
            CancellationRateToday = 11.1
        },
        RevenueTrend = new[]
        {
            new { Date="Apr 24", Revenue=4200 },
            new { Date="Apr 25", Revenue=5100 },
            new { Date="Apr 26", Revenue=3800 },
            new { Date="Apr 27", Revenue=6200 },
            new { Date="Apr 28", Revenue=4900 },
            new { Date="Apr 29", Revenue=5800 },
            new { Date="Apr 30", Revenue=5400 },
        },
        AppointmentsByHour = new[]
        {
            new { Hour="09:00", Count=5 },
            new { Hour="10:00", Count=8 },
            new { Hour="11:00", Count=6 },
            new { Hour="12:00", Count=3 },
            new { Hour="14:00", Count=7 },
            new { Hour="15:00", Count=4 },
            new { Hour="16:00", Count=2 },
        },
        PatientDemographics = new[]
        {
            new { Group="18-30", Percentage=35 },
            new { Group="31-45", Percentage=30 },
            new { Group="46-60", Percentage=22 },
            new { Group="60+",   Percentage=13 },
        },
        DoctorPerformance = new[]
        {
            new { DoctorId=1, Name="Dr. Anil Mehta",   AppointmentsHandled=128, CompletionRate=94.5, Revenue=42000, AvgRating=4.7 },
            new { DoctorId=2, Name="Dr. Sneha Iyer",   AppointmentsHandled=96,  CompletionRate=91.2, Revenue=38400, AvgRating=4.5 },
            new { DoctorId=3, Name="Dr. Ramesh Gupta", AppointmentsHandled=84,  CompletionRate=96.4, Revenue=29400, AvgRating=4.8 },
        }
    };

    [HttpGet("doctors")]   public IActionResult GetDoctors() => Ok(_doctors);
    [HttpPost("doctors")]  public IActionResult CreateDoctor([FromBody] object req) => Ok(new { message="Doctor created.", doctorId=4, userId=11 });
    [HttpPut("doctors/{id}")]    public IActionResult UpdateDoctor(int id, [FromBody] object req) => Ok(new { message="Doctor updated.", doctorId=id });
    [HttpDelete("doctors/{id}")] public IActionResult DeactivateDoctor(int id) => Ok(new { message="Doctor deactivated.", doctorId=id });
    [HttpGet("staff")]     public IActionResult GetStaff() => Ok(_staff);
    [HttpPost("staff")]    public IActionResult CreateStaff([FromBody] object req) => Ok(new { message="Receptionist created.", userId=12 });
[HttpGet("analytics/snapshot")]
public IActionResult GetSnapshot() => Ok(new object[]
{
    new { metricKey="DAILY_REVENUE",             metricValue="{\"revenue\":5400,\"date\":\"2026-04-30\"}", computedAt=DateTime.UtcNow },
    new { metricKey="CANCELLATION_RATE",          metricValue="{\"total\":18,\"cancelled\":2,\"rate\":11.1}", computedAt=DateTime.UtcNow },
    new { metricKey="APPOINTMENT_VOLUME_BY_HOUR", metricValue="[{\"hour\":9,\"count\":5},{\"hour\":10,\"count\":8},{\"hour\":11,\"count\":6},{\"hour\":12,\"count\":3},{\"hour\":14,\"count\":7},{\"hour\":15,\"count\":4},{\"hour\":16,\"count\":2}]", computedAt=DateTime.UtcNow },
    new { metricKey="DOCTOR_PERFORMANCE",         metricValue="[{\"name\":\"Dr. Anil Mehta\",\"total\":8,\"completed\":6},{\"name\":\"Dr. Sneha Iyer\",\"total\":6,\"completed\":5},{\"name\":\"Dr. Ramesh Gupta\",\"total\":4,\"completed\":4}]", computedAt=DateTime.UtcNow },
});

[HttpPost("analytics/compute")]
public IActionResult Compute() => GetSnapshot();}