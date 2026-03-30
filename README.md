# Travel Insurance Quotation System

Pick your travel dates, add travelers, get a price. That's it — no forms to fill for ten minutes, no mystery fees.

This is a full-stack app built with a **Laravel 13 REST API** and a **React 19** frontend. You log in, submit a trip, and instantly get a breakdown of what insurance would cost for each traveler based on their age and the trip length.

> Built as a coding challenge. Not for sale, not for production — just genuinely fun to run locally.

## How it works

1. Log in with your credentials — the API hands back a JWT token.
2. Send a quotation request with traveler ages, trip dates, and your preferred currency.
3. Get back a per-traveler price breakdown, calculated from a simple age-load formula.

The price logic is transparent: `price = 3 per day × age multiplier`. Younger travelers pay less. No black box.

| Age range | Multiplier |
|-----------|------------|
| 18–30     | 0.6        |
| 31–40     | 0.7        |
| 41–50     | 0.8        |
| 51–60     | 0.9        |
| 61–70     | 1.0        |

**Example:** Two travelers (28 and 35 years old) on a 30-day trip → `(3×0.6×30) + (3×0.7×30) = 117.00 EUR`

---

## Running it locally

You need **Docker Desktop**. That's the only dependency.

```bash
# Windows
setup.bat

# macOS / Linux / WSL
chmod +x setup.sh && ./setup.sh
```

The script builds the containers, generates all keys, and runs migrations. Once it's done:

| Service      | URL                          |
|--------------|------------------------------|
| Frontend     | http://localhost:3000        |
| Backend API  | http://localhost:8000/api    |

**Test credentials:** `test@example.com` / `password`

---

## Stack

| Layer       | Technology                              |
|-------------|-----------------------------------------|
| Backend     | Laravel 13, PHP 8.4, SQLite, JWT auth   |
| Frontend    | React 19, Vite, Axios                   |
| Dev env     | Docker Compose, Alpine Linux containers |

---

## Going deeper

- [ARCHITECTURE.md](ARCHITECTURE.md) — how the pieces fit together
- [DOCKER_SETUP.md](DOCKER_SETUP.md) — manual container setup and override options
- [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) — decisions made and why