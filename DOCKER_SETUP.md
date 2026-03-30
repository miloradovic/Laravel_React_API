# Docker Setup Guide - Travel Insurance Quotation System

## Prerequisites

- Docker and Docker Compose installed
- Git (to clone/download the project)

## Quick Start

1. **Start the entire system:**
```bash
docker compose up --build -d
```

2. **Wait for both services to be ready:**
   - Backend (Laravel): http://localhost:8000
   - Frontend (React): http://localhost:3000

3. **Setup the database (first time only):**
```bash
# In a new terminal window
docker compose exec backend php artisan key:generate --force
docker compose exec backend php artisan jwt:secret --force
docker compose exec backend php artisan migrate --force
docker compose exec backend php artisan db:seed --force
```

4. **Access the application:**
   - Open http://localhost:3000 in your browser
   - Use demo credentials: `test@example.com` / `password`

## Services Overview

### Backend (Laravel 13 + PHP 8.4)
- **Port:** 8000
- **Database:** SQLite (file-based)
- **Authentication:** JWT tokens
- **API Endpoints:**
  - `POST /api/auth/login` - Authentication
  - `POST /api/quotation` - Calculate quotes
  - `GET /api/health` - Health check

### Frontend (React 19.2 + Vite)
- **Port:** 3000
- **Build Tool:** Vite
- **Features:**
  - Login form with validation
  - Quotation form with multi-age support
  - Results display with breakdown
  - Error handling

## Development Commands

### Backend Commands
```bash
# Access backend container
docker compose exec backend sh

# Run migrations
docker compose exec backend php artisan migrate --force

# Seed database
docker compose exec backend php artisan db:seed --force

# Generate JWT secret
docker compose exec backend php artisan jwt:secret --force

# Run tests
docker compose exec backend php artisan test

# Clear cache
docker compose exec backend php artisan optimize:clear
```

### Frontend Commands
```bash
# Access frontend container
docker compose exec frontend sh

# Install dependencies
docker compose exec frontend npm install

# Run development server
docker compose exec frontend npm run dev -- --host 0.0.0.0 --port 3000

# Build for production
docker compose exec frontend npm run build
```

## API Testing

### 1. Health Check
```bash
curl http://localhost:8000/api/health
```

### 2. Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### 3. Get Quotation
```bash
# Replace YOUR_JWT_TOKEN with actual token from login
curl -X POST http://localhost:8000/api/quotation \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "age": "28,35",
    "currency_id": "EUR",
    "start_date": "2024-12-01",
    "end_date": "2024-12-15"
  }'
```

## Testing the System

### Complete User Flow Test

1. **Start the system:**
```bash
docker compose up --build -d
```

2. **Setup database:**
```bash
docker compose exec backend php artisan migrate --force
docker compose exec backend php artisan db:seed --force
```

3. **Open browser:** Navigate to http://localhost:3000

4. **Test login:**
   - Email: `test@example.com`
   - Password: `password`

5. **Test quotation:**
   - Ages: `28,35` (or any ages 18-70)
   - Currency: Select EUR, GBP, or USD
   - Start Date: Any future date
   - End Date: Any date after start date

6. **Verify results:**
   - Should show total premium
   - Breakdown by age
   - Trip details
   - Calculation explanation

## Business Logic Verification

### Sample Calculation
- **Ages:** 28, 35
- **Trip:** 30 days (e.g., 2024-12-01 to 2024-12-30)
- **Expected Result:**
  - Age 28 (load 0.6): 3 × 0.6 × 30 = 54.00
  - Age 35 (load 0.7): 3 × 0.7 × 30 = 63.00
  - **Total:** 117.00

### Age Load Table
- 18-30: 0.6
- 31-40: 0.7
- 41-50: 0.8
- 51-60: 0.9
- 61-70: 1.0

## Troubleshooting

### Common Issues

1. **Port conflicts:**
```bash
# Check what's using the ports
docker ps --format "table {{.Names}}\t{{.Ports}}"

# Stop conflicting services or change ports in docker-compose.yml
```

2. **Database issues:**
```bash
# Reset database
docker compose exec backend rm -f database/database.sqlite
docker compose exec backend php artisan migrate --force
docker compose exec backend php artisan db:seed --force
```

3. **CORS issues:**
```bash
# Verify CORS configuration
docker compose exec backend cat config/cors.php
```

4. **JWT issues:**
```bash
# Regenerate JWT secret
docker compose exec backend php artisan jwt:secret --force
```

5. **Frontend build issues:**
```bash
# Rebuild frontend
docker compose down
docker compose up --build -d frontend
```

### View Logs
```bash
# All services
docker compose logs -f

# Backend only
docker compose logs -f backend

# Frontend only
docker compose logs -f frontend
```

## System Architecture

```
┌─────────────────┐    HTTP     ┌─────────────────┐
│   React Frontend│◄───────────►│  Laravel Backend│
│   (Port 3000)   │             │   (Port 8000)   │
└─────────────────┘             └─────────────────┘
                                         │
                                         ▼
                                ┌─────────────────┐
                                │  SQLite Database│
                                │   (File-based)  │
                                └─────────────────┘
```

## Technology Stack

- **Backend:** Laravel 13, PHP 8.4, SQLite, JWT Auth
- **Frontend:** React 19.2, Vite, Axios
- **Infrastructure:** Docker, Docker Compose
- **Styling:** Custom CSS (no frameworks)

## Local Optimization Summary

- Dependency directories are persisted as named volumes to reduce install time on restart.
- Backend health checks gate frontend startup to reduce race conditions.
- SQLite initialization is handled directly by the backend container.

This setup provides a fast, containerized local development environment for the travel insurance quotation system.