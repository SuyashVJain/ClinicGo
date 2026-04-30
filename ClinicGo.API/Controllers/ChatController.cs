using ClinicGo.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClinicGo.API.Controllers;

[ApiController]
[Route("api/v1/chat")]
[Authorize]
public class ChatController : ControllerBase
{
    private readonly AppDbContext _db;

    public ChatController(AppDbContext db)
    {
        _db = db;
    }

    // GET /api/v1/chat/history/{appointmentId}
    [HttpGet("history/{appointmentId}")]
    [Authorize(Roles = "PATIENT,DOCTOR")]
    public async Task<IActionResult> GetHistory(int appointmentId)
    {
        var messages = await _db.ChatMessages
            .Include(m => m.Sender)
            .Where(m => m.AppointmentId == appointmentId)
            .OrderBy(m => m.SentAt)
            .Select(m => new
            {
                m.MessageId,
                m.SenderId,
                SenderName = m.Sender.Name,
                m.ReceiverId,
                m.Content,
                m.SentAt,
                m.IsRead
            })
            .ToListAsync();

        return Ok(messages);
    }
}