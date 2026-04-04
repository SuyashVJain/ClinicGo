using System.ComponentModel.DataAnnotations;
namespace ClinicGo.API.Models;

public class LabReport
{
    [Key]
    public int ReportId { get; set; }
    public int PatientId { get; set; }
    public string FileName { get; set; } = "";
    public string FilePath { get; set; } = "";
    public string FileType { get; set; } = ""; // PDF | JPG | PNG
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User Patient { get; set; } = null!;
}