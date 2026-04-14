---
inclusion: auto
---

# Deployment Standards

- No localhost. Everything runs on cloud VM in production.
- Docker for containerization.
- Nginx as reverse proxy.
- Ports: 80/443 Nginx, 3000 frontend, 8080 backend, 5432 DB.
- SSL via Certbot / Let's Encrypt.
- Environment variables for all credentials.
- Deploy flow: push to GitHub → pull on VM → build → restart containers.
