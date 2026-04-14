---
inclusion: auto
---

# Security Standards

- Validate and sanitize ALL input at API boundary.
- Parameterized queries only. Never string concatenation for SQL.
- JWT with short expiry. OTP-based login.
- Rate limiting on all sensitive endpoints.
- CORS restricted to known domains only.
- HTTPS everywhere in production.
- Never log sensitive data (passwords, tokens, PII).
- Never commit secrets to Git.
