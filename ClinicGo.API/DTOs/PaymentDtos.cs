namespace ClinicGo.API.DTOs;

public class InitiatePaymentRequest
{
    public int AppointmentId { get; set; }
    public string Method { get; set; } = "UPI"; // UPI | SIMULATED
}

public class RecordCashPaymentRequest
{
    public int AppointmentId { get; set; }
    public decimal Amount { get; set; }
}

public class PaymentResponse
{
    public int PaymentId { get; set; }
    public int AppointmentId { get; set; }
    public decimal Amount { get; set; }
    public string Method { get; set; } = "";
    public string Status { get; set; } = "";
    public string? TransactionRef { get; set; }
    public DateTime? PaidAt { get; set; }
    public DateTime? RefundedAt { get; set; }
}
