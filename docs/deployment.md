# deployment.md

# Deployment Philosophy

Prefer:
- VPS
- Docker Compose
- Caddy

Avoid:
- Kubernetes
- orchestration complexity
- unnecessary managed services

---

# Runtime

```bash
docker compose up -d
```

---

# Services

- frontend
- backend
- postgres
- qdrant
- reverse proxy

---

# Environment

Use:
- .env.example
- explicit secrets
- deterministic runtime configuration
