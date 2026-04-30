# ClinicGo 🏥
### Smart Clinic Management System

> A unified digital platform that replaces fragmented, paper-based clinic workflows — built for real-world single-clinic, multi-doctor environments.

[![Live Web Portal](https://img.shields.io/badge/Web%20Portal-Live%20on%20Vercel-brightgreen)](https://clinic-go-ivory.vercel.app)
![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20Web%20%7C%20.NET-blue)
![Backend](https://img.shields.io/badge/Backend-ASP.NET%20Core%20.NET%2010-purple)
![Database](https://img.shields.io/badge/Database-SQL%20Server%20%2B%20EF%20Core-red)

---

## The Problem

Clinics today run on WhatsApp messages, Excel sheets, paper prescriptions, and manual queues. It's slow, error-prone, and gives clinic owners zero visibility into their own operations.

ClinicGo fixes that.

---

## What We Built

A four-platform system serving every person in a clinic — patients, doctors, receptionists, and admins — each with their own purpose-built interface.

| Platform | Who it's for | Built with |
|---|---|---|
| 📱 Patient Android App | Patients | Java, Retrofit, SignalR |
| 📱 Staff Android App | Doctors + Receptionists | Java, Retrofit |
| 🌐 Admin / Doctor Web Portal | Admin + Doctors | React.js, Tailwind, Recharts |
| ⚙️ REST API Backend | Powers everything | ASP.NET Core .NET 10, EF Core, SQL Server |

---

## Features

**Patients** can book appointments, pay online, view digital prescriptions the moment a doctor submits them, upload lab reports, and chat with their doctor in real-time.

**Doctors** get a clean daily schedule, an in-app prescription writer, full patient history access, and a detailed analytics view on the web portal.

**Receptionists** manage the live patient queue with token numbers, approve new patient registrations, handle walk-in bookings, and record cash payments — all from the Staff App.

**Admins** get a full analytics dashboard — revenue trends, peak hours heatmap, demographic breakdowns, and doctor performance scores — all pre-computed for fast loading.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Android Apps | Java + XML, Retrofit, Room, Glide, SharedPreferences |
| Backend | ASP.NET Core .NET 10, Entity Framework Core, SQL Server |
| Auth | JWT, bcrypt, Role-Based Access Control |
| Real-time | SignalR (WebSocket chat + queue updates) |
| Push Notifications | Firebase Cloud Messaging (FCM) |
| Web Frontend | React.js, Tailwind CSS 3 (CRACO), Recharts |
| API Docs | Swagger / Swashbuckle |

---

## Getting Started

### Backend

**Prerequisites:** .NET 10 SDK, SQL Server

```bash
cd ClinicGo.API

# Set your connection string in appsettings.json
dotnet ef database update
dotnet run --urls "http://0.0.0.0:5170"
```

Swagger UI: `http://localhost:5170/swagger`

---

### Web Portal

**Prerequisites:** Node.js 18+

```bash
cd clinicgo-web
npm install
npm start
```

Live at → [https://clinic-go-ivory.vercel.app](https://clinic-go-ivory.vercel.app)

---

### Android Apps

1. Open `ClinicGo-Patient` or `ClinicGo-Staff` in Android Studio
2. Update the base URL in `RetrofitClient.java`:
```java
private static final String BASE_URL = "http://YOUR_LOCAL_IP:5170/api/v1/";
```
3. Build and run on a device or emulator (API 26+)

> For physical device testing, run the backend with `--urls "http://0.0.0.0:5170"` and make sure the device and PC are on the same WiFi network.

---

## API Overview

Base URL: `/api/v1` · Protected endpoints require `Authorization: Bearer <token>`

| Module | Base Path |
|---|---|
| Auth | `/auth` |
| Appointments | `/appointments` |
| Prescriptions | `/prescriptions` |
| Payments | `/payments` |
| Queue | `/queue` |
| Chat + SignalR | `/chat` · `/chathub` |
| Lab Reports | `/reports` |
| Admin | `/admin` |
| Patients | `/patients` |

---

## Repository Structure

```
ClinicGo/
├── ClinicGo.API/        # ASP.NET Core backend
├── ClinicGo-Patient/    # Patient Android App
├── ClinicGo-Staff/      # Staff Android App (Doctor + Receptionist)
└── clinicgo-web/        # React Web Portal
```

---

## Team

Built by [SuyashVJain](https://github.com/SuyashVJain) and team · 2026