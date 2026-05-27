# 📋 GitHub Issues to Create for GSSoC '26

Create these issues manually on GitHub after pushing all open-source files. Delete this file from the repo after posting all issues.

---

## Frontend UI Issues (5)

### Issue 1
- **Title**: [GOOD FIRST ISSUE] Add loading skeletons to Admin Dashboard
- **Labels**: `good first issue`, `frontend`, `GSSoC`, `enhancement`
- **Description**: The Admin Dashboard currently shows a blank screen while data is loading. Add animated skeleton/shimmer placeholders for the stat cards, charts, and tables to improve perceived performance.
- **Files involved**: `frontend/src/pages/admin/AdminDashboard.jsx`
- **Acceptance Criteria**:
  - Skeleton placeholders appear while API data is loading
  - Skeletons match the layout of actual content
  - Smooth transition from skeleton to real data
- **Difficulty**: 🟢 Easy

### Issue 2
- **Title**: [GOOD FIRST ISSUE] Create a custom 404 Not Found page
- **Labels**: `good first issue`, `frontend`, `GSSoC`, `enhancement`
- **Description**: When users navigate to a non-existent route, they see a blank page. Create a visually appealing 404 page that matches the glassmorphic design system and includes a "Go to Dashboard" button.
- **Files involved**: `frontend/src/pages/NotFound.jsx` (new), `frontend/src/App.jsx`
- **Acceptance Criteria**:
  - 404 page renders for unknown routes
  - Page uses the existing glassmorphic design system
  - Includes a button to navigate back to the dashboard
  - Works in both dark and light themes
- **Difficulty**: 🟢 Easy

### Issue 3
- **Title**: [FEATURE] Add "Export to CSV" button on Employee Attendance page
- **Labels**: `enhancement`, `frontend`, `GSSoC`, `help wanted`
- **Description**: HR officers and employees should be able to export their attendance data to a CSV file. Add an "Export CSV" button on the attendance history page that downloads the visible data.
- **Files involved**: `frontend/src/pages/employee/MyAttendance.jsx`, `frontend/src/pages/hr/HRDashboard.jsx`
- **Acceptance Criteria**:
  - "Export CSV" button visible on attendance page
  - Downloaded CSV includes: Date, Check-in, Check-out, Duration, Status
  - Filename includes employee name and date range
- **Difficulty**: 🟡 Medium

### Issue 4
- **Title**: [FEATURE] Improve mobile responsiveness for HR Dashboard
- **Labels**: `enhancement`, `frontend`, `GSSoC`, `help wanted`
- **Description**: The HR Dashboard stat cards and charts don't stack properly on mobile screens (< 768px). Fix the grid layout to be fully responsive with proper spacing and readable charts.
- **Files involved**: `frontend/src/pages/hr/HRDashboard.jsx`, `frontend/src/components/shared/StatCard.jsx`
- **Acceptance Criteria**:
  - All stat cards stack vertically on mobile
  - Charts resize properly on small screens
  - No horizontal scrolling on any screen size
  - Sidebar collapses to hamburger menu on mobile
- **Difficulty**: 🟡 Medium

### Issue 5
- **Title**: [FEATURE] Add confirmation dialog before deleting an employee
- **Labels**: `enhancement`, `frontend`, `GSSoC`, `help wanted`
- **Description**: Currently, deleting an employee from User Management happens immediately on click. Add a confirmation modal using Radix UI Dialog that asks "Are you sure?" before proceeding with deletion.
- **Files involved**: `frontend/src/pages/admin/UserManagement.jsx`
- **Acceptance Criteria**:
  - Confirmation dialog appears before deletion
  - Dialog shows employee name being deleted
  - Cancel button closes dialog without action
  - Confirm button proceeds with deletion
  - Works in both dark and light themes
- **Difficulty**: 🟢 Easy

---

## Backend/API Issues (4)

### Issue 6
- **Title**: [FEATURE] Add Swagger/OpenAPI documentation for all API endpoints
- **Labels**: `enhancement`, `backend`, `documentation`, `GSSoC`, `help wanted`
- **Description**: Add Swagger UI to document all REST API endpoints. Use `swagger-jsdoc` and `swagger-ui-express` to auto-generate docs from JSDoc comments. The docs should be accessible at `/api-docs`.
- **Files involved**: `backend/src/app.js`, all route files in `backend/src/modules/*/`
- **Acceptance Criteria**:
  - Swagger UI accessible at `http://localhost:5000/api-docs`
  - All endpoints documented with request/response schemas
  - Authentication requirements noted per endpoint
  - Example request bodies provided
- **Difficulty**: 🟡 Medium

### Issue 7
- **Title**: [FEATURE] Add rate limiting to prevent API abuse
- **Labels**: `enhancement`, `backend`, `GSSoC`, `help wanted`
- **Description**: Add `express-rate-limit` middleware to protect the API from brute-force attacks and abuse. Apply stricter limits on auth endpoints (login, password reset) and general limits on all other endpoints.
- **Files involved**: `backend/src/app.js`, `backend/src/modules/auth/auth.routes.js`
- **Acceptance Criteria**:
  - General rate limit: 100 requests per 15 minutes per IP
  - Auth endpoints: 10 requests per 15 minutes per IP
  - Returns 429 status with clear error message when limited
  - Rate limit headers included in responses
- **Difficulty**: 🟢 Easy

### Issue 8
- **Title**: [FEATURE] Add request logging with Morgan
- **Labels**: `enhancement`, `backend`, `GSSoC`, `help wanted`
- **Description**: Add the `morgan` HTTP request logger to the Express backend. Use 'dev' format in development and 'combined' format in production. This helps debug API issues and monitor server activity.
- **Files involved**: `backend/src/app.js`, `backend/package.json`
- **Acceptance Criteria**:
  - All HTTP requests are logged to console in development
  - Logs include method, URL, status code, and response time
  - Production mode uses 'combined' format
  - No sensitive data (passwords, tokens) logged
- **Difficulty**: 🟢 Easy

### Issue 9
- **Title**: [FEATURE] Add centralized error handling middleware
- **Labels**: `enhancement`, `backend`, `GSSoC`, `help wanted`
- **Description**: Create a centralized Express error handling middleware that catches all unhandled errors, formats consistent JSON error responses, and prevents server crashes from unhandled exceptions.
- **Files involved**: `backend/src/middleware/errorHandler.js` (new), `backend/src/app.js`
- **Acceptance Criteria**:
  - All unhandled errors return consistent JSON format: `{ success: false, message, statusCode }`
  - Development mode includes stack trace in response
  - Production mode hides internal error details
  - Server does not crash on unhandled errors
  - Validation errors return 400 with field-specific messages
- **Difficulty**: 🟡 Medium

---

## Documentation Issues (3)

### Issue 10
- **Title**: [DOCS] Add API endpoint reference documentation
- **Labels**: `documentation`, `GSSoC`, `help wanted`
- **Description**: Create an `API.md` file documenting all REST API endpoints with method, URL, required headers, request body, and response format. Group by module (Auth, Users, Attendance, Leave, Payroll).
- **Files involved**: `API.md` (new file in root)
- **Acceptance Criteria**:
  - All endpoints documented with method and URL
  - Request headers (Authorization) noted where required
  - Request body examples provided for POST/PUT
  - Response format with status codes documented
  - Grouped by module
- **Difficulty**: 🟡 Medium

### Issue 11
- **Title**: [DOCS] Add database schema diagram using Mermaid
- **Labels**: `documentation`, `database`, `GSSoC`, `good first issue`
- **Description**: Create a visual Entity-Relationship diagram of the database schema using Mermaid syntax in the README or a separate `SCHEMA.md` file. Show all tables, relationships, and key columns.
- **Files involved**: `SCHEMA.md` (new file in root) or update `README.md`
- **Acceptance Criteria**:
  - All 10 tables represented in the diagram
  - Relationships (1:N, 1:1) clearly shown
  - Key columns listed per table
  - Renders correctly on GitHub
- **Difficulty**: 🟢 Easy

### Issue 12
- **Title**: [DOCS] Add deployment guide for Railway/Render
- **Labels**: `documentation`, `GSSoC`, `help wanted`
- **Description**: Write a step-by-step deployment guide for deploying EmPay HRMS to a free cloud platform (Railway or Render). Include PostgreSQL setup, environment variables, and build commands.
- **Files involved**: `DEPLOYMENT.md` (new file in root)
- **Acceptance Criteria**:
  - Step-by-step instructions with screenshots
  - PostgreSQL provisioning covered
  - Environment variable configuration documented
  - Build and start commands specified
  - Common deployment errors and fixes listed
- **Difficulty**: 🟡 Medium

---

## Testing Issues (2)

### Issue 13
- **Title**: [TEST] Add unit tests for payroll calculation logic
- **Labels**: `enhancement`, `backend`, `GSSoC`, `help wanted`
- **Description**: Add Jest unit tests for the payroll calculation functions: PF calculation, professional tax slabs, unpaid leave deductions, and net pay calculation. Test edge cases like zero salary, maximum deductions, and partial months.
- **Files involved**: `backend/src/config/db.js` (calcUnpaidDeduction, buildPayslip functions), `backend/__tests__/payroll.test.js` (new)
- **Acceptance Criteria**:
  - Jest configured in backend
  - Tests cover PF calculation (12% employee + 12% employer)
  - Tests cover professional tax slab logic
  - Tests cover unpaid leave deduction calculation
  - Tests cover net pay = gross - total deductions
  - Edge cases tested (0 salary, 0 working days, max deductions)
  - All tests pass
- **Difficulty**: 🟡 Medium

### Issue 14
- **Title**: [TEST] Add integration tests for authentication flow
- **Labels**: `enhancement`, `backend`, `GSSoC`, `help wanted`
- **Description**: Add Supertest integration tests for the authentication endpoints: login, register, password reset request, and token validation. Test both success and failure scenarios.
- **Files involved**: `backend/__tests__/auth.test.js` (new), `backend/package.json`
- **Acceptance Criteria**:
  - Supertest and Jest configured
  - Login: valid credentials return 200 + token
  - Login: invalid credentials return 401
  - Login: missing fields return 400
  - Token validation: expired token returns 401
  - Password reset: valid email returns 200
  - All tests pass independently (no DB side effects)
- **Difficulty**: 🔴 Advanced

---

## DevOps Issue (1)

### Issue 15
- **Title**: [FEATURE] Add Docker Compose setup for one-command deployment
- **Labels**: `enhancement`, `GSSoC`, `help wanted`
- **Description**: Create a `docker-compose.yml` that sets up the entire EmPay HRMS stack (frontend, backend, PostgreSQL) with a single `docker-compose up` command. Include Dockerfiles for both frontend and backend.
- **Files involved**: `docker-compose.yml` (new), `backend/Dockerfile` (new), `frontend/Dockerfile` (new), `.dockerignore` (new)
- **Acceptance Criteria**:
  - `docker-compose up` starts all 3 services
  - PostgreSQL data persists via Docker volumes
  - Environment variables configurable via `.env`
  - Frontend accessible at localhost:5173
  - Backend accessible at localhost:5000
  - Database auto-seeds on first run
  - README updated with Docker instructions
- **Difficulty**: 🟡 Medium

---

> **After posting all 15 issues, delete this `issues-to-create.md` file from the repository.**
