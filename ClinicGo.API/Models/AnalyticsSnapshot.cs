using System.ComponentModel.DataAnnotations;

namespace ClinicGo.API.Models;

public class AnalyticsSnapshot
{
    
[Key]
    public int SnapshotId { get; set; }

    public DateOnly SnapshotDate { get; set; }
    public string MetricKey { get; set; } = "";
    public string MetricValue { get; set; } = "";
    public DateTime ComputedAt { get; set; } = DateTime.UtcNow;
}