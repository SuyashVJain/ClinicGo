// using System.Security.Claims;
// using ClinicGo.API.Data;
// using ClinicGo.API.DTOs;
// using ClinicGo.API.Models;
// using Microsoft.AspNetCore.Authorization;
// using Microsoft.AspNetCore.Mvc;
// using Microsoft.EntityFrameworkCore;

// namespace ClinicGo.API.Controllers;

// [ApiController]
// [Route("api/v1/prescriptions")]
// [Authorize]
// public class PrescriptionController : ControllerBase
// {
//     private readonly AppDbContext _db;

//     public PrescriptionController(AppDbContext db)
//     {
//         _db = db;
//     }

//     // POST /api/v1/prescriptions - doctor writes prescription
//     [HttpPost]
//     [Authorize(Roles = "DOCTOR")]
//     public async Task<IActionResult> Create(CreatePrescriptionRequest req)
//     {
//         var doctorUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
//         var doctor = await _db.Doctors.FirstOrDefaultAsync(d => d.UserId == doctorUserId);
//         if (doctor == null) return Forbid();

//         var appointment = await _db.Appointments.FindAsync(req.AppointmentId);
//         if (appointment == null) return NotFound(new { message = "Appointment not found." });
//         if (appointment.DoctorId != doctor.DoctorId)
//             return Forbid();
//         if (appointment.Status != "CONFIRMED" && appointment.Status != "COMPLETED")
//             return BadRequest(new { message = "Appointment must be confirmed before writing a prescription." });

//         // Check prescription doesn't already exist (immutable)
//         var existing = await _db.Prescriptions
//             .AnyAsync(p => p.AppointmentId == req.AppointmentId);
//         if (existing)
//             return Conflict(new { message = "A prescription already exists for this appointment." });

//         var prescription = new Prescription
//         {
//             AppointmentId        = req.AppointmentId,
//             DoctorId             = doctor.DoctorId,
//             Diagnosis            = req.Diagnosis,
//             FollowUpInstructions = req.FollowUpInstructions,
//             Medicines            = req.Medicines.Select(m => new PrescriptionMedicine
//             {
//                 MedicineName = m.MedicineName,
//                 Dosage       = m.Dosage,
//                 Frequency    = m.Frequency,
//                 Duration     = m.Duration
//             }).ToList()
//         };

//         _db.Prescriptions.Add(prescription);

//         // Auto-complete the appointment when prescription is written
//         appointment.Status = "COMPLETED";
//         await _db.SaveChangesAsync();

//         return CreatedAtAction(nameof(GetByAppointment),
//             new { appointmentId = req.AppointmentId },
//             await MapToResponse(prescription.PrescriptionId));
//     }

//     // GET /api/v1/prescriptions/{appointmentId} - get prescription for appointment
//     [HttpGet("{appointmentId}")]
//     public async Task<IActionResult> GetByAppointment(int appointmentId)
//     {
//         var prescription = await _db.Prescriptions
//             .Include(p => p.Doctor.User)
//             .Include(p => p.Medicines)
//             .FirstOrDefaultAsync(p => p.AppointmentId == appointmentId);

//         if (prescription == null)
//             return NotFound(new { message = "No prescription found for this appointment." });

//         return Ok(MapResponse(prescription));
//     }

//     // GET /api/v1/prescriptions/patient/{patientId} - all prescriptions for a patient
//     [HttpGet("patient/{patientId}")]
//     public async Task<IActionResult> GetByPatient(int patientId)
//     {
//         var prescriptions = await _db.Prescriptions
//             .Include(p => p.Doctor.User)
//             .Include(p => p.Medicines)
//             .Include(p => p.Appointment)
//             .Where(p => p.Appointment.PatientId == patientId)
//             .OrderByDescending(p => p.CreatedAt)
//             .ToListAsync();

//         return Ok(prescriptions.Select(MapResponse));
//     }

//     private async Task<PrescriptionResponse?> MapToResponse(int prescriptionId)
//     {
//         var p = await _db.Prescriptions
//             .Include(p => p.Doctor.User)
//             .Include(p => p.Medicines)
//             .FirstOrDefaultAsync(p => p.PrescriptionId == prescriptionId);
//         return p == null ? null : MapResponse(p);
//     }

//     private static PrescriptionResponse MapResponse(Prescription p) => new()
//     {
//         PrescriptionId       = p.PrescriptionId,
//         AppointmentId        = p.AppointmentId,
//         DoctorId             = p.DoctorId,
//         DoctorName           = p.Doctor?.User?.Name ?? "",
//         Diagnosis            = p.Diagnosis,
//         FollowUpInstructions = p.FollowUpInstructions,
//         CreatedAt            = p.CreatedAt,
//         Medicines            = p.Medicines.Select(m => new MedicineResponse
//         {
//             MedicineId   = m.MedicineId,
//             MedicineName = m.MedicineName,
//             Dosage       = m.Dosage,
//             Frequency    = m.Frequency,
//             Duration     = m.Duration
//         }).ToList()
//     };
// }
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicGo.API.Controllers;

[ApiController]
[Route("api/v1/prescriptions")]
[Authorize]
public class PrescriptionController : ControllerBase
{
    private static readonly List<object> _prescriptions = new()
    {
        new
        {
            PrescriptionId=1, AppointmentId=3, DoctorId=1, DoctorName="Dr. Anil Mehta",
            Diagnosis="Acute upper respiratory tract infection",
            FollowUpInstructions="Rest for 3 days. Return if fever persists beyond 5 days.",
            CreatedAt="2026-04-30T10:15:00Z",
            Medicines=new object[]
            {
                new { MedicineId=1, MedicineName="Paracetamol 500mg",  Dosage="1 tablet", Frequency="Three times daily after meals", Duration="5 days" },
                new { MedicineId=2, MedicineName="Azithromycin 250mg", Dosage="1 tablet", Frequency="Once daily",                   Duration="3 days" },
                new { MedicineId=3, MedicineName="Cough Syrup",        Dosage="10ml",     Frequency="Twice daily",                  Duration="5 days" },
            }
        },
        new
        {
            PrescriptionId=2, AppointmentId=5, DoctorId=1, DoctorName="Dr. Anil Mehta",
            Diagnosis="Seasonal allergy with mild rhinitis",
            FollowUpInstructions="Return in 2 weeks if symptoms persist.",
            CreatedAt="2026-04-25T11:30:00Z",
            Medicines=new object[]
            {
                new { MedicineId=4, MedicineName="Cetirizine 10mg", Dosage="1 tablet", Frequency="Once daily at night", Duration="7 days" },
                new { MedicineId=5, MedicineName="Nasal Spray",     Dosage="2 puffs",  Frequency="Twice daily",        Duration="5 days" },
            }
        },
        new
        {
            PrescriptionId=3, AppointmentId=6, DoctorId=2, DoctorName="Dr. Sneha Iyer",
            Diagnosis="Mild eczema — dry skin patches on forearms",
            FollowUpInstructions="Avoid harsh soaps. Apply moisturizer twice daily.",
            CreatedAt="2026-04-22T14:30:00Z",
            Medicines=new object[]
            {
                new { MedicineId=6, MedicineName="Hydrocortisone Cream 1%", Dosage="Thin layer", Frequency="Twice daily on affected area", Duration="10 days" },
                new { MedicineId=7, MedicineName="Cetaphil Moisturizer",    Dosage="As needed",  Frequency="After bath and before bed",    Duration="Ongoing" },
            }
        }
    };

    [HttpPost]
    [Authorize(Roles = "DOCTOR")]
    public IActionResult Create([FromBody] object req)
        => Ok(new { PrescriptionId=4, message="Prescription created successfully." });

    [HttpGet("{appointmentId}")]
    public IActionResult GetByAppointment(int appointmentId)
    {
        var p = _prescriptions.FirstOrDefault(x => ((dynamic)x).AppointmentId == appointmentId);
        return p == null ? NotFound(new { message="No prescription found." }) : Ok(p);
    }

    [HttpGet("patient/{patientId}")]
    public IActionResult GetByPatient(int patientId) => Ok(_prescriptions);
}