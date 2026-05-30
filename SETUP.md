# 🚀 EmPay HRMS – Setup Guide

## Prerequisites

1. **Node.js** v18+ → [Download](https://nodejs.org/)
2. **PostgreSQL** v14+ → [Download](https://www.postgresql.org/download/)

---

## Docker Quick Start

If you have Docker installed, you can run the full stack without installing Node.js or PostgreSQL locally:

```bash
cp .env.example .env
```

```bash
docker compose up --build
```

Open **http://localhost:5173** in your browser.

The backend health check is available at **http://localhost:5000/api/health**.

PostgreSQL data persists in a Docker volume. The backend automatically creates tables and seeds demo users on first startup.

To seed attendance, leave, and payroll demo data:

```bash
docker compose exec backend node seed-demo-data.js
```

See [DOCKER.md](DOCKER.md) for Docker environment values and useful commands.

---

## Step 1: Clone & Install

```bash
git clone https://github.com/rushikesh-bobade/empay-hrms.git
cd empay-hrms

# Install backend
cd backend
npm install

# Install frontend
cd ../frontend
npm install
```

---

## Step 2: Create PostgreSQL Database

Open **pgAdmin** or **psql** and run:

```sql
CREATE DATABASE empay_db;
```

---

## Step 3: Configure Environment

Copy and edit `backend/.env`:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PG_PASSWORD@localhost:5432/empay_db
JWT_SECRET=empay_super_secret_jwt_key_2024
JWT_EXPIRES_IN=7d
# (BCRYPT_ROUNDS is deprecated, using default argon2 config)
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

> ⚠️ Replace `YOUR_PG_PASSWORD` with your actual PostgreSQL password.

---

## Step 4: Start the Backend (auto-creates tables + seeds users)

```bash
cd backend
node src/app.js
```

You should see:
```
✅ All tables created successfully.
👤 Seeded user: admin@empay.com (admin)
👤 Seeded user: hr@empay.com (hr_officer)
...
✅ Demo data seeding complete.
🚀 EmPay API running on http://localhost:5000
```

---

## Step 5: Seed Demo Data (Attendance, Leaves, Payroll)

The app seeds users and leave types automatically, but **graphs need attendance + payroll data**.

Run this seeder script:

```bash
cd backend
node seed-demo-data.js
```

_(The `seed-demo-data.js` file is included in the project)_

---

## Step 6: Start the Frontend

```bash
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Step 7: Login

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@empay.com | Password@123 |
| **HR Officer** | hr@empay.com | Password@123 |
| **Payroll Officer** | payroll@empay.com | Password@123 |
| **Employee** | sneha@empay.com | Password@123 |
| **Employee** | amit@empay.com | Password@123 |
| **Employee** | neha@empay.com | Password@123 |
| **Employee** | vikram@empay.com | Password@123 |
| **Employee** | ananya@empay.com | Password@123 |

---

## Troubleshooting

- **"DATABASE_URL is not set"** → Make sure `.env` exists in `backend/` folder
- **"Connection refused"** → PostgreSQL service is not running. Start it.
- **"password authentication failed"** → Wrong PG password in DATABASE_URL
- **Empty graphs** → Run `node seed-demo-data.js` to populate demo data
- **Profile pics not showing** → Ensure `backend/uploads/avatars/` exists
