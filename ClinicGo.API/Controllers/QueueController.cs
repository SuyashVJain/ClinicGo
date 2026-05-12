// using ClinicGo.API.Data;
// using Microsoft.AspNetCore.Authorization;
// using Microsoft.AspNetCore.Mvc;
// using Microsoft.EntityFrameworkCore;

// namespace ClinicGo.API.Controllers;

// [ApiController]
// [Route("api/v1/queue")]
// [Authorize]
// public class QueueController : ControllerBase
// {
//     private readonly AppDbContext _db;

//     public QueueController(AppDbContext db)
//     {
//         _db = db;
//     }

//     // GET /api/v1/queue/today/{doctorId} - full queue for a doctor today
//     [HttpGet("today/{doctorId}")]
//     [Authorize(Roles = "DOCTOR,RECEPTIONIST")]
//     public async Task<IActionResult> GetTodayQueue(int doctorId)
//     {
//         var today = DateOnly.FromDateTime(DateTime.Today);

//         var queue = await _db.Appointments
//             .Include(a => a.Patient)
//             .Where(a => a.DoctorId == doctorId &&
//                         a.AppointmentDate == today &&
//                         a.Status != "CANCELLED")
//             .OrderBy(a => a.TokenNumber)
//             .Select(a => new
//             {
//                 a.AppointmentId,
//                 a.TokenNumber,
//                 a.SlotTime,
//                 a.Type,
//                 a.Status,
//                 a.BookingChannel,
//                 Patient = new
//                 {
//                     a.Patient.UserId,
//                     a.Patient.Name,
//                     a.Patient.Phone
//                 }
//             })
//             .ToListAsync();

//         var summary = new
//         {
//             DoctorId   = doctorId,
//             Date       = today,
//             Total      = queue.Count,
//             Completed  = queue.Count(q => q.Status == "COMPLETED"),
//             InProgress = queue.Count(q => q.Status == "CONFIRMED"),
//             Waiting    = queue.Count(q => q.Status == "PENDING_CONFIRMATION"),
//             NoShow     = queue.Count(q => q.Status == "NO_SHOW"),
//             Queue      = queue
//         };

//         return Ok(summary);
//     }

//     // PUT /api/v1/queue/{appointmentId}/next - advance queue (mark current as complete)
//     [HttpPut("{appointmentId}/next")]
//     [Authorize(Roles = "RECEPTIONIST")]
//     public async Task<IActionResult> CallNext(int appointmentId)
//     {
//         var appointment = await _db.Appointments.FindAsync(appointmentId);
//         if (appointment == null) return NotFound();

//         appointment.Status = "COMPLETED";
//         await _db.SaveChangesAsync();

//         // Find the next waiting appointment
//         var today = DateOnly.FromDateTime(DateTime.Today);
//         var next = await _db.Appointments
//             .Include(a => a.Patient)
//             .Where(a => a.DoctorId == appointment.DoctorId &&
//                         a.AppointmentDate == today &&
//                         a.Status == "CONFIRMED" &&
//                         a.TokenNumber > appointment.TokenNumber)
//             .OrderBy(a => a.TokenNumber)
//             .FirstOrDefaultAsync();

//         return Ok(new
//         {
//             message       = "Queue advanced.",
//             completedToken = appointment.TokenNumber,
//             nextPatient   = next == null ? null : new
//             {
//                 next.AppointmentId,
//                 next.TokenNumber,
//                 next.Patient.Name,
//                 next.SlotTime
//             }
//         });
//     }

//     // PUT /api/v1/queue/{appointmentId}/skip - mark as no-show
//     [HttpPut("{appointmentId}/skip")]
//     [Authorize(Roles = "RECEPTIONIST")]
//     public async Task<IActionResult> Skip(int appointmentId)
//     {
//         var appointment = await _db.Appointments.FindAsync(appointmentId);
//         if (appointment == null) return NotFound();

//         appointment.Status = "NO_SHOW";
//         await _db.SaveChangesAsync();

//         return Ok(new { message = "Marked as no-show.", appointmentId, token = appointment.TokenNumber });
//     }
// }
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicGo.API.Controllers;

[ApiController]
[Route("api/v1/queue")]
[Authorize]
public class QueueController : ControllerBase
{
    private static readonly object _queue = new
    {
        DoctorId=1, Date="2026-04-30", Total=3, Completed=1, InProgress=2, Waiting=0, NoShow=0,
        Queue=new object[]
        {
            new { AppointmentId=1, TokenNumber=1, SlotTime="09:00", Type="NEW",       Status="CONFIRMED", BookingChannel="ONLINE", Patient=new { UserId=5, Name="Riya Sharma", Phone="9111111101" } },
            new { AppointmentId=2, TokenNumber=2, SlotTime="09:20", Type="FOLLOW_UP", Status="CONFIRMED", BookingChannel="WALKIN", Patient=new { UserId=6, Name="Arjun Verma", Phone="9111111102" } },
            new { AppointmentId=3, TokenNumber=3, SlotTime="09:40", Type="NEW",       Status="COMPLETED", BookingChannel="ONLINE", Patient=new { UserId=7, Name="Meena Patel", Phone="9111111103" } },
        }
    };

    [HttpGet("today/{doctorId}")]
    [Authorize(Roles = "DOCTOR,RECEPTIONIST")]
    public IActionResult GetTodayQueue(int doctorId) => Ok(_queue);

    [HttpPut("{appointmentId}/next")]
    [Authorize(Roles = "RECEPTIONIST")]
    public IActionResult CallNext(int appointmentId)
        => Ok(new { message="Queue advanced.", completedToken=appointmentId, nextPatient=new { AppointmentId=2, TokenNumber=2, Name="Arjun Verma", SlotTime="09:20" } });

    [HttpPut("{appointmentId}/skip")]
    [Authorize(Roles = "RECEPTIONIST")]
    public IActionResult Skip(int appointmentId)
        => Ok(new { message="Marked as no-show.", appointmentId, token=appointmentId });
}