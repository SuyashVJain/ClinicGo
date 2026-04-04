using System.ComponentModel.DataAnnotations;
namespace ClinicGo.API.Models;

public class Payment
{
    [Key]
    public int PaymentId { get; set; }
    public int AppointmentId { get; set; }
    public decimal Amount { get; set; }
    public string Method { get; set; } = "UPI"; // UPI | CASH | SIMULATED
    public string Status { get; set; } = "PENDING"; // PENDING | PAID | REFUNDED | FORFEITED
    public string? TransactionRef { get; set; }
    public DateTime? PaidAt { get; set; }
    public DateTime? RefundedAt { get; set; }

    // Navigation
    public Appointment Appointment { get; set; } = null!;
}