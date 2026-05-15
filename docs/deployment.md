# Deployment

Deploy Loreweaver on a VPS using Docker Compose and Caddy.

---

# Prerequisites

- A VPS with at least 2 CPU cores, 4 GB RAM, and 20 GB SSD
- Docker + Docker Compose installed
- A domain name pointed at your server IP
- Caddy or another reverse proxy
- An OpenAI API key

---

# Architecture

```
User -> Caddy (HTTPS: 443)
         |
         +-- /api/*  --> api:3001
         +-- *        --> web:5173
         |
    +----+----+
    |         |
  Postgres   Qdrant
  (5432)     (6333)
```

All services run as Docker containers. Caddy handles TLS automatically.

---

# Step-by-Step

## 1. Clone and configure

```bash
git clone <repo-url> loreweaver
cd loreweaver
cp .env.production.example .env
```

Edit `.env`:
- Set `POSTGRES_PASSWORD` to a strong password
- Set `OPENAI_API_KEY`
- Set `DATABASE_URL` to match the password
- Optionally change `CHAT_MODEL` (default: `gpt-4o-mini`)

## 2. Build and start

```bash
docker compose up -d --build
```

Wait for healthchecks to pass:

```bash
docker compose ps
```

## 3. Set up Caddy

Install Caddy:
```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install caddy
```

Copy the provided Caddyfile:
```bash
sudo cp infra/caddy/Caddyfile /etc/caddy/Caddyfile
# Replace loreweaver.example.com with your domain
sudo sed -i 's/loreweaver.example.com/yourdomain.com/g' /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Caddy automatically provisions Let's Encrypt certificates.

## 4. Verify

```bash
# API health
curl -s https://yourdomain.com/api/health
# Expected: {"status":"ok"}

# Frontend
curl -s -o /dev/null -w "%{http_code}" https://yourdomain.com
# Expected: 200
```

---

# Service Ports

| Service | Internal Port | External Access | Notes |
|---|---|---|---|
| web | 5173 | Via Caddy (443) | React SPA |
| api | 3001 | Via Caddy /api/* | Fastify API |
| postgres | 5432 | Localhost only | Do not expose externally |
| qdrant | 6333 | Localhost only | Do not expose externally |

In production, only Caddy (port 443) should be publicly accessible.

---

# Persistent Volumes

```yaml
volumes:
  postgres_data:
    driver: local
  qdrant_storage:
    driver: local
```

Data survives container restarts. For additional durability:

```bash
# Backup Postgres
docker exec loreweaver_postgres pg_dump -U loreweaver loreweaver > backup.sql

# Backup Qdrant (copy storage volume)
docker run --rm -v loreweaver_qdrant_storage:/source -v $(pwd):/dest alpine cp -a /source /dest/qdrant_backup
```

---

# Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| `502 Bad Gateway` | API not healthy | `docker logs loreweaver_api` |
| `connection refused` to Postgres | Wrong `DATABASE_URL` host | Use `postgres` hostname in containers, `localhost` on host |
| Caddy won't start | Port 80/443 in use | `sudo lsof -i :80` and free the port |
| SSL not working | DNS not propagated | Verify A record, wait for TTL |
| Chat returns 500 | Missing `OPENAI_API_KEY` | Check `.env` and restart `api` container |
| Slow responses | Insufficient RAM | Upgrade to 4GB+ RAM; Qdrant + Postgres need headroom |

---

# Production Checklist

- [ ] `.env` configured with strong `POSTGRES_PASSWORD`
- [ ] `OPENAI_API_KEY` set and funded
- [ ] Domain DNS A record points to server IP
- [ ] Caddy running with TLS auto-provisioned
- [ ] Only ports 22 (SSH), 80 (HTTP redirect), 443 (HTTPS) open in firewall
- [ ] Postgres and Qdrant ports not exposed externally
- [ ] Persistent volumes mounted and backed up
- [ ] API health endpoint returns `{"status":"ok"}`
- [ ] Frontend loads without console errors
- [ ] Demo flow completes end-to-end (see `docs/demo-script.md`)
