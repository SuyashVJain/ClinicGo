// using ClinicGo.API.Data;
// using ClinicGo.API.Services;
// using Microsoft.AspNetCore.Authorization;
// using Microsoft.AspNetCore.Mvc;
// using Microsoft.EntityFrameworkCore;

// namespace ClinicGo.API.Controllers;

// [ApiController]
// [Route("api/v1/patients")]
// [Authorize]
// public class PatientController : ControllerBase
// {
//     private readonly AppDbContext _db;

//     public PatientController(AppDbContext db)
//     {
//         _db = db;
//     }

//     // GET /api/v1/patients/pending - receptionist sees all pending registrations
//     [HttpGet("pending")]
//     [Authorize(Roles = "RECEPTIONIST,ADMIN")]
//     public async Task<IActionResult> GetPending()
//     {
//         var pending = await _db.Users
//             .Where(u => u.Role == "PATIENT" && u.Status == "PENDING")
//             .Select(u => new
//             {
//                 u.UserId,
//                 u.Name,
//                 u.Email,
//                 u.Phone,
//                 u.CreatedAt
//             })
//             .OrderBy(u => u.CreatedAt)
//             .ToListAsync();

//         return Ok(pending);
//     }

//     // PUT /api/v1/patients/{id}/approve - receptionist approves patient
//     [HttpPut("{id}/approve")]
//     [Authorize(Roles = "RECEPTIONIST,ADMIN")]
//     public async Task<IActionResult> Approve(int id)
//     {
//         var user = await _db.Users.FindAsync(id);
//         if (user == null || user.Role != "PATIENT")
//             return NotFound(new { message = "Patient not found." });

//         if (user.Status == "ACTIVE")
//             return BadRequest(new { message = "Patient is already active." });

//         user.Status = "ACTIVE";
//         await _db.SaveChangesAsync();

//         return Ok(new { message = $"{user.Name} has been approved.", userId = id });
//     }

//     // PUT /api/v1/patients/{id}/reject - receptionist rejects patient
//     [HttpPut("{id}/reject")]
//     [Authorize(Roles = "RECEPTIONIST,ADMIN")]
//     public async Task<IActionResult> Reject(int id)
//     {
//         var user = await _db.Users.FindAsync(id);
//         if (user == null || user.Role != "PATIENT")
//             return NotFound(new { message = "Patient not found." });

//         user.Status = "INACTIVE";
//         await _db.SaveChangesAsync();

//         return Ok(new { message = $"{user.Name} has been rejected.", userId = id });
//     }

//     // GET /api/v1/patients/{id}/history - full appointment + prescription history
//     [HttpGet("{id}/history")]
//     [Authorize(Roles = "DOCTOR,RECEPTIONIST,ADMIN")]
//     public async Task<IActionResult> GetHistory(int id)
//     {
//         var patient = await _db.Users.FindAsync(id);
//         if (patient == null || patient.Role != "PATIENT")
//             return NotFound(new { message = "Patient not found." });

//         var history = await _db.Appointments
//             .Include(a => a.Doctor.User)
//             .Include(a => a.Prescription)
//                 .ThenInclude(p => p!.Medicines)
//             .Where(a => a.PatientId == id)
//             .OrderByDescending(a => a.AppointmentDate)
//             .Select(a => new
//             {
//                 a.AppointmentId,
//                 a.AppointmentDate,
//                 a.SlotTime,
//                 a.TokenNumber,
//                 a.Type,
//                 a.Status,
//                 a.BookingChannel,
//                 Doctor = a.Doctor.User.Name,
//                 Specialization = a.Doctor.Specialization,
//                 Prescription = a.Prescription == null ? null : new
//                 {
//                     a.Prescription.PrescriptionId,
//                     a.Prescription.Diagnosis,
//                     a.Prescription.FollowUpInstructions,
//                     a.Prescription.CreatedAt,
//                     Medicines = a.Prescription.Medicines.Select(m => new
//                     {
//                         m.MedicineName,
//                         m.Dosage,
//                         m.Frequency,
//                         m.Duration
//                     })
//                 }
//             })
//             .ToListAsync();

//         return Ok(new
//         {
//             patient.UserId,
//             patient.Name,
//             patient.Email,
//             patient.Phone,
//             TotalVisits = history.Count,
//             History = history
//         });
//     }

//     // GET /api/v1/patients - search patients (receptionist/doctor)
//     [HttpGet]
//     [Authorize(Roles = "DOCTOR,RECEPTIONIST,ADMIN")]
//     public async Task<IActionResult> Search([FromQuery] string? name)
//     {
//         var query = _db.Users.Where(u => u.Role == "PATIENT");

//         if (!string.IsNullOrEmpty(name))
//             query = query.Where(u => u.Name.Contains(name));

//         var patients = await query
//             .Select(u => new
//             {
//                 u.UserId,
//                 u.Name,
//                 u.Email,
//                 u.Phone,
//                 u.Status,
//                 u.CreatedAt
//             })
//             .OrderBy(u => u.Name)
//             .ToListAsync();

//         return Ok(patients);
//     }
// }
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicGo.API.Controllers;

[ApiController]
[Route("api/v1/patients")]
[Authorize]
public class PatientController : ControllerBase
{
    private static readonly List<object> _patients = new()
    {
        new { UserId=5,  Name="Riya Sharma",  Email="riya@gmail.com",  Phone="9111111101", Status="ACTIVE",  CreatedAt="2026-01-10T09:00:00Z" },
        new { UserId=6,  Name="Arjun Verma",  Email="arjun@gmail.com", Phone="9111111102", Status="ACTIVE",  CreatedAt="2026-01-12T10:30:00Z" },
        new { UserId=7,  Name="Meena Patel",  Email="meena@gmail.com", Phone="9111111103", Status="ACTIVE",  CreatedAt="2026-01-14T11:00:00Z" },
        new { UserId=8,  Name="Rohit Singh",  Email="rohit@gmail.com", Phone="9111111104", Status="ACTIVE",  CreatedAt="2026-01-15T08:00:00Z" },
        new { UserId=11, Name="Kavya Nair",   Email="kavya@gmail.com", Phone="9111111105", Status="PENDING", CreatedAt="2026-04-29T14:00:00Z" },
        new { UserId=12, Name="Suraj Tiwari", Email="suraj@gmail.com", Phone="9111111106", Status="PENDING", CreatedAt="2026-04-30T08:30:00Z" },
    };

    private static readonly object _history = new
    {
        UserId=5, Name="Riya Sharma", Email="riya@gmail.com", Phone="9111111101", TotalVisits=3,
        History = new object[]
        {
            new
            {
                AppointmentId=5, AppointmentDate="2026-04-25", SlotTime="11:00", TokenNumber=4,
                Type="FOLLOW_UP", Status="COMPLETED", BookingChannel="ONLINE",
                Doctor="Dr. Anil Mehta", Specialization="General Physician",
                Prescription = new
                {
                    PrescriptionId=2, Diagnosis="Seasonal allergy with mild rhinitis",
                    FollowUpInstructions="Return in 2 weeks if symptoms persist.",
                    CreatedAt="2026-04-25T11:30:00Z",
                    Medicines = new[]
                    {
                        new { MedicineName="Cetirizine 10mg", Dosage="1 tablet", Frequency="Once daily at night", Duration="7 days" },
                        new { MedicineName="Nasal Spray",     Dosage="2 puffs",  Frequency="Twice daily",        Duration="5 days" },
                    }
                }
            },
            new
            {
                AppointmentId=1, AppointmentDate="2026-04-30", SlotTime="09:00", TokenNumber=1,
                Type="NEW", Status="CONFIRMED", BookingChannel="ONLINE",
                Doctor="Dr. Anil Mehta", Specialization="General Physician",
                Prescription=(object?)null
            }
        }
    };

    [HttpGet("pending")]
    [Authorize(Roles = "RECEPTIONIST,ADMIN")]
    public IActionResult GetPending()
        => Ok(_patients.Where(p => ((dynamic)p).Status == "PENDING").ToList());

    [HttpPut("{id}/approve")]
    [Authorize(Roles = "RECEPTIONIST,ADMIN")]
    public IActionResult Approve(int id) => Ok(new { message="Patient approved.", userId=id });

    [HttpPut("{id}/reject")]
    [Authorize(Roles = "RECEPTIONIST,ADMIN")]
    public IActionResult Reject(int id) => Ok(new { message="Patient rejected.", userId=id });

    [HttpGet("{id}/history")]
    [Authorize(Roles = "DOCTOR,RECEPTIONIST,ADMIN")]
    public IActionResult GetHistory(int id) => Ok(_history);

    [HttpGet]
    [Authorize(Roles = "DOCTOR,RECEPTIONIST,ADMIN")]
    public IActionResult Search([FromQuery] string? name)
        => Ok(_patients.Where(p => ((dynamic)p).Status == "ACTIVE").ToList());
}