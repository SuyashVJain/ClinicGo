# ClinicGo — Smart Clinic Management System

[![Live Web Portal](https://img.shields.io/badge/Web%20Portal-Live%20on%20Vercel-brightgreen?style=for-the-badge)](https://clinic-go-ivory.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-ASP.NET%20Core%20.NET%2010-512BD4?style=for-the-badge&logo=dotnet)](https://dotnet.microsoft.com)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20on%20Supabase-4169E1?style=for-the-badge&logo=postgresql)](https://supabase.com)
[![Android](https://img.shields.io/badge/Android-Java%20%2B%20Retrofit-3DDC84?style=for-the-badge&logo=android)](https://developer.android.com)
[![React](https://img.shields.io/badge/Web-React.js%20%2B%20Tailwind-61DAFB?style=for-the-badge&logo=react)](https://react.dev)

> A unified digital platform that replaces fragmented, paper-based clinic workflows with purpose-built apps for every role — patients, doctors, receptionists, and admins.

---

## Academic Details

| Field | Details |
|---|---|
| **Project Title** | ClinicGo — Smart Clinic Management System |
| **Team Members** | Nishita Raghavendra (PU02324EUGBTCS071) · Prashasti Verma (PU02324EUGBTCS079) · Suyash Vasal Jain (PU02324EUGBTCS099) |
| **Mentor** | Dr. Ankita Jain, Assistant Professor |
| **Institution** | Symbiosis University of Applied Sciences, Indore |
| **Programme** | B.Tech Computer Science & Information Technology |
| **Year / Semester** | 2nd Year, 4th Semester |
| **Timeline** | January – April 2025 (3 months) |

---

## The Problem

Clinics today run on WhatsApp messages, Excel sheets, paper prescriptions, and manual token queues. It's slow, error-prone, and gives clinic owners zero visibility into their operations.

ClinicGo fixes that — four purpose-built platforms, one shared backend, real-time everything.

---

## Platform Overview

| Platform | Who It's For | Tech |
|---|---|---|
| 📱 **Patient Android App** | Patients — book, pay, chat, view prescriptions | Java · XML · Retrofit · SignalR |
| 📱 **Staff Android App** | Doctors + Receptionists — manage queue, write prescriptions | Java · XML · Retrofit · SignalR |
| 🌐 **Admin / Doctor Web Portal** | Admin analytics, Doctor schedule | React.js · Tailwind CSS · Recharts |
| ⚙️ **REST API Backend** | Powering all three clients | ASP.NET Core .NET 10 · EF Core · PostgreSQL |

---

## Features by Role

### 👤 Patient
- Self-registration (pending receptionist approval)
- Doctor selection, date picker, real-time slot availability
- Online appointment booking with UPI payment simulation
- View digital prescriptions — expandable medicine list with dosage details
- Upload lab reports (PDF / JPG / PNG)
- Real-time chat with doctor via SignalR WebSocket
- Appointment history with status filter chips (All / Upcoming / Completed / Cancelled)

### 👨‍⚕️ Doctor (Staff App + Web Portal)
- Today's appointment queue with token numbers and status chips
- One-tap "Write Prescription" — opens pre-filled form linked to appointment
- Dynamic medicine list (add/remove rows) with diagnosis and follow-up instructions
- View full patient visit history before consultation
- Real-time chat with patients
- Web portal: today's schedule, completion rate, performance stats, patient lab reports

### 🏥 Receptionist (Staff App)
- Approve / reject new patient registrations
- Confirm or cancel pending appointments
- Live queue management — advance, skip (no-show) tokens
- Walk-in appointment booking
- Record cash payments

### 🔑 Admin (Web Portal)
- Revenue analytics dashboard with animated KPI cards
- Peak-hours heatmap (appointment volume by hour)
- Doctor performance tracking (completion rate, no-shows)
- Appointment outcomes donut chart
- Revenue trend line chart
- Manage doctors (create, update fees, deactivate)
- Searchable patient list with approve / reject actions
- Live operations view — all doctors' queues in real-time

---

## Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Patient App** | Java + XML | Android Studio, Retrofit 2, OkHttp, Gson, SignalR Java Client 8.x, SharedPreferences |
| **Staff App** | Java + XML | Same as Patient App, role-based navigation (Doctor / Receptionist) |
| **Web Dashboard** | React.js 19 | Tailwind CSS 3, Recharts 3.8, React Router 7, Axios, Microsoft SignalR 10.0 |
| **Backend API** | ASP.NET Core .NET 10 | Entity Framework Core, Npgsql, JWT Auth, BCrypt.Net, SignalR Hub |
| **Database** | PostgreSQL | Hosted on Supabase, EF Core migrations |
| **Real-time** | SignalR WebSocket | Per-appointment chat rooms, doctor ↔ patient |
| **Notifications** | Firebase Cloud Messaging | Appointment confirmations, prescription ready |
| **Dev Tunnel** | ngrok | Exposes local backend for Android device testing |
| **Deployment** | Vercel (Web) · Render (API) | Auto-deploys from GitHub main branch |

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@clinicgo.com` | `Admin@1234` |
| Doctor | `doctor@clinicgo.com` | `Doctor@1234` |
| Receptionist | `receptionist@clinicgo.com` | `Staff@1234` |
| Patient | `riya@gmail.com` | `Patient@1234` |

🌐 **Web Portal:** https://clinic-go-ivory.vercel.app

---

## How to Run

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org)
- [Android Studio](https://developer.android.com/studio) (for Android apps)
- [ngrok](https://ngrok.com) account (free tier works)
- A [Supabase](https://supabase.com) project with the seed SQL applied

---

### Terminal 1 — Backend API

```bash
cd ClinicGo.API
dotnet run
```

- Runs on: `http://localhost:5170`
- Swagger UI: `http://localhost:5170/swagger`

---

### Terminal 2 — ngrok tunnel

```bash
ngrok http http://localhost:5170
```

Copy the `https://xxxx.ngrok-free.app` URL, then update it in:

**`ClinicGo-Patient/app/src/main/java/com/clinicgo/patient/network/ApiClient.java`**
```java
private static final String BASE_URL = "https://YOUR-NGROK-URL.ngrok-free.app/api/v1/";
```

**`ClinicGo-Staff/app/src/main/java/com/clinicgo/staff/network/ApiClient.java`**
```java
private static final String BASE_URL = "https://YOUR-NGROK-URL.ngrok-free.app/api/v1/";
```

**`clinicgo-web/.env`**
```
REACT_APP_API_URL=https://YOUR-NGROK-URL.ngrok-free.app/api/v1
```

---

### Terminal 3 — React Web Dashboard

```bash
cd clinicgo-web
npm install
npm start
```

Runs on: `http://localhost:3000`

---

### Android Apps — Android Studio

1. Open `ClinicGo-Patient/` in Android Studio → click **Run ▶**
2. Open `ClinicGo-Staff/` in Android Studio → click **Run ▶**

> **Physical device:** Ensure device and PC are on the same WiFi. ngrok is the recommended approach for device testing (no IP changes needed).

---

### Database Setup

The database runs on **Supabase (PostgreSQL)**. EF Core migrations run automatically on backend startup.

To seed demo data, open the Supabase SQL editor and run:

```
ClinicGo_Seed.sql   ← in the repo root
```

Then run the timezone-alignment SQL (ensures today's payments appear in analytics):

```sql
UPDATE public.payments
SET paid_at = (
    DATE_TRUNC('day', NOW() AT TIME ZONE 'Asia/Kolkata')
    + INTERVAL '10 hours'
) AT TIME ZONE 'Asia/Kolkata'
WHERE status = 'PAID';
```

---

## Environment Variables

### Backend — `ClinicGo.API/appsettings.json`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=...;Database=postgres;Username=postgres;Password=..."
  },
  "Jwt": {
    "Key": "your-very-long-secret-key-at-least-32-characters",
    "Issuer": "ClinicGoAPI",
    "Audience": "ClinicGoClients",
    "ExpiryHours": "24"
  }
}
```

### Web — `clinicgo-web/.env`

```
REACT_APP_API_URL=https://your-ngrok-url.ngrok-free.app/api/v1
```

> **Vercel Production:** Set `REACT_APP_API_URL` in the Vercel dashboard under **Project Settings → Environment Variables**. The value should point to your deployed API (Render, Railway, etc.), not ngrok.

### Android — `ApiClient.java` in both apps

```java
private static final String BASE_URL = "https://your-ngrok-url.ngrok-free.app/api/v1/";
```

---

## API Reference

Base URL: `/api/v1` — Protected endpoints require `Authorization: Bearer <JWT>`

| Module | Path | Auth Roles |
|---|---|---|
| Auth | `POST /auth/login`, `POST /auth/register`, `GET /auth/me` | Public / Any |
| Appointments | `GET /appointments/slots`, `POST /appointments`, `PUT /{id}/confirm\|cancel\|complete` | Patient, Doctor, Receptionist |
| Prescriptions | `POST /prescriptions`, `GET /prescriptions/{appointmentId}`, `GET /prescriptions/patient/{id}` | Doctor, Patient |
| Payments | `POST /payments/initiate`, `POST /payments/record-cash`, `GET /payments/patient/{id}/history` | Patient, Receptionist |
| Queue | `GET /queue/today/{doctorId}`, `PUT /queue/{id}/next\|skip` | Doctor, Receptionist |
| Chat | `GET /chat/history/{appointmentId}` · **SignalR Hub:** `/chathub` | Patient, Doctor |
| Lab Reports | `POST /reports/upload`, `GET /reports/patient/{id}`, `GET /reports/{id}/download` | Patient, Doctor |
| Patients | `GET /patients/pending`, `PUT /patients/{id}/approve\|reject`, `GET /patients/{id}/history` | Receptionist, Admin |
| Admin | `GET /admin/doctors`, `POST /admin/doctors`, `POST /admin/analytics/compute` | Admin |

---

## Academic Subject Coverage

| Subject | How ClinicGo Covers It |
|---|---|
| **Mobile Application Development** | Two Android apps (Java + XML), one per role group — Patient App and Staff App. Covers activity/fragment lifecycle, RecyclerView adapters, Retrofit networking, SharedPreferences session management, and Material Design 3. |
| **Application Development Framework using .NET** | ASP.NET Core .NET 10 REST API with role-based JWT authentication, Entity Framework Core with Npgsql (PostgreSQL), SignalR real-time hub, and BCrypt password hashing. |
| **Data Warehousing and Mining** | Pre-computed analytics snapshots stored in `AnalyticsSnapshots` table. Compute endpoint aggregates daily revenue, cancellation rate, peak hours, and doctor performance — a lightweight data warehouse pattern for fast dashboard reads. |
| **Statistics II** | KPI dashboard (revenue, appointments, rates), peak-hours bar chart, revenue trend line chart, appointment outcomes donut chart, doctor performance progress bars, and demographic breakdowns. |
| **Computer Networks** | REST APIs (HTTP/HTTPS), SignalR WebSocket connections for real-time chat, Firebase Cloud Messaging for push notifications, ngrok tunnel for local-to-public endpoint exposure, JWT token-based stateless auth. |
| **Business Processes and MIS** | UPI payment simulation with fee calculation, refund logic with 24-hour cancellation window, cash payment recording, invoice data model, revenue reporting, and financial analytics dashboard. |

---

## Repository Structure

```
ClinicGo/
│
├── ClinicGo.API/                    # ASP.NET Core .NET 10 Backend
│   ├── Controllers/                 #   Auth, Appointments, Prescriptions,
│   │                                #   Payments, Queue, Chat, Reports, Admin, Patients
│   ├── Models/                      #   EF Core entity models
│   ├── DTOs/                        #   Request/response data transfer objects
│   ├── Services/                    #   AppointmentService, TokenService
│   ├── Data/                        #   AppDbContext, DbSeeder
│   ├── Hubs/                        #   ChatHub (SignalR)
│   └── appsettings.json             #   Connection strings, JWT config
│
├── ClinicGo-Patient/                # Patient Android App (Java)
│   └── app/src/main/java/com/clinicgo/patient/
│       ├── activities/              #   HomeActivity, LoginActivity, SplashActivity
│       ├── fragments/               #   Home, Appointments, BookAppointment,
│       │                            #   History, Messages, Chat, Profile, Payment
│       ├── adapters/                #   AppointmentAdapter, SlotAdapter,
│       │                            #   PrescriptionAdapter, ChatAdapter
│       ├── models/                  #   AppointmentModel, PrescriptionModel,
│       │                            #   SlotModel, PaymentModel, ChatMessage, ...
│       ├── network/                 #   ApiClient, ApiService (Retrofit)
│       └── utils/                   #   SessionManager
│
├── ClinicGo-Staff/                  # Staff Android App (Java)
│   └── app/src/main/java/com/clinicgo/staff/
│       ├── activities/              #   HomeActivity (role-based nav), LoginActivity
│       ├── fragments/               #   DoctorDashboard, DoctorSchedule,
│       │                            #   PrescriptionWriter, DoctorMessages, DoctorChat,
│       │                            #   ReceptionistDashboard, AppointmentMgmt,
│       │                            #   Queue, Profile
│       ├── adapters/                #   AppointmentAdapter, PatientAdapter, ChatAdapter
│       ├── models/                  #   AppointmentModel (+ nested PatientInfo),
│       │                            #   QueueModel, PrescriptionModel, ChatMessage, ...
│       ├── network/                 #   ApiClient, ApiService (Retrofit)
│       └── utils/                   #   SessionManager (stores doctorId for IST-aware calls)
│
├── clinicgo-web/                    # React Web Portal
│   └── src/
│       ├── pages/
│       │   ├── auth/                #   LoginPage (split layout)
│       │   ├── admin/               #   AdminDashboard, AdminAnalytics,
│       │   │                        #   AdminDoctors, AdminPatients, AdminOperations
│       │   └── doctor/              #   DoctorSchedule, DoctorStats, DoctorLabReports
│       ├── components/layout/       #   AdminLayout, DoctorLayout (sidebars)
│       ├── context/                 #   AuthContext (JWT + role routing)
│       ├── services/                #   api.js (Axios + todayIST() utility)
│       └── index.css                #   Animation library (fadeInUp, shimmer, card-hover)
│
├── ClinicGo_Seed.sql               # PostgreSQL demo data seed script
├── README.md                        # This file
└── .gitignore
```

---

## Timezone Note

The backend is deployed on Linux servers (UTC). All "today" date comparisons in the controllers use **IST (UTC+5:30)** explicitly via `TimeZoneInfo.FindSystemTimeZoneById("Asia/Kolkata")` to ensure the correct day is used for Indian users. Payment timestamps stored in UTC are converted to IST before date extraction.

---

## License

Academic project — not for commercial use.
