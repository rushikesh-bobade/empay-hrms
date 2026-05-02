# EmPay — Smart Human Resource Management System

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Backend Setup
```bash
cd backend
npm install
# Create PostgreSQL database
createdb empay_db
# Update .env with your PostgreSQL credentials
npm run seed          # Creates tables + seeds dummy data
npm start             # Runs on port 5000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev           # Runs on port 5173
```

## Demo Login Credentials
| Role            | Email                | Password      |
|-----------------|----------------------|---------------|
| Admin           | admin@empay.com      | Password@123  |
| HR Officer      | hr@empay.com         | Password@123  |
| Payroll Officer | payroll@empay.com    | Password@123  |
| Employee        | sneha@empay.com      | Password@123  |
| Employee        | rahul@empay.com      | Password@123  |

## Features
- **4 Roles**: Admin, HR Officer, Payroll Officer, Employee
- **Attendance**: Check-in/out with calendar view
- **Leave Management**: Apply, approve/reject with balance tracking
- **Payroll**: Automated calculation with PF + Professional Tax
- **PDF Payslips**: Server-generated PDFs with detailed breakdown
- **Dashboards**: Role-specific analytics with Recharts
- **Dark Mode**: Premium glassmorphic UI design

## Tech Stack
- **Backend**: Node.js, Express.js, PostgreSQL
- **Frontend**: React, Vite, Tailwind CSS, Recharts
- **Auth**: JWT + bcrypt
