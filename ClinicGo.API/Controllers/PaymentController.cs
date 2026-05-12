// using System.Security.Claims;
// using ClinicGo.API.Data;
// using ClinicGo.API.DTOs;
// using ClinicGo.API.Models;
// using Microsoft.AspNetCore.Authorization;
// using Microsoft.AspNetCore.Mvc;
// using Microsoft.EntityFrameworkCore;

// namespace ClinicGo.API.Controllers;

// [ApiController]
// [Route("api/v1/payments")]
// [Authorize]
// public class PaymentController : ControllerBase
// {
//     private readonly AppDbContext _db;

//     public PaymentController(AppDbContext db)
//     {
//         _db = db;
//     }

//     // POST /api/v1/payments/initiate - patient initiates online payment
//     [HttpPost("initiate")]
//     [Authorize(Roles = "PATIENT")]
//     public async Task<IActionResult> Initiate(InitiatePaymentRequest req)
//     {
//         var appointment = await _db.Appointments
//             .Include(a => a.Doctor)
//             .FirstOrDefaultAsync(a => a.AppointmentId == req.AppointmentId);

//         if (appointment == null)
//             return NotFound(new { message = "Appointment not found." });

//         var existingPayment = await _db.Payments
//             .AnyAsync(p => p.AppointmentId == req.AppointmentId);
//         if (existingPayment)
//             return Conflict(new { message = "Payment already exists for this appointment." });

//         var fee = appointment.Type == "NEW"
//             ? appointment.Doctor.NewPatientFee
//             : appointment.Doctor.FollowUpFee;

//         // Simulate payment - in production this calls UPI gateway
//         var payment = new Payment
//         {
//             AppointmentId  = req.AppointmentId,
//             Amount         = fee,
//             Method         = req.Method,
//             Status         = "PAID",  // simulated - assume instant success
//             TransactionRef = $"TXN{DateTime.UtcNow.Ticks}",
//             PaidAt         = DateTime.UtcNow
//         };

//         _db.Payments.Add(payment);
//         await _db.SaveChangesAsync();

//         return Ok(MapResponse(payment));
//     }

//     // POST /api/v1/payments/record-cash - receptionist records walk-in cash payment
//     [HttpPost("record-cash")]
//     [Authorize(Roles = "RECEPTIONIST")]
//     public async Task<IActionResult> RecordCash(RecordCashPaymentRequest req)
//     {
//         var appointment = await _db.Appointments.FindAsync(req.AppointmentId);
//         if (appointment == null)
//             return NotFound(new { message = "Appointment not found." });

//         var existingPayment = await _db.Payments
//             .AnyAsync(p => p.AppointmentId == req.AppointmentId);
//         if (existingPayment)
//             return Conflict(new { message = "Payment already recorded for this appointment." });

//         var payment = new Payment
//         {
//             AppointmentId  = req.AppointmentId,
//             Amount         = req.Amount,
//             Method         = "CASH",
//             Status         = "PAID",
//             TransactionRef = $"CASH{DateTime.UtcNow.Ticks}",
//             PaidAt         = DateTime.UtcNow
//         };

//         _db.Payments.Add(payment);
//         await _db.SaveChangesAsync();

//         return Ok(MapResponse(payment));
//     }

//     // GET /api/v1/payments/{appointmentId} - get payment for appointment
//     [HttpGet("{appointmentId}")]
//     public async Task<IActionResult> GetByAppointment(int appointmentId)
//     {
//         var payment = await _db.Payments
//             .FirstOrDefaultAsync(p => p.AppointmentId == appointmentId);

//         if (payment == null)
//             return NotFound(new { message = "No payment found for this appointment." });

//         return Ok(MapResponse(payment));
//     }

//     // GET /api/v1/payments/patient/{patientId}/history
//     [HttpGet("patient/{patientId}/history")]
//     public async Task<IActionResult> GetPatientHistory(int patientId)
//     {
//         var payments = await _db.Payments
//             .Include(p => p.Appointment)
//             .Where(p => p.Appointment.PatientId == patientId)
//             .OrderByDescending(p => p.PaidAt)
//             .ToListAsync();

//         return Ok(payments.Select(MapResponse));
//     }

//     // POST /api/v1/payments/{paymentId}/refund - process refund
//     [HttpPost("{paymentId}/refund")]
//     [Authorize(Roles = "ADMIN,RECEPTIONIST")]
//     public async Task<IActionResult> Refund(int paymentId)
//     {
//         var payment = await _db.Payments
//             .Include(p => p.Appointment)
//             .FirstOrDefaultAsync(p => p.PaymentId == paymentId);

//         if (payment == null)
//             return NotFound(new { message = "Payment not found." });

//         if (payment.Status == "REFUNDED")
//             return BadRequest(new { message = "Payment has already been refunded." });

//         if (payment.Method == "CASH")
//             return BadRequest(new { message = "Cash payments cannot be refunded via this endpoint." });

//         // Apply 24-hour refund rule
//         var appointment = payment.Appointment;
//         var appointmentDateTime = appointment.AppointmentDate.ToDateTime(appointment.SlotTime);
//         var hoursUntilAppointment = (appointmentDateTime - DateTime.UtcNow).TotalHours;

//         if (hoursUntilAppointment < 24)
//         {
//             payment.Status = "FORFEITED";
//             await _db.SaveChangesAsync();
//             return BadRequest(new { message = "Cancellation within 24 hours - no refund applicable." });
//         }

//         payment.Status     = "REFUNDED";
//         payment.RefundedAt = DateTime.UtcNow;
//         await _db.SaveChangesAsync();

//         return Ok(new { message = "Refund processed successfully.", paymentId });
//     }

//     private static PaymentResponse MapResponse(Payment p) => new()
//     {
//         PaymentId      = p.PaymentId,
//         AppointmentId  = p.AppointmentId,
//         Amount         = p.Amount,
//         Method         = p.Method,
//         Status         = p.Status,
//         TransactionRef = p.TransactionRef,
//         PaidAt         = p.PaidAt,
//         RefundedAt     = p.RefundedAt
//     };
// }
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicGo.API.Controllers;

[ApiController]
[Route("api/v1/payments")]
[Authorize]
public class PaymentController : ControllerBase
{
    private static readonly List<object> _payments = new()
    {
        new { PaymentId=1, AppointmentId=1, Amount=300, Method="UPI",       Status="PAID",     TransactionRef="TXN8823001",  PaidAt="2026-04-29T18:30:00Z", RefundedAt=(string?)null },
        new { PaymentId=2, AppointmentId=2, Amount=200, Method="CASH",      Status="PAID",     TransactionRef="CASH8823002", PaidAt="2026-04-30T09:10:00Z", RefundedAt=(string?)null },
        new { PaymentId=3, AppointmentId=3, Amount=300, Method="SIMULATED", Status="PAID",     TransactionRef="TXN8823003",  PaidAt="2026-04-28T12:00:00Z", RefundedAt=(string?)null },
        new { PaymentId=4, AppointmentId=4, Amount=400, Method="UPI",       Status="PAID",     TransactionRef="TXN8823004",  PaidAt="2026-04-29T20:00:00Z", RefundedAt=(string?)null },
        new { PaymentId=5, AppointmentId=7, Amount=300, Method="UPI",       Status="REFUNDED", TransactionRef="TXN8823005",  PaidAt="2026-04-27T10:00:00Z", RefundedAt="2026-04-27T11:00:00Z" },
        new { PaymentId=6, AppointmentId=5, Amount=200, Method="UPI",       Status="PAID",     TransactionRef="TXN8823006",  PaidAt="2026-04-24T09:00:00Z", RefundedAt=(string?)null },
    };

    [HttpPost("initiate")]
    [Authorize(Roles = "PATIENT")]
    public IActionResult Initiate([FromBody] object req)
        => Ok(new { PaymentId=7, AppointmentId=8, Amount=300, Method="UPI", Status="PAID", TransactionRef=$"TXN{DateTime.UtcNow.Ticks}", PaidAt=DateTime.UtcNow });

    [HttpPost("record-cash")]
    [Authorize(Roles = "RECEPTIONIST")]
    public IActionResult RecordCash([FromBody] object req)
        => Ok(new { PaymentId=8, Amount=300, Method="CASH", Status="PAID", TransactionRef=$"CASH{DateTime.UtcNow.Ticks}", PaidAt=DateTime.UtcNow });

    [HttpGet("{appointmentId}")]
    public IActionResult GetByAppointment(int appointmentId)
    {
        var p = _payments.FirstOrDefault(x => ((dynamic)x).AppointmentId == appointmentId);
        return p == null ? NotFound(new { message="No payment found." }) : Ok(p);
    }

    [HttpGet("patient/{patientId}/history")]
    public IActionResult GetPatientHistory(int patientId) => Ok(_payments.Take(4).ToList());

    [HttpPost("{paymentId}/refund")]
    [Authorize(Roles = "ADMIN,RECEPTIONIST")]
    public IActionResult Refund(int paymentId)
        => Ok(new { message="Refund processed successfully.", paymentId });
}