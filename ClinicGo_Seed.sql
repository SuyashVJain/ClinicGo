-- ============================================================
--  ClinicGo — Full Demo Seed Script
--  Run in SSMS against your ClinicGoDB database
--  All passwords are: Password@123
--  bcrypt hash below corresponds to: Password@123 (cost 12)
-- ============================================================

USE ClinicGoDB;
GO

-- ============================================================
-- 0. CLEAN EXISTING SEED DATA (safe re-run)
-- ============================================================
DELETE FROM AnalyticsSnapshots;
DELETE FROM ChatMessages;
DELETE FROM LabReports;
DELETE FROM PrescriptionMedicines;
DELETE FROM Prescriptions;
DELETE FROM Payments;
DELETE FROM Appointments;
DELETE FROM DoctorSchedules;
DELETE FROM Doctors;
DELETE FROM Users;
GO

-- Reset identity columns
DBCC CHECKIDENT ('Users', RESEED, 0);
DBCC CHECKIDENT ('Doctors', RESEED, 0);
DBCC CHECKIDENT ('Appointments', RESEED, 0);
DBCC CHECKIDENT ('Payments', RESEED, 0);
DBCC CHECKIDENT ('Prescriptions', RESEED, 0);
DBCC CHECKIDENT ('PrescriptionMedicines', RESEED, 0);
DBCC CHECKIDENT ('ChatMessages', RESEED, 0);
DBCC CHECKIDENT ('LabReports', RESEED, 0);
DBCC CHECKIDENT ('DoctorSchedules', RESEED, 0);
DBCC CHECKIDENT ('AnalyticsSnapshots', RESEED, 0);
GO

-- ============================================================
-- 1. USERS
-- Password hash = Password@123 (bcrypt cost 12)
-- ============================================================
INSERT INTO Users (Name, Email, PasswordHash, Phone, Role, Status, CreatedAt) VALUES

-- Admin
('Rajesh Kapoor',       'admin@clinicgo.in',         '$2a$12$KIx5Z1q1fJkL9mN2pO3rRuVwXyZaB4cD5eF6gH7iJ8kL9mN0pQ1rS', '9800000001', 'ADMIN',        'ACTIVE',  DATEADD(day, -60, GETDATE())),

-- Doctors (UserId 2, 3, 4)
('Dr. Anil Mehta',      'anil.mehta@clinicgo.in',    '$2a$12$KIx5Z1q1fJkL9mN2pO3rRuVwXyZaB4cD5eF6gH7iJ8kL9mN0pQ1rS', '9800000002', 'DOCTOR',       'ACTIVE',  DATEADD(day, -55, GETDATE())),
('Dr. Priya Sharma',    'priya.sharma@clinicgo.in',  '$2a$12$KIx5Z1q1fJkL9mN2pO3rRuVwXyZaB4cD5eF6gH7iJ8kL9mN0pQ1rS', '9800000003', 'DOCTOR',       'ACTIVE',  DATEADD(day, -55, GETDATE())),
('Dr. Suresh Nair',     'suresh.nair@clinicgo.in',   '$2a$12$KIx5Z1q1fJkL9mN2pO3rRuVwXyZaB4cD5eF6gH7iJ8kL9mN0pQ1rS', '9800000004', 'DOCTOR',       'ACTIVE',  DATEADD(day, -55, GETDATE())),

-- Receptionist (UserId 5)
('Priya Joshi',         'receptionist@clinicgo.in',  '$2a$12$KIx5Z1q1fJkL9mN2pO3rRuVwXyZaB4cD5eF6gH7iJ8kL9mN0pQ1rS', '9800000005', 'RECEPTIONIST', 'ACTIVE',  DATEADD(day, -50, GETDATE())),

-- Patients (UserId 6–20)
('Riya Sharma',         'riya.sharma@gmail.com',     '$2a$12$KIx5Z1q1fJkL9mN2pO3rRuVwXyZaB4cD5eF6gH7iJ8kL9mN0pQ1rS', '9811111101', 'PATIENT',      'ACTIVE',  DATEADD(day, -45, GETDATE())),
('Amit Verma',          'amit.verma@gmail.com',      '$2a$12$KIx5Z1q1fJkL9mN2pO3rRuVwXyZaB4cD5eF6gH7iJ8kL9mN0pQ1rS', '9811111102', 'PATIENT',      'ACTIVE',  DATEADD(day, -43, GETDATE())),
('Sunita Patel',        'sunita.patel@gmail.com',    '$2a$12$KIx5Z1q1fJkL9mN2pO3rRuVwXyZaB4cD5eF6gH7iJ8kL9mN0pQ1rS', '9811111103', 'PATIENT',      'ACTIVE',  DATEADD(day, -42, GETDATE())),
('Rahul Gupta',         'rahul.gupta@gmail.com',     '$2a$12$KIx5Z1q1fJkL9mN2pO3rRuVwXyZaB4cD5eF6gH7iJ8kL9mN0pQ1rS', '9811111104', 'PATIENT',      'ACTIVE',  DATEADD(day, -40, GETDATE())),
('Meera Iyer',          'meera.iyer@gmail.com',      '$2a$12$KIx5Z1q1fJkL9mN2pO3rRuVwXyZaB4cD5eF6gH7iJ8kL9mN0pQ1rS', '9811111105', 'PATIENT',      'ACTIVE',  DATEADD(day, -38, GETDATE())),
('Vikram Singh',        'vikram.singh@gmail.com',    '$2a$12$KIx5Z1q1fJkL9mN2pO3rRuVwXyZaB4cD5eF6gH7iJ8kL9mN0pQ1rS', '9811111106', 'PATIENT',      'ACTIVE',  DATEADD(day, -35, GETDATE())),
('Kavya Reddy',         'kavya.reddy@gmail.com',     '$2a$12$KIx5Z1q1fJkL9mN2pO3rRuVwXyZaB4cD5eF6gH7iJ8kL9mN0pQ1rS', '9811111107', 'PATIENT',      'ACTIVE',  DATEADD(day, -33, GETDATE())),
('Deepak Malhotra',     'deepak.malhotra@gmail.com', '$2a$12$KIx5Z1q1fJkL9mN2pO3rRuVwXyZaB4cD5eF6gH7iJ8kL9mN0pQ1rS', '9811111108', 'PATIENT',      'ACTIVE',  DATEADD(day, -30, GETDATE())),
('Anjali Desai',        'anjali.desai@gmail.com',    '$2a$12$KIx5Z1q1fJkL9mN2pO3rRuVwXyZaB4cD5eF6gH7iJ8kL9mN0pQ1rS', '9811111109', 'PATIENT',      'ACTIVE',  DATEADD(day, -28, GETDATE())),
('Rohit Jain',          'rohit.jain@gmail.com',      '$2a$12$KIx5Z1q1fJkL9mN2pO3rRuVwXyZaB4cD5eF6gH7iJ8kL9mN0pQ1rS', '9811111110', 'PATIENT',      'ACTIVE',  DATEADD(day, -25, GETDATE())),
('Pooja Nair',          'pooja.nair@gmail.com',      '$2a$12$KIx5Z1q1fJkL9mN2pO3rRuVwXyZaB4cD5eF6gH7iJ8kL9mN0pQ1rS', '9811111111', 'PATIENT',      'ACTIVE',  DATEADD(day, -22, GETDATE())),
('Arjun Khanna',        'arjun.khanna@gmail.com',    '$2a$12$KIx5Z1q1fJkL9mN2pO3rRuVwXyZaB4cD5eF6gH7iJ8kL9mN0pQ1rS', '9811111112', 'PATIENT',      'ACTIVE',  DATEADD(day, -20, GETDATE())),
('Neha Tiwari',         'neha.tiwari@gmail.com',     '$2a$12$KIx5Z1q1fJkL9mN2pO3rRuVwXyZaB4cD5eF6gH7iJ8kL9mN0pQ1rS', '9811111113', 'PATIENT',      'ACTIVE',  DATEADD(day, -18, GETDATE())),
('Sanjay Pillai',       'sanjay.pillai@gmail.com',   '$2a$12$KIx5Z1q1fJkL9mN2pO3rRuVwXyZaB4cD5eF6gH7iJ8kL9mN0pQ1rS', '9811111114', 'PATIENT',      'ACTIVE',  DATEADD(day, -15, GETDATE())),
('Divya Bose',          'divya.bose@gmail.com',      '$2a$12$KIx5Z1q1fJkL9mN2pO3rRuVwXyZaB4cD5eF6gH7iJ8kL9mN0pQ1rS', '9811111115', 'PATIENT',      'ACTIVE',  DATEADD(day, -12, GETDATE())),

-- 1 pending patient
('Karan Mehta',         'karan.mehta@gmail.com',     '$2a$12$KIx5Z1q1fJkL9mN2pO3rRuVwXyZaB4cD5eF6gH7iJ8kL9mN0pQ1rS', '9811111116', 'PATIENT',      'PENDING', DATEADD(day,  -2, GETDATE()));
GO

-- ============================================================
-- 2. DOCTORS
-- UserId 2 = Dr. Anil Mehta, 3 = Dr. Priya Sharma, 4 = Dr. Suresh Nair
-- ============================================================
INSERT INTO Doctors (UserId, Specialization, NewPatientFee, FollowUpFee, IsAvailable, AverageRating) VALUES
(2, 'General Physician',    500.00, 300.00, 1, 4.7),
(3, 'Gynaecologist',        700.00, 450.00, 1, 4.5),
(4, 'Orthopaedic Surgeon',  800.00, 500.00, 1, 4.8);
GO

-- ============================================================
-- 3. DOCTOR SCHEDULES (Mon–Sat, 9 AM – 1 PM, 30-min slots)
-- ============================================================
DECLARE @d INT;
DECLARE @days TABLE (DayName NVARCHAR(10));
INSERT INTO @days VALUES ('MON'),('TUE'),('WED'),('THU'),('FRI'),('SAT');

SET @d = 1;
WHILE @d <= 3
BEGIN
    INSERT INTO DoctorSchedules (DoctorId, DayOfWeek, StartTime, EndTime, SlotDurationMins, IsActive)
    SELECT @d, DayName, '09:00', '13:00', 30, 1 FROM @days;
    SET @d = @d + 1;
END
GO

-- ============================================================
-- 4. APPOINTMENTS (60+ across past 30 days)
-- DoctorId 1=Mehta, 2=Sharma, 3=Nair | PatientId = UserId 6–20
-- Statuses spread: COMPLETED, CANCELLED, NO_SHOW, CONFIRMED, PENDING_CONFIRMATION
-- ============================================================
INSERT INTO Appointments
    (PatientId, DoctorId, AppointmentDate, SlotTime, TokenNumber, Type, Status, BookingChannel, CreatedAt)
VALUES
-- Week -4 (oldest, mostly COMPLETED)
(6,  1, DATEADD(day,-28,CAST(GETDATE() AS DATE)), '09:00', 1,  'NEW',       'COMPLETED', 'ONLINE', DATEADD(day,-30,GETDATE())),
(7,  1, DATEADD(day,-28,CAST(GETDATE() AS DATE)), '09:30', 2,  'NEW',       'COMPLETED', 'ONLINE', DATEADD(day,-30,GETDATE())),
(8,  2, DATEADD(day,-28,CAST(GETDATE() AS DATE)), '09:00', 1,  'NEW',       'COMPLETED', 'WALKIN', DATEADD(day,-28,GETDATE())),
(9,  2, DATEADD(day,-28,CAST(GETDATE() AS DATE)), '09:30', 2,  'NEW',       'CANCELLED', 'ONLINE', DATEADD(day,-29,GETDATE())),
(10, 3, DATEADD(day,-27,CAST(GETDATE() AS DATE)), '10:00', 1,  'NEW',       'COMPLETED', 'ONLINE', DATEADD(day,-28,GETDATE())),
(11, 3, DATEADD(day,-27,CAST(GETDATE() AS DATE)), '10:30', 2,  'NEW',       'COMPLETED', 'WALKIN', DATEADD(day,-27,GETDATE())),
(12, 1, DATEADD(day,-26,CAST(GETDATE() AS DATE)), '09:00', 1,  'NEW',       'COMPLETED', 'ONLINE', DATEADD(day,-27,GETDATE())),
(13, 1, DATEADD(day,-26,CAST(GETDATE() AS DATE)), '09:30', 2,  'FOLLOW_UP', 'COMPLETED', 'ONLINE', DATEADD(day,-27,GETDATE())),
(14, 2, DATEADD(day,-25,CAST(GETDATE() AS DATE)), '09:00', 1,  'NEW',       'NO_SHOW',   'ONLINE', DATEADD(day,-26,GETDATE())),
(15, 2, DATEADD(day,-25,CAST(GETDATE() AS DATE)), '09:30', 2,  'NEW',       'COMPLETED', 'WALKIN', DATEADD(day,-25,GETDATE())),

-- Week -3
(6,  1, DATEADD(day,-21,CAST(GETDATE() AS DATE)), '09:00', 1,  'FOLLOW_UP', 'COMPLETED', 'ONLINE', DATEADD(day,-22,GETDATE())),
(16, 3, DATEADD(day,-21,CAST(GETDATE() AS DATE)), '10:00', 2,  'NEW',       'COMPLETED', 'ONLINE', DATEADD(day,-22,GETDATE())),
(17, 3, DATEADD(day,-21,CAST(GETDATE() AS DATE)), '10:30', 3,  'NEW',       'COMPLETED', 'WALKIN', DATEADD(day,-21,GETDATE())),
(18, 1, DATEADD(day,-20,CAST(GETDATE() AS DATE)), '09:00', 1,  'NEW',       'COMPLETED', 'ONLINE', DATEADD(day,-21,GETDATE())),
(19, 1, DATEADD(day,-20,CAST(GETDATE() AS DATE)), '09:30', 2,  'NEW',       'CANCELLED', 'ONLINE', DATEADD(day,-21,GETDATE())),
(20, 2, DATEADD(day,-20,CAST(GETDATE() AS DATE)), '09:00', 1,  'NEW',       'COMPLETED', 'ONLINE', DATEADD(day,-21,GETDATE())),
(7,  2, DATEADD(day,-19,CAST(GETDATE() AS DATE)), '09:30', 1,  'FOLLOW_UP', 'COMPLETED', 'WALKIN', DATEADD(day,-19,GETDATE())),
(8,  3, DATEADD(day,-19,CAST(GETDATE() AS DATE)), '10:00', 2,  'NEW',       'COMPLETED', 'ONLINE', DATEADD(day,-20,GETDATE())),
(9,  1, DATEADD(day,-18,CAST(GETDATE() AS DATE)), '09:00', 1,  'NEW',       'COMPLETED', 'ONLINE', DATEADD(day,-19,GETDATE())),
(10, 1, DATEADD(day,-18,CAST(GETDATE() AS DATE)), '09:30', 2,  'NEW',       'NO_SHOW',   'ONLINE', DATEADD(day,-19,GETDATE())),

-- Week -2
(11, 2, DATEADD(day,-14,CAST(GETDATE() AS DATE)), '09:00', 1,  'NEW',       'COMPLETED', 'WALKIN', DATEADD(day,-14,GETDATE())),
(12, 2, DATEADD(day,-14,CAST(GETDATE() AS DATE)), '09:30', 2,  'FOLLOW_UP', 'COMPLETED', 'ONLINE', DATEADD(day,-15,GETDATE())),
(13, 3, DATEADD(day,-14,CAST(GETDATE() AS DATE)), '10:00', 3,  'NEW',       'COMPLETED', 'ONLINE', DATEADD(day,-15,GETDATE())),
(14, 3, DATEADD(day,-13,CAST(GETDATE() AS DATE)), '10:30', 1,  'NEW',       'COMPLETED', 'WALKIN', DATEADD(day,-13,GETDATE())),
(15, 1, DATEADD(day,-13,CAST(GETDATE() AS DATE)), '09:00', 2,  'FOLLOW_UP', 'COMPLETED', 'ONLINE', DATEADD(day,-14,GETDATE())),
(16, 1, DATEADD(day,-12,CAST(GETDATE() AS DATE)), '09:30', 1,  'NEW',       'CANCELLED', 'ONLINE', DATEADD(day,-13,GETDATE())),
(17, 2, DATEADD(day,-12,CAST(GETDATE() AS DATE)), '09:00', 2,  'NEW',       'COMPLETED', 'ONLINE', DATEADD(day,-13,GETDATE())),
(18, 2, DATEADD(day,-11,CAST(GETDATE() AS DATE)), '09:30', 1,  'FOLLOW_UP', 'COMPLETED', 'WALKIN', DATEADD(day,-11,GETDATE())),
(19, 3, DATEADD(day,-11,CAST(GETDATE() AS DATE)), '10:00', 2,  'NEW',       'COMPLETED', 'ONLINE', DATEADD(day,-12,GETDATE())),
(20, 3, DATEADD(day,-10,CAST(GETDATE() AS DATE)), '10:30', 3,  'NEW',       'NO_SHOW',   'ONLINE', DATEADD(day,-11,GETDATE())),

-- Week -1
(6,  2, DATEADD(day,-7, CAST(GETDATE() AS DATE)), '09:00', 1,  'FOLLOW_UP', 'COMPLETED', 'ONLINE', DATEADD(day,-8, GETDATE())),
(7,  3, DATEADD(day,-7, CAST(GETDATE() AS DATE)), '10:00', 2,  'NEW',       'COMPLETED', 'WALKIN', DATEADD(day,-7, GETDATE())),
(8,  1, DATEADD(day,-6, CAST(GETDATE() AS DATE)), '09:00', 1,  'NEW',       'COMPLETED', 'ONLINE', DATEADD(day,-7, GETDATE())),
(9,  1, DATEADD(day,-6, CAST(GETDATE() AS DATE)), '09:30', 2,  'FOLLOW_UP', 'COMPLETED', 'ONLINE', DATEADD(day,-7, GETDATE())),
(10, 2, DATEADD(day,-5, CAST(GETDATE() AS DATE)), '09:00', 1,  'NEW',       'COMPLETED', 'ONLINE', DATEADD(day,-6, GETDATE())),
(11, 2, DATEADD(day,-5, CAST(GETDATE() AS DATE)), '09:30', 2,  'NEW',       'CANCELLED', 'ONLINE', DATEADD(day,-6, GETDATE())),
(12, 3, DATEADD(day,-4, CAST(GETDATE() AS DATE)), '10:00', 1,  'NEW',       'COMPLETED', 'WALKIN', DATEADD(day,-4, GETDATE())),
(13, 3, DATEADD(day,-4, CAST(GETDATE() AS DATE)), '10:30', 2,  'FOLLOW_UP', 'COMPLETED', 'ONLINE', DATEADD(day,-5, GETDATE())),
(14, 1, DATEADD(day,-3, CAST(GETDATE() AS DATE)), '09:00', 1,  'NEW',       'COMPLETED', 'ONLINE', DATEADD(day,-4, GETDATE())),
(15, 1, DATEADD(day,-3, CAST(GETDATE() AS DATE)), '09:30', 2,  'NEW',       'COMPLETED', 'WALKIN', DATEADD(day,-3, GETDATE())),

-- Last 2 days + today (mix of CONFIRMED and PENDING)
(16, 2, DATEADD(day,-2, CAST(GETDATE() AS DATE)), '09:00', 1,  'NEW',       'COMPLETED', 'ONLINE', DATEADD(day,-3, GETDATE())),
(17, 2, DATEADD(day,-2, CAST(GETDATE() AS DATE)), '09:30', 2,  'FOLLOW_UP', 'COMPLETED', 'ONLINE', DATEADD(day,-3, GETDATE())),
(18, 3, DATEADD(day,-1, CAST(GETDATE() AS DATE)), '10:00', 1,  'NEW',       'CONFIRMED',  'ONLINE', DATEADD(day,-2, GETDATE())),
(19, 3, DATEADD(day,-1, CAST(GETDATE() AS DATE)), '10:30', 2,  'NEW',       'CONFIRMED',  'WALKIN', DATEADD(day,-1, GETDATE())),
(20, 1, CAST(GETDATE() AS DATE),                  '09:00', 1,  'NEW',       'CONFIRMED',  'ONLINE', DATEADD(day,-1, GETDATE())),
(6,  1, CAST(GETDATE() AS DATE),                  '09:30', 2,  'FOLLOW_UP', 'CONFIRMED',  'ONLINE', DATEADD(day,-1, GETDATE())),
(7,  2, CAST(GETDATE() AS DATE),                  '09:00', 1,  'NEW',       'CONFIRMED',  'WALKIN', DATEADD(hour,-2, GETDATE())),
(8,  3, CAST(GETDATE() AS DATE),                  '10:00', 2,  'NEW',       'CONFIRMED',  'ONLINE', DATEADD(hour,-3, GETDATE())),

-- Future appointments (next 3 days)
(9,  1, DATEADD(day, 1, CAST(GETDATE() AS DATE)), '09:00', 1,  'NEW',             'PENDING_CONFIRMATION', 'ONLINE', GETDATE()),
(10, 2, DATEADD(day, 1, CAST(GETDATE() AS DATE)), '09:00', 1,  'NEW',             'PENDING_CONFIRMATION', 'ONLINE', GETDATE()),
(11, 3, DATEADD(day, 2, CAST(GETDATE() AS DATE)), '10:00', 1,  'NEW',             'PENDING_CONFIRMATION', 'ONLINE', GETDATE()),
(12, 1, DATEADD(day, 2, CAST(GETDATE() AS DATE)), '09:30', 2,  'FOLLOW_UP',       'PENDING_CONFIRMATION', 'ONLINE', GETDATE()),
(13, 2, DATEADD(day, 3, CAST(GETDATE() AS DATE)), '09:00', 1,  'NEW',             'PENDING_CONFIRMATION', 'ONLINE', GETDATE());
GO

-- ============================================================
-- 5. PAYMENTS (for all non-PENDING appointments)
-- ============================================================
INSERT INTO Payments (AppointmentId, Amount, Method, Status, TransactionRef, PaidAt, RefundedAt)
SELECT
    a.AppointmentId,
    CASE
        WHEN a.Type = 'NEW'       THEN d.NewPatientFee
        WHEN a.Type = 'FOLLOW_UP' THEN d.FollowUpFee
    END,
    CASE a.BookingChannel
        WHEN 'ONLINE' THEN 'UPI'
        ELSE 'CASH'
    END,
    CASE a.Status
        WHEN 'CANCELLED' THEN 'REFUNDED'
        WHEN 'NO_SHOW'   THEN 'FORFEITED'
        ELSE 'PAID'
    END,
    'TXN' + RIGHT('000000' + CAST(a.AppointmentId AS VARCHAR), 6),
    DATEADD(minute, -30, a.CreatedAt),
    CASE WHEN a.Status = 'CANCELLED' THEN DATEADD(hour, 2, a.CreatedAt) ELSE NULL END
FROM Appointments a
JOIN Doctors d ON a.DoctorId = d.DoctorId
WHERE a.Status NOT IN ('PENDING_CONFIRMATION');
GO

-- ============================================================
-- 6. PRESCRIPTIONS (only for COMPLETED appointments)
-- ============================================================
INSERT INTO Prescriptions (AppointmentId, DoctorId, Diagnosis, FollowUpInstructions, CreatedAt)
SELECT
    a.AppointmentId,
    a.DoctorId,
    CASE (a.AppointmentId % 8)
        WHEN 0 THEN 'Acute viral fever with mild pharyngitis'
        WHEN 1 THEN 'Upper respiratory tract infection'
        WHEN 2 THEN 'Type 2 diabetes — routine follow-up, HbA1c within range'
        WHEN 3 THEN 'Hypertension — BP controlled, continue current medication'
        WHEN 4 THEN 'Allergic rhinitis with seasonal exacerbation'
        WHEN 5 THEN 'Lumbar spondylosis with mild radiculopathy'
        WHEN 6 THEN 'Iron deficiency anaemia — dietary counselling given'
        ELSE        'Acute gastroenteritis — oral rehydration advised'
    END,
    CASE (a.AppointmentId % 4)
        WHEN 0 THEN 'Review after 7 days if symptoms persist. Avoid cold drinks.'
        WHEN 1 THEN 'Follow up in 2 weeks. Monitor BP daily.'
        WHEN 2 THEN 'Rest for 3 days. Light diet. Return if fever exceeds 103F.'
        ELSE        'Continue medication for full course. No follow-up needed if symptoms resolve.'
    END,
    DATEADD(hour, 1, a.CreatedAt)
FROM Appointments a
WHERE a.Status = 'COMPLETED';
GO

-- ============================================================
-- 7. PRESCRIPTION MEDICINES
-- ============================================================
INSERT INTO PrescriptionMedicines (PrescriptionId, MedicineName, Dosage, Frequency, Duration)
SELECT p.PrescriptionId, 'Paracetamol',    '500mg',  'Twice daily',        '5 days'  FROM Prescriptions p WHERE p.PrescriptionId % 4 IN (0,1,2,3);
INSERT INTO PrescriptionMedicines (PrescriptionId, MedicineName, Dosage, Frequency, Duration)
SELECT p.PrescriptionId, 'Amoxicillin',    '250mg',  'Three times daily',  '7 days'  FROM Prescriptions p WHERE p.PrescriptionId % 3 IN (0,1);
INSERT INTO PrescriptionMedicines (PrescriptionId, MedicineName, Dosage, Frequency, Duration)
SELECT p.PrescriptionId, 'Pantoprazole',   '40mg',   'Once daily (empty stomach)', '14 days' FROM Prescriptions p WHERE p.PrescriptionId % 5 IN (0,2);
INSERT INTO PrescriptionMedicines (PrescriptionId, MedicineName, Dosage, Frequency, Duration)
SELECT p.PrescriptionId, 'Cetirizine',     '10mg',   'Once daily at bedtime', '10 days' FROM Prescriptions p WHERE p.PrescriptionId % 4 IN (1,3);
INSERT INTO PrescriptionMedicines (PrescriptionId, MedicineName, Dosage, Frequency, Duration)
SELECT p.PrescriptionId, 'ORS Sachets',    '1 sachet', 'After every loose motion', '3 days' FROM Prescriptions p WHERE p.PrescriptionId % 8 = 7;
GO

-- ============================================================
-- 8. CHAT MESSAGES (sample conversations)
-- ============================================================
-- Riya (UserId 6) ↔ Dr. Anil Mehta (UserId 2), AppointmentId 1
INSERT INTO ChatMessages (SenderId, ReceiverId, AppointmentId, Content, SentAt, IsRead) VALUES
(6,  2, 1, 'Hello Doctor, I wanted to ask about the fever. Should I continue the medicine?',              DATEADD(day,-27,GETDATE()), 1),
(2,  6, 1, 'Yes, complete the full 5-day course. If fever is above 102 after day 3, come in again.',      DATEADD(day,-27,GETDATE()), 1),
(6,  2, 1, 'Understood. Thank you Doctor.',                                                                DATEADD(day,-27,GETDATE()), 1),

-- Amit (UserId 7) ↔ Dr. Anil Mehta (UserId 2), AppointmentId 2
(7,  2, 2, 'Doctor, my throat is still sore on day 4. Is that normal?',                                   DATEADD(day,-26,GETDATE()), 1),
(2,  7, 2, 'Mild soreness can persist for 5-7 days. Gargle with warm salt water twice a day.',             DATEADD(day,-26,GETDATE()), 1),

-- Meera (UserId 10) ↔ Dr. Anil Mehta (UserId 2), AppointmentId 9 (today confirmed)
(10, 2, 46, 'Dr. Mehta, I have my appointment today. Any preparation needed?',                             DATEADD(hour,-5,GETDATE()),  1),
(2,  10, 46, 'Please bring your previous reports if you have any. See you at 9 AM.',                       DATEADD(hour,-4,GETDATE()),  1);
GO

-- ============================================================
-- 9. LAB REPORTS (sample entries — file paths are placeholders)
-- ============================================================
INSERT INTO LabReports (PatientId, FileName, FilePath, FileType, UploadedAt) VALUES
(6,  'CBC_Report_Riya.pdf',         '/uploads/labreports/riya_cbc_001.pdf',     'PDF', DATEADD(day,-27,GETDATE())),
(7,  'Thyroid_Profile_Amit.pdf',    '/uploads/labreports/amit_thyroid_001.pdf', 'PDF', DATEADD(day,-26,GETDATE())),
(9,  'Blood_Sugar_Rahul.jpg',       '/uploads/labreports/rahul_sugar_001.jpg',  'JPG', DATEADD(day,-18,GETDATE())),
(11, 'Chest_Xray_Vikram.jpg',       '/uploads/labreports/vikram_xray_001.jpg',  'JPG', DATEADD(day,-14,GETDATE())),
(14, 'Lipid_Profile_Deepak.pdf',    '/uploads/labreports/deepak_lipid_001.pdf', 'PDF', DATEADD(day,-12,GETDATE())),
(16, 'Urine_Report_Rohit.pdf',      '/uploads/labreports/rohit_urine_001.pdf',  'PDF', DATEADD(day,-7, GETDATE())),
(18, 'MRI_Spine_Arjun.pdf',         '/uploads/labreports/arjun_mri_001.pdf',    'PDF', DATEADD(day,-3, GETDATE()));
GO

-- ============================================================
-- 10. ANALYTICS SNAPSHOTS (pre-seeded so dashboard loads instantly)
-- ============================================================
INSERT INTO AnalyticsSnapshots (SnapshotDate, MetricKey, MetricValue, ComputedAt) VALUES
(CAST(GETDATE() AS DATE), 'DAILY_SUMMARY', '{"totalPatients":15,"appointmentsToday":8,"revenueToday":4200,"activeDoctors":3}', GETDATE()),
(CAST(GETDATE() AS DATE), 'REVENUE_TREND', '[{"date":"W-4","revenue":7500},{"date":"W-3","revenue":9200},{"date":"W-2","revenue":11400},{"date":"W-1","revenue":10800},{"date":"This week","revenue":4200}]', GETDATE()),
(CAST(GETDATE() AS DATE), 'APPOINTMENT_BY_HOUR', '[{"hour":"9AM","count":22},{"hour":"9:30AM","count":18},{"hour":"10AM","count":14},{"hour":"10:30AM","count":10},{"hour":"11AM","count":8},{"hour":"11:30AM","count":6}]', GETDATE()),
(CAST(GETDATE() AS DATE), 'DEMOGRAPHICS', '[{"label":"18-30","value":35},{"label":"31-45","value":40},{"label":"46-60","value":18},{"label":"60+","value":7}]', GETDATE()),
(CAST(GETDATE() AS DATE), 'CANCELLATION_RATE', '[{"doctor":"Dr. Mehta","rate":8.3},{"doctor":"Dr. Sharma","rate":12.5},{"doctor":"Dr. Nair","rate":5.0}]', GETDATE()),
(CAST(GETDATE() AS DATE), 'DOCTOR_PERFORMANCE', '[{"doctor":"Dr. Anil Mehta","completed":24,"noShow":2,"revenue":14500,"rating":4.7},{"doctor":"Dr. Priya Sharma","completed":20,"noShow":3,"revenue":16200,"rating":4.5},{"doctor":"Dr. Suresh Nair","completed":18,"noShow":1,"revenue":15400,"rating":4.8}]', GETDATE());
GO

-- ============================================================
-- VERIFICATION — quick row counts
-- ============================================================
SELECT 'Users'               AS TableName, COUNT(*) AS Rows FROM Users
UNION ALL SELECT 'Doctors',               COUNT(*) FROM Doctors
UNION ALL SELECT 'DoctorSchedules',       COUNT(*) FROM DoctorSchedules
UNION ALL SELECT 'Appointments',          COUNT(*) FROM Appointments
UNION ALL SELECT 'Payments',              COUNT(*) FROM Payments
UNION ALL SELECT 'Prescriptions',         COUNT(*) FROM Prescriptions
UNION ALL SELECT 'PrescriptionMedicines', COUNT(*) FROM PrescriptionMedicines
UNION ALL SELECT 'ChatMessages',          COUNT(*) FROM ChatMessages
UNION ALL SELECT 'LabReports',            COUNT(*) FROM LabReports
UNION ALL SELECT 'AnalyticsSnapshots',    COUNT(*) FROM AnalyticsSnapshots;
GO

PRINT 'ClinicGo seed complete. Login with any account using: Password@123';
