// using ClinicGo.API.Data;
// using Microsoft.AspNetCore.Authorization;
// using Microsoft.AspNetCore.Mvc;
// using Microsoft.EntityFrameworkCore;

// namespace ClinicGo.API.Controllers;

// [ApiController]
// [Route("api/v1/chat")]
// [Authorize]
// public class ChatController : ControllerBase
// {
//     private readonly AppDbContext _db;

//     public ChatController(AppDbContext db)
//     {
//         _db = db;
//     }

//     // GET /api/v1/chat/history/{appointmentId}
//     [HttpGet("history/{appointmentId}")]
//     [Authorize(Roles = "PATIENT,DOCTOR")]
//     public async Task<IActionResult> GetHistory(int appointmentId)
//     {
//         var messages = await _db.ChatMessages
//             .Include(m => m.Sender)
//             .Where(m => m.AppointmentId == appointmentId)
//             .OrderBy(m => m.SentAt)
//             .Select(m => new
//             {
//                 m.MessageId,
//                 m.SenderId,
//                 SenderName = m.Sender.Name,
//                 m.ReceiverId,
//                 m.Content,
//                 m.SentAt,
//                 m.IsRead
//             })
//             .ToListAsync();

//         return Ok(messages);
//     }
// }
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicGo.API.Controllers;

[ApiController]
[Route("api/v1/chat")]
[Authorize]
public class ChatController : ControllerBase
{
    private static readonly List<object> _messages = new()
    {
        new { MessageId=1, SenderId=5, SenderName="Riya Sharma",    ReceiverId=3, Content="Good morning Doctor, I wanted to ask about the dosage of the cough syrup.", SentAt="2026-04-30T09:05:00Z", IsRead=true  },
        new { MessageId=2, SenderId=3, SenderName="Dr. Anil Mehta", ReceiverId=5, Content="Good morning Riya! Take 10ml after meals, twice a day. Avoid taking on empty stomach.", SentAt="2026-04-30T09:10:00Z", IsRead=true  },
        new { MessageId=3, SenderId=5, SenderName="Riya Sharma",    ReceiverId=3, Content="Thank you Doctor. Should I continue the antibiotic even if I feel better?", SentAt="2026-04-30T09:12:00Z", IsRead=true  },
        new { MessageId=4, SenderId=3, SenderName="Dr. Anil Mehta", ReceiverId=5, Content="Yes, please complete the full course of 3 days. Do not stop early.", SentAt="2026-04-30T09:14:00Z", IsRead=false },
    };

    [HttpGet("history/{appointmentId}")]
    [Authorize(Roles = "PATIENT,DOCTOR")]
    public IActionResult GetHistory(int appointmentId) => Ok(_messages);
}
