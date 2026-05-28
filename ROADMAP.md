# 🗺️ EmPay HRMS — Project Roadmap

This roadmap outlines the current state and future plans for EmPay HRMS. Contributors are welcome to pick up any item marked with 📋.

---

## ✅ Completed Features

- ✅ Multi-role authentication (Admin, HR Officer, Payroll Officer, Employee)
- ✅ JWT-based auth with argon2 password hashing
- ✅ Real-time attendance tracking with live timer and Socket.IO
- ✅ Re-check-in support with accumulated time tracking
- ✅ Leave request and approval workflow
- ✅ Leave balance tracking per type per year
- ✅ Searchable employee picker (scales to 1000+ employees)
- ✅ Automated payroll with PF (12%) and Professional Tax
- ✅ PDF payslip generation with detailed breakdown
- ✅ Email notifications via Nodemailer (welcome, leave updates, password reset)
- ✅ Analytics dashboards per role (Admin, HR, Payroll, Employee)
- ✅ Dark/Light theme toggle with smooth transitions
- ✅ Glassmorphic premium UI with micro-animations
- ✅ Cloudinary integration for profile image storage
- ✅ Calendar heatmap for attendance visualization
- ✅ Company settings management
- ✅ Employee directory with fuzzy search (ILIKE)

---

## 🔄 In Progress / Help Wanted

- 🔄 Mobile responsive improvements for all dashboards
- 🔄 Unit test coverage for payroll calculation logic
- 🔄 Integration tests for leave approval workflow
- 🔄 API input validation improvements (express-validator)
- 🔄 Centralized error handling middleware

---

## 📋 Planned Features — Open for Contributors

### 🟢 Easy (Good First Issues)
- 📋 Add loading skeletons to all dashboard pages
- 📋 Add "Export to CSV" button on attendance history page
- 📋 Improve form validation messages across the app
- 📋 Add tooltips to dashboard stat cards
- 📋 Create a 404 Not Found page

### 🟡 Medium
- 📋 Shift management module (morning/night/flexible shifts)
- 📋 Holiday calendar management
- 📋 Bulk employee import via CSV upload
- 📋 Swagger/OpenAPI documentation for all API endpoints
- 📋 Docker Compose setup for easy deployment
- 📋 Add rate limiting with `express-rate-limit`
- 📋 Request logging with `morgan`
- 📋 Security headers with `helmet`

### 🔴 Advanced
- 📋 Asset management (assign laptops/equipment to employees)
- 📋 Performance review and appraisal module
- 📋 Two-factor authentication (2FA)
- 📋 Mobile app (React Native)
- 📋 Internationalization (i18n) support
- 📋 Role-based API rate limiting
- 📋 Audit log for all admin actions

---

## 🤝 How to Contribute

1. Check the [Issues](https://github.com/rushikesh-bobade/empay-hrms/issues) page for open tasks
2. Look for labels: `good first issue`, `help wanted`, `GSSoC`
3. Comment on the issue to get assigned
4. Read our [Contributing Guide](.github/CONTRIBUTING.md)
5. Submit a PR!

---

*Last updated: May 2026*
