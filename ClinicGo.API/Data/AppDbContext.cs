using ClinicGo.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ClinicGo.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Doctor> Doctors { get; set; }
    public DbSet<DoctorSchedule> DoctorSchedules { get; set; }
    public DbSet<Appointment> Appointments { get; set; }
    public DbSet<Payment> Payments { get; set; }
    public DbSet<Prescription> Prescriptions { get; set; }
    public DbSet<PrescriptionMedicine> PrescriptionMedicines { get; set; }
    public DbSet<ChatMessage> ChatMessages { get; set; }
    public DbSet<LabReport> LabReports { get; set; }
    public DbSet<AnalyticsSnapshot> AnalyticsSnapshots { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Unique email
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email).IsUnique();

        // Doctor → User (one-to-one)
        modelBuilder.Entity<Doctor>()
            .HasOne(d => d.User)
            .WithOne(u => u.Doctor)
            .HasForeignKey<Doctor>(d => d.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Appointment → Patient
        modelBuilder.Entity<Appointment>()
            .HasOne(a => a.Patient)
            .WithMany(u => u.PatientAppointments)
            .HasForeignKey(a => a.PatientId)
            .OnDelete(DeleteBehavior.Restrict);

        // Appointment → Doctor
        modelBuilder.Entity<Appointment>()
            .HasOne(a => a.Doctor)
            .WithMany(d => d.Appointments)
            .HasForeignKey(a => a.DoctorId)
            .OnDelete(DeleteBehavior.Restrict);


        // Prescription → Appointment (NO CASCADE - fixes the cycle)
        modelBuilder.Entity<Prescription>()
            .HasOne(p => p.Appointment)
            .WithOne(a => a.Prescription)
            .HasForeignKey<Prescription>(p => p.AppointmentId)
            .OnDelete(DeleteBehavior.Restrict);

        // Prescription → Doctor (NO CASCADE - fixes the cycle)
        modelBuilder.Entity<Prescription>()
            .HasOne(p => p.Doctor)
            .WithMany(d => d.Prescriptions)
            .HasForeignKey(p => p.DoctorId)
            .OnDelete(DeleteBehavior.Restrict);


        // ChatMessage - two FKs into Users, must be explicit
        modelBuilder.Entity<ChatMessage>()
            .HasOne(m => m.Sender)
            .WithMany(u => u.SentMessages)
            .HasForeignKey(m => m.SenderId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ChatMessage>()
            .HasOne(m => m.Receiver)
            .WithMany(u => u.ReceivedMessages)
            .HasForeignKey(m => m.ReceiverId)
            .OnDelete(DeleteBehavior.Restrict);

        // ChatMessage → Appointment
        modelBuilder.Entity<ChatMessage>()
            .HasOne(m => m.Appointment)
            .WithMany(a => a.ChatMessages)
            .HasForeignKey(m => m.AppointmentId)
            .OnDelete(DeleteBehavior.Restrict);

        // Decimal precision
        modelBuilder.Entity<Doctor>()
            .Property(d => d.NewPatientFee).HasPrecision(10, 2);
        modelBuilder.Entity<Doctor>()
            .Property(d => d.FollowUpFee).HasPrecision(10, 2);
        modelBuilder.Entity<Doctor>()
            .Property(d => d.AverageRating).HasPrecision(3, 2);
        modelBuilder.Entity<Payment>()
            .Property(p => p.Amount).HasPrecision(10, 2);
    }
}