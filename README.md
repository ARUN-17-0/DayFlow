<div align="center">

<img src="https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js" />
<img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" />
<img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase" />
<img src="https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge&logo=vercel" />
<img src="https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8?style=for-the-badge&logo=tailwindcss" />

# 🗓️ DayFlow

**A modern, full-stack Human Resource Management System built for real teams.**

[🚀 Live Demo](https://dayflow-livid-one.vercel.app) · [GitHub](https://github.com/karthika-jg/DayFlow)

</div>

---

## ✨ What is DayFlow?

DayFlow is a production-ready HRMS that digitizes your entire employee workday — from clocking in to getting paid. Built with Next.js 16, Prisma ORM, and a Supabase PostgreSQL backend, and deployed live on Vercel.

It supports three user roles out of the box:

| Role | Access |
|------|--------|
| **Admin** | Full system control — employees, payroll, reports, settings |
| **HR Officer** | Manage attendance, approve leaves, view payroll |
| **Employee** | Personal dashboard, attendance, leave requests, payslips |

---

## 🌐 Live Deployment

> Hosted on **Vercel** · Database on **Supabase (ap-southeast-1)**

🔗 **[https://dayflow-livid-one.vercel.app](https://dayflow-livid-one.vercel.app)**

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@dayflow.io` | `Admin@123` |
| HR Officer | `hr@dayflow.io` | `HR@123` |
| Employee | `emp001@dayflow.io` | `Emp@123` |

---

## 🧩 Features

### 👥 Employee Management
- Add, edit, and manage employee profiles
- Assign departments, designations, reporting managers
- Upload avatars and documents (offer letters, contracts, ID proofs)

### 🕐 Attendance
- One-tap Check In / Check Out with live timer
- View daily, weekly, and monthly attendance logs
- Status tracking: Present, Absent, Half Day, On Leave, Holiday

### 🏖️ Leave Management
- Submit leave requests with type selection (Paid, Sick, Casual, Unpaid, etc.)
- Admin/HR approval workflow with comments
- Real-time leave balance tracking per employee

### 💰 Payroll
- Run monthly payroll with one click
- Full earnings & deductions breakdown (Basic, HRA, PF, Tax, etc.)
- **Printable payslip generator** — branded PDF-ready HTML payslip per employee

### 🔔 Notifications
- Real-time notification center for all system events
- **Outlook-style popup** — click any notification to open a full detail modal with the complete message, timestamp, and mark-as-read action

### 📊 Reports & Analytics
- Attendance, leave, and payroll reports with date range filters
- Export-ready data tables

### 🔒 Security & Auth
- Secure sign-in with NextAuth.js
- OTP-based email verification
- Role-based access control (RBAC) — every route and API is protected
- Audit log for admin actions

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Auth | NextAuth.js v4 |
| ORM | Prisma v5 |
| Database | Supabase (PostgreSQL, pooler mode) |
| Animations | Framer Motion |
| Charts | Recharts |
| Hosting | Vercel |
| Icons | Lucide React |

---

## 🚀 Running Locally

### 1. Clone the repo

```bash
git clone https://github.com/karthika-jg/DayFlow.git
cd DayFlow
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Create a `.env` file in the root:

```env
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Push schema & seed data

```bash
pnpm db:push
pnpm db:seed
```

### 5. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with the demo credentials above.

---

## 📁 Project Structure

```
dayflow/
├── app/
│   ├── (employee)/        # Employee-facing pages
│   ├── admin/             # Admin & HR pages
│   └── api/               # All API routes (Next.js Route Handlers)
├── components/
│   └── dayflow/           # Shared UI components
│       ├── layout/        # Topbar, Sidebar, MobileDrawer
│       └── ...
├── prisma/
│   ├── schema.prisma      # Full 15-model PostgreSQL schema
│   └── seed.ts            # Demo data seeder
└── lib/
    ├── auth/              # NextAuth config + helpers
    └── db.ts              # Prisma client singleton
```

---

## 📄 License

MIT © 2026 DayFlow
