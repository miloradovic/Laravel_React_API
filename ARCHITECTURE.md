# Travel Insurance Quotation System - Architecture

## Overview

This project is a two-service application:

- Backend API: Laravel 13 (PHP 8.4) with JWT authentication
- Frontend SPA: React 19 + TypeScript + Vite

Users log in, submit trip details, and receive a quotation with per-traveler breakdown.

## High-Level Flow

1. User logs in from the frontend.
2. Backend returns a JWT token.
3. Frontend sends quotation requests with the token.
4. Backend validates input, calculates pricing, and returns results.

## Backend Architecture

### API Endpoints (Current)

- `POST /api/auth/login` (public)
- `POST /api/quotation` (JWT required, rate-limited to 3 requests/minute per user)
- `GET /api/quotation/currencies` (JWT required)
- `GET /api/health` (public)

### Core Components

- `AuthController`: validates credentials and issues JWT tokens.
- `QuotationController`: handles quotation and currency endpoints.
- `QuotationRequest`: validates age list, currency code, and dates.
- `PricingService`: performs quotation calculations using active pricing config.
- Resources (`QuotationResource`, `CurrenciesResource`): shape API responses.

### Pricing Data Model

Pricing is DB-backed and versioned:

- `pricing_configs`
  - `version`
  - `rate` (base daily rate)
  - `is_active`
- `age_load_brackets`
  - bracket ranges (`min_age`, `max_age`)
  - `load_factor`
  - linked to a pricing config

The active config is cached for performance.

### Calculation Rule

Per traveler subtotal:

`subtotal = rate x age_load x trip_length_days`

Total quotation:

`total = sum(subtotal for each traveler age)`

Trip length is inclusive of start and end dates.

## Frontend Architecture

### Router and Screens

- `/login`: login page
- `/quotation`: protected quotation page
- protected routes enforce auth before access

### Key Frontend Layers

- `features/auth`: login flow
- `features/quotation`: quotation UI/types/validation
- `services/*`: API access (`authService`, `quotationService`, `healthService`)
- `hooks/*`: shared request/query behavior

### State and Data Access

- Axios-based API client
- JWT token stored client-side for authenticated requests
- React Query for async data/mutation patterns

## Security and Validation

- JWT middleware protects quotation endpoints.
- Quotation creation is rate-limited to 3 requests per minute per authenticated user.
- Server-side validation enforces:
  - ages format and allowed ranges
  - supported currency (`EUR`, `GBP`, `USD` from DB)
  - date format and chronology
- Frontend validation improves UX but backend is authoritative.

## Deployment/Runtime Model (Local)

- Docker Compose runs backend and frontend containers.
- Backend healthcheck gates frontend startup.
- SQLite is used for local persistence.

## Current Project Structure (Simplified)

```
Laravel_React_API/
|- backend/
|  |- app/
|  |  |- Http/Controllers/
|  |  |- Http/Requests/
|  |  |- Http/Resources/
|  |  |- Models/
|  |  |- Services/
|  |- database/migrations/
|  |- database/seeders/
|  |- routes/api.php
|- frontend/
|  |- src/app/
|  |- src/features/auth/
|  |- src/features/quotation/
|  |- src/services/
|  |- src/hooks/
|- docker-compose.yml
```

This architecture keeps business logic in the backend service layer and keeps the frontend focused on UX, validation feedback, and API orchestration.