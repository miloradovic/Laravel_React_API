# Docker Setup Guide

## What This Runs

`docker compose` starts two containers:

- `backend`: Laravel API on `http://localhost:8000`
- `frontend`: React app on `http://localhost:3000`

The frontend waits for backend health before starting.

## Prerequisites

- Docker Desktop (or Docker Engine + Compose)

## Quick Start (Recommended)

Use the project setup script:

```bash
# Windows
setup.bat

# macOS / Linux / WSL
chmod +x setup.sh && ./setup.sh
```

The script will:

1. Build and start containers
2. Generate Laravel app key
3. Generate JWT secret
4. Run migrations
5. Seed pricing, currencies, and demo user
6. Clear Laravel caches

Demo login:

- Email: `test@example.com`
- Password: `password`

## Manual Setup

```bash
docker compose up --build -d
docker compose exec backend php artisan key:generate --force
docker compose exec backend php artisan jwt:secret --force
docker compose exec backend php artisan migrate --force
docker compose exec backend php artisan db:seed --force
docker compose exec backend php artisan optimize:clear
```

## Service URLs

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- API base: `http://localhost:8000/api`
- Health: `http://localhost:8000/api/health`

## API Smoke Test

### 1) Health

```bash
curl http://localhost:8000/api/health
```

### 2) Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### 3) Quotation (JWT required)

```bash
curl -X POST http://localhost:8000/api/quotation \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "age": "28,35",
    "currency_id": "EUR",
    "start_date": "2026-04-01",
    "end_date": "2026-04-10"
  }'
```

## Useful Commands

```bash
# Logs
docker compose logs -f

# Stop services
docker compose down

# Backend tests
docker compose exec backend php artisan test

# Frontend checks
docker compose exec frontend npm run check
```

## Notes

- Local database is SQLite inside the backend container (`database/database.sqlite`).
- Named volumes are used for dependencies to speed up rebuilds:
  - `backend_vendor`
  - `backend_bootstrap_cache`
  - `frontend_node_modules`

## Troubleshooting

### Port already in use

Stop conflicting services or update host ports in `docker-compose.yml`.

### Backend not ready

Check logs:

```bash
docker compose logs -f backend
```

### Rebuild cleanly

```bash
docker compose down
docker compose up --build -d
```