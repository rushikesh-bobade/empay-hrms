# 🤝 Contributing to EmPay HRMS

**Welcome!** We're thrilled you're interested in contributing to EmPay HRMS. This project is part of **GSSoC '26 (GirlScript Summer of Code 2026)** and we welcome contributions from developers of all skill levels.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18+ → [Download](https://nodejs.org/)
- **PostgreSQL** v14+ → [Download](https://www.postgresql.org/download/)
- **Git** → [Download](https://git-scm.com/)

---

## 🚀 Getting Started

For detailed setup instructions, please refer to our [SETUP.md](../SETUP.md). Here's a quick overview:

### 1. Fork the Repository

Click the **Fork** button at the top right of the [EmPay HRMS repo](https://github.com/rushikesh-bobade/empay-hrms).

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/empay-hrms.git
cd empay-hrms
```

### 3. Add Upstream Remote

```bash
git remote add upstream https://github.com/rushikesh-bobade/empay-hrms.git
```

### 4. Install Dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 5. Set Up Environment

```bash
# Copy the example env file
cp backend/.env.example backend/.env
# Edit backend/.env with your PostgreSQL credentials
```

### 6. Create Database & Run

```sql
CREATE DATABASE empay_db;
```

```bash
# Start backend (auto-creates tables + seeds demo users)
cd backend && node src/app.js

# In another terminal, seed demo data
node seed-demo-data.js

# Start frontend
cd ../frontend && npm run dev
```

Open **http://localhost:5173** and login with `admin@empay.com` / `Password@123`.

---

## 🌿 Branch Naming Convention

Always create a new branch from the latest `main`:

```bash
git checkout main
git pull upstream main
git checkout -b <branch-name>
```

**Branch naming format:**

| Type | Format | Example |
|------|--------|---------|
| Feature | `feature/issue-number-short-description` | `feature/42-shift-management` |
| Bug Fix | `fix/issue-number-short-description` | `fix/15-login-redirect-loop` |
| Documentation | `docs/issue-number-short-description` | `docs/8-api-documentation` |

---

## 💬 Commit Message Format

We follow the **Conventional Commits** specification:

```
type(scope): description
```

### Types

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes |
| `style` | Code formatting (no logic changes) |
| `refactor` | Code restructuring (no feature/fix) |
| `test` | Adding or updating tests |
| `chore` | Build process, dependencies, configs |

### Examples

```
feat(attendance): add weekly attendance export to CSV
fix(payroll): correct PF calculation for partial months
docs(readme): add Docker setup instructions
style(dashboard): fix alignment of stat cards
refactor(auth): extract token validation to middleware
test(leave): add unit tests for leave balance calculation
chore(deps): update React to v19.3
```

---

## 📝 Pull Request Process

1. Ensure your branch is up to date with `main`
2. Push your branch to your fork
3. Open a Pull Request against `main`
4. Fill out the PR template completely

### PR Checklist

- [ ] Clear description of what the change does and why
- [ ] Screenshots/recordings attached for any UI changes
- [ ] No breaking changes introduced without prior discussion in an issue
- [ ] All existing features still work as expected
- [ ] Code follows the project's ESLint rules
- [ ] No `console.log` statements left in production code
- [ ] Self-reviewed the code before requesting review

---

## 🏷️ Issue Labels

We use the following labels to organize issues:

| Label | Description |
|-------|-------------|
| `good first issue` | Perfect for newcomers to open source |
| `help wanted` | Community contributions welcome |
| `bug` | Something isn't working |
| `enhancement` | New feature or improvement |
| `documentation` | Documentation improvements |
| `frontend` | Related to React/UI code |
| `backend` | Related to Express/API code |
| `database` | Related to PostgreSQL schema or queries |

---

## 🎨 Code Style

This project uses **ESLint** for code quality. Before submitting a PR:

```bash
# Run linting on frontend
cd frontend && npm run lint
```

**General guidelines:**
- Use `const` and `let` — never `var`
- Use async/await over `.then()` chains
- Use meaningful variable and function names
- Add comments for complex business logic
- Keep components focused and reusable

---

## ⏱️ Review Process

- Maintainers will review PRs within **48 hours**
- You may be asked to make changes — this is normal and part of the process
- Once approved, a maintainer will merge your PR
- Your contribution will be reflected on the GSSoC leaderboard

---

## 💬 Need Help?

- 🐛 Found a bug? [Open an issue](https://github.com/rushikesh-bobade/empay-hrms/issues/new)
- 💡 Have an idea? [Request a feature](https://github.com/rushikesh-bobade/empay-hrms/issues/new)
- 💬 Questions? Reach out on the [GSSoC Discord](https://discord.gg/gssoc)

---

**Thank you for contributing to EmPay HRMS! Every contribution matters. 🎉**
