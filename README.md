<div align="center">

# 🏢 EmPay HRMS

### Smart Human Resource Management System

![GSSoC 2026](https://img.shields.io/badge/GSSoC-2026-orange?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=for-the-badge)
![Node](https://img.shields.io/badge/node-22+-green?style=for-the-badge)

[![Node.js](https://img.shields.io/badge/Node.js-22+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

*A full-stack enterprise-grade HRMS built for modern teams — featuring real-time attendance tracking, automated payroll, leave management, and role-based dashboards with a premium glassmorphic UI.*

</div>

---

## ✨ Key Features

### 🔐 Multi-Role Access Control
- **4 distinct roles** — Admin, HR Officer, Payroll Officer, Employee
- JWT-based authentication with argon2 password hashing
- Role-specific dashboards, navigation, and permissions
- Automated welcome emails with credentials on account creation

### ⏱️ Real-Time Attendance
- One-click check-in / check-out with live timer
- Re-check-in support after half-day leave
- Calendar heatmap view with color-coded attendance
- Weekly/monthly attendance charts with Recharts

### 🏖️ Leave Management
- Apply for leaves with type selection and date range
- HR/Admin approval workflow (approve/reject with notifications)
- Leave balance tracking per type per year
- Searchable employee picker for leave allocation (scales to 1000+ employees)
- Leave allocation by HR with balance enforcement

### 💰 Automated Payroll
- Salary structure management (Basic, HRA%, Special Allowance)
- Payrun generation with automatic calculations:
  - PF (12% employee + 12% employer)
  - Professional Tax (slab-based)
  - Unpaid leave deductions (pro-rata)
- PDF payslip generation with detailed breakdown
- Monthly payrun history with finalization workflow

### 📊 Analytics Dashboards
- **Admin**: Company-wide stats, employee distribution, department breakdown
- **HR**: Attendance trends, leave utilization, headcount analytics
- **Payroll**: Salary disbursement, deduction summaries, payrun status
- **Employee**: Personal attendance graph, leave balance, recent payslips

### 🎨 Premium UI/UX
- Glassmorphic design with radial gradients and mesh backgrounds
- Dark/Light theme toggle with smooth transitions (persisted in localStorage)
- Collapsible sidebar with icon-only mode and hover tooltips
- Micro-animations, hover effects, and responsive layouts
- Real-time notifications via Socket.IO

### 📧 Email Notifications
- Welcome email with credentials on employee creation
- Leave status update emails (approved/rejected)
- Password reset flow with tokenized email links
- Gmail SMTP integration (or Ethereal for development)

---

## 🏗️ Architecture

```
empay-hrms/
├── backend/                          # Express.js REST API
│   ├── src/
│   │   ├── app.js                    # Server entry + Socket.IO
│   │   ├── config/db.js              # PostgreSQL schema + migrations + seeding
│   │   ├── middleware/               # Auth, RBAC, file upload
│   │   ├── modules/                  # Feature modules ↓
│   │   │   ├── auth/                 # Login, register, password reset
│   │   │   ├── users/                # CRUD, profile pic upload
│   │   │   ├── attendance/           # Check-in/out, history, stats
│   │   │   ├── leave/                # Requests, allocations, types
│   │   │   ├── payroll/              # Payruns, salary, payslips, PDF
│   │   │   ├── dashboard/            # Role-specific analytics
│   │   │   ├── notifications/        # Real-time alerts
│   │   │   └── settings/             # Company settings
│   │   └── utils/                    # Mailer, email templates
│   ├── uploads/avatars/              # Profile picture storage
│   └── seed-demo-data.js             # Demo data seeder
│
└── frontend/                         # React SPA (Vite)
    └── src/
        ├── context/                  # Auth, Theme, Sidebar state
        ├── components/               # Layout (Sidebar, Topbar) + shared
        └── pages/                    # Role-based page modules
            ├── admin/                # Dashboard, User Mgmt, Settings
            ├── hr/                   # Employees, Attendance, Leaves
            ├── payroll/              # Payruns, Salary, Approvals
            ├── employee/             # Dashboard, Attendance, Leaves, Payslips
            └── shared/               # Profile
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19, Vite 8 | UI framework + build tool |
| **Styling** | Tailwind CSS 4 | Utility-first CSS |
| **Charts** | Recharts | Dashboard analytics |
| **Icons** | Lucide React | Consistent icon set |
| **State** | React Context | Auth, theme, sidebar |
| **Routing** | React Router 7 | Client-side navigation |
| **Backend** | Express.js 4 | REST API server |
| **Database** | PostgreSQL 14+ | Relational data store |
| **Auth** | JWT + argon2 | Stateless authentication |
| **Real-time** | Socket.IO | Live notifications |
| **Email** | Nodemailer | SMTP email delivery |
| **File Upload** | Multer | Avatar image handling |
| **PDF** | PDFKit | Server-side payslip generation |

---

## 🤝 Contributing

This project is part of **GSSoC '26 (GirlScript Summer of Code 2026)**. We welcome contributions from developers of all skill levels!

Please read our [Contributing Guide](.github/CONTRIBUTING.md) before getting started. Check our [Roadmap](ROADMAP.md) for what needs to be built.

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/rushikesh-bobade/empay-hrms/pulls)

---

## 🏷️ Good First Issues

New to open source? Start here: **[View Good First Issues](https://github.com/rushikesh-bobade/empay-hrms/issues?q=label%3A%22good+first+issue%22)**

We label beginner-friendly issues so you can find tasks that match your skill level. Each good first issue includes:
- Clear task description
- Files to modify
- Acceptance criteria
- Hints to get started

---

## 📋 GSSoC '26

<div align="center">

![GSSoC 2026](https://img.shields.io/badge/GSSoC-2026-orange?style=for-the-badge)

</div>

This project is officially part of **GirlScript Summer of Code 2026**. Contributors who get PRs merged will earn leaderboard points.

See [gssoc.girlscript.org](https://gssoc.girlscript.org) for details.

---

## 🚀 Quick Start

### Docker

Optional environment setup:

```bash
cp .env.example .env
```

Start the full stack:

```bash
docker compose up --build
```

Open **http://localhost:5173**. The backend API runs on **http://localhost:5000**.

PostgreSQL data persists in a Docker volume, and the backend automatically creates tables and seeds demo users on first startup.

To seed full demo dashboard data:

```bash
docker compose exec backend node seed-demo-data.js
```

For Docker details, see [DOCKER.md](DOCKER.md).

### Local Development

### Prerequisites
- **Node.js** 22+ → [nodejs.org](https://nodejs.org/)
- **PostgreSQL** 14+ → [postgresql.org](https://www.postgresql.org/download/)

### 1. Clone & Install

```bash
git clone https://github.com/rushikesh-bobade/empay-hrms.git
cd empay-hrms

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Create Database

```sql
CREATE DATABASE empay_db;
```

### 3. Configure Environment

Create `backend/.env`:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/empay_db
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
# (BCRYPT_ROUNDS is deprecated, using default argon2 config)
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### 4. Start Backend (auto-creates tables + seeds users)

```bash
cd backend
node src/app.js
```

### 5. Seed Demo Data (fills dashboards and graphs)

```bash
node seed-demo-data.js
```

> This populates 30 days of attendance, leave allocations, leave requests, salary structures, and 3 months of payroll data.

### 6. Start Frontend

```bash
cd ../frontend
npm run dev
```

Open **http://localhost:5173** 🎉

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| 👑 **Admin** | `admin@empay.com` | `Password@123` |
| 👩‍💼 **HR Officer** | `hr@empay.com` | `Password@123` |
| 💰 **Payroll Officer** | `payroll@empay.com` | `Password@123` |
| 👨‍💻 **Employee** | `sneha@empay.com` | `Password@123` |
| 👨‍💻 **Employee** | `amit@empay.com` | `Password@123` |
| 👨‍💻 **Employee** | `neha@empay.com` | `Password@123` |
| 👨‍💻 **Employee** | `vikram@empay.com` | `Password@123` |
| 👨‍💻 **Employee** | `ananya@empay.com` | `Password@123` |

---

## 📋 Database Schema

```
users ──────────────── 1:N ──── attendance
  │                              (check_in, check_out, status)
  │
  ├── 1:N ──── leave_requests
  │              (type, dates, status, reviewed_by)
  │
  ├── 1:N ──── leave_allocations
  │              (type, allocated_days, used_days, year)
  │
  ├── 1:1 ──── salary_structures
  │              (basic, hra%, special_allowance)
  │
  ├── 1:N ──── payslips ──── N:1 ──── payruns
  │              (gross, deductions, net_pay)    (month, year, status)
  │
  └── 1:N ──── notifications
                 (title, message, is_read)

leave_types ──── 1:N ──── leave_requests
                 1:N ──── leave_allocations
```

**10 tables** with full referential integrity, CHECK constraints, and proper indexing.

---

## 📧 Email Setup (Optional)

To send real emails (welcome credentials, leave updates, password reset):

1. Enable **2-Step Verification** on your Google account
2. Generate an [App Password](https://myaccount.google.com/apppasswords)
3. Add to `backend/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_FROM="EmPay HRMS" <your-gmail@gmail.com>
```

Without SMTP config, emails go to Ethereal (test mode) with preview URLs in the console.

---

## 👥 Team

Built for the **Odoo x Hackathon** 🏆 — now open source under **GSSoC '26**.

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

## 📖 Additional Resources

- [Contributing Guide](.github/CONTRIBUTING.md)
- [Code of Conduct](.github/CODE_OF_CONDUCT.md)
- [Security Policy](SECURITY.md)
- [Project Roadmap](ROADMAP.md)
- [Setup Guide](SETUP.md)

---

<div align="center">

**⭐ Star this repo if you found it useful!**

Made with ❤️ for the open-source community

</div>
