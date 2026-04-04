using System.ComponentModel.DataAnnotations;
namespace ClinicGo.API.Models;

public class ChatMessage
{
    [Key]
    public int MessageId { get; set; }
    public int SenderId { get; set; }
    public int ReceiverId { get; set; }
    public int AppointmentId { get; set; }
    public string Content { get; set; } = "";
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
    public bool IsRead { get; set; } = false;

    // Navigation
    public User Sender { get; set; } = null!;
    public User Receiver { get; set; } = null!;
    public Appointment Appointment { get; set; } = null!;
}