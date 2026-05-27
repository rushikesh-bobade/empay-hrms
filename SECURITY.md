# 🔒 Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest `main` branch | ✅ Yes |
| Older branches | ❌ No |

We only provide security patches for the latest version on the `main` branch.

---

## 🛡️ Reporting a Vulnerability

We take security seriously at EmPay HRMS. If you discover a security vulnerability, **please do NOT open a public GitHub issue.**

Instead, report it privately via email:

📧 **rushikesh.g.bobade@gmail.com**

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

| Action | Timeframe |
|--------|-----------|
| Acknowledgment of report | Within **48 hours** |
| Initial assessment | Within **5 business days** |
| Fix released | Depends on severity |

### What to Expect

1. We will acknowledge your report within 48 hours
2. We will investigate and assess the severity
3. We will work on a fix and coordinate disclosure
4. You will be credited in the security advisory (unless you prefer anonymity)

---

## ⚠️ Security Best Practices for Contributors

- Never commit `.env` files, API keys, or secrets
- Always use parameterized queries (never string concatenation for SQL)
- Validate and sanitize all user inputs
- Keep dependencies up to date
- Use `bcrypt` for password hashing (already configured)
- JWT tokens expire after the configured duration

---

Thank you for helping keep EmPay HRMS secure! 🙏
