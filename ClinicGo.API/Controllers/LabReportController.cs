using System.Security.Claims;
using ClinicGo.API.Data;
using ClinicGo.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClinicGo.API.Controllers;

[ApiController]
[Route("api/v1/reports")]
[Authorize]
public class LabReportController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;

    public LabReportController(AppDbContext db, IWebHostEnvironment env)
    {
        _db  = db;
        _env = env;
    }

    // POST /api/v1/reports/upload — patient uploads lab report
    [HttpPost("upload")]
    [Authorize(Roles = "PATIENT")]
    public async Task<IActionResult> Upload(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file provided." });

        if (file.Length > 10 * 1024 * 1024)
            return BadRequest(new { message = "File exceeds 10MB limit." });

        var allowedTypes = new[] { "application/pdf", "image/jpeg", "image/png" };
        if (!allowedTypes.Contains(file.ContentType.ToLower()))
            return BadRequest(new { message = "Only PDF, JPG, and PNG files are allowed." });

        var patientId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        // Save file with UUID name to prevent conflicts
        var extension = Path.GetExtension(file.FileName);
        var uniqueName = $"{Guid.NewGuid()}{extension}";
        var uploadDir  = Path.Combine(_env.ContentRootPath, "Uploads", "LabReports");
        Directory.CreateDirectory(uploadDir);
        var filePath = Path.Combine(uploadDir, uniqueName);

        using (var stream = new FileStream(filePath, FileMode.Create))
            await file.CopyToAsync(stream);

        var fileType = extension.TrimStart('.').ToUpper();
        var report = new LabReport
        {
            PatientId  = patientId,
            FileName   = file.FileName,
            FilePath   = filePath,
            FileType   = fileType,
            UploadedAt = DateTime.UtcNow
        };

        _db.LabReports.Add(report);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            report.ReportId,
            report.FileName,
            report.FileType,
            report.UploadedAt,
            message = "Lab report uploaded successfully."
        });
    }

    // GET /api/v1/reports/patient/{patientId} — list all reports for a patient
    [HttpGet("patient/{patientId}")]
    public async Task<IActionResult> GetByPatient(int patientId)
    {
        var reports = await _db.LabReports
            .Where(r => r.PatientId == patientId)
            .OrderByDescending(r => r.UploadedAt)
            .Select(r => new
            {
                r.ReportId,
                r.FileName,
                r.FileType,
                r.UploadedAt
            })
            .ToListAsync();

        return Ok(reports);
    }

    // GET /api/v1/reports/{reportId}/download — download a specific report
    [HttpGet("{reportId}/download")]
    public async Task<IActionResult> Download(int reportId)
    {
        var report = await _db.LabReports.FindAsync(reportId);
        if (report == null) return NotFound(new { message = "Report not found." });

        if (!System.IO.File.Exists(report.FilePath))
            return NotFound(new { message = "File not found on server." });

        var contentType = report.FileType switch
        {
            "PDF" => "application/pdf",
            "JPG" => "image/jpeg",
            "PNG" => "image/png",
            _     => "application/octet-stream"
        };

        var bytes = await System.IO.File.ReadAllBytesAsync(report.FilePath);
        return File(bytes, contentType, report.FileName);
    }
}
