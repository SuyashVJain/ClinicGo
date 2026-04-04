using System.Security.Claims;
using ClinicGo.API.Data;
using ClinicGo.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace ClinicGo.API.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly AppDbContext _db;

    public ChatHub(AppDbContext db)
    {
        _db = db;
    }

    // Called by client to send a message
    public async Task SendMessage(int receiverId, int appointmentId, string content)
    {
        var senderId = int.Parse(Context.User!
            .FindFirst(ClaimTypes.NameIdentifier)!.Value);

        // Verify appointment exists and both users are part of it
        var appointment = await _db.Appointments
            .Include(a => a.Doctor)
            .FirstOrDefaultAsync(a => a.AppointmentId == appointmentId);

        if (appointment == null) return;

        // Persist message to database
        var message = new ChatMessage
        {
            SenderId      = senderId,
            ReceiverId    = receiverId,
            AppointmentId = appointmentId,
            Content       = content,
            SentAt        = DateTime.UtcNow,
            IsRead        = false
        };

        _db.ChatMessages.Add(message);
        await _db.SaveChangesAsync();

        var payload = new
        {
            message.MessageId,
            message.SenderId,
            message.ReceiverId,
            message.AppointmentId,
            message.Content,
            message.SentAt,
            message.IsRead
        };

        // Push to receiver's connection
        await Clients.User(receiverId.ToString())
            .SendAsync("ReceiveMessage", payload);

        // Echo back to sender to confirm delivery
        await Clients.Caller.SendAsync("MessageSent", payload);
    }

    // Called by client to mark messages as read
    public async Task MarkRead(int appointmentId, int senderId)
    {
        var receiverId = int.Parse(Context.User!
            .FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var unread = await _db.ChatMessages
            .Where(m => m.AppointmentId == appointmentId &&
                        m.SenderId == senderId &&
                        m.ReceiverId == receiverId &&
                        !m.IsRead)
            .ToListAsync();

        unread.ForEach(m => m.IsRead = true);
        await _db.SaveChangesAsync();
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId != null)
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
        await base.OnConnectedAsync();
    }
}
