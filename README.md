# 🏁 RaceIQ

**RaceIQ** is a simple and intuitive tool for tracking Formula 1 race stats and performance (post-race).  
It gathers race data and shows key info like lap times, driver positions, pit stops, and sector performance — with a few surprises. 😉

## [![codecov](https://codecov.io/gh/Race1Q/RaceIQ/graph/badge.svg?token=0B9G4DM0W3)](https://codecov.io/gh/Race1Q/RaceIQ)

## ⚙️ Tech Stack ⚙️

### Frontend:

- **React + TypeScript + Vite**
- Hot Module Reloading (HMR)
- ESLint support with customizable linting rules

### Backend:

- **NestJS** (Progressive Node.js framework)
- TypeScript-based, scalable and efficient server-side architecture

---

## 📦 Project Setup

```bash
npm install

🚀 Running the Project
bash
Copy
Edit
# Frontend (Vite)
npm run dev

# Backend (NestJS)
npm run start          # Development
npm run start:dev      # Watch mode
npm run start:prod     # Production

✅ Testing
bash
Copy
Edit
# Unit tests
npm run test

# End-to-end (e2e) tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📘 API Documentation

Interactive Swagger UI:
Local: `http://localhost:3000/docs`
Deployed: `https://raceiq-api.azurewebsites.net/docs`

Raw OpenAPI JSON: `http://localhost:3000/docs-json`

### Public Endpoints (no auth required)

These GET endpoints are publicly accessible:

- `GET /api/races` – list races (supports `season`, `season_id`, `year`)
- `GET /api/races/years` – list available seasons/years
- `GET /api/drivers` – list drivers
- `GET /api/standings/2025/drivers` – **NEW!** Get current 2025 driver standings (suitable for embedding on external sites)
- `GET /api/standings/featured-driver` – Get featured driver information
- `GET /api/tire-stints` – Get tire stint data

All other endpoints require a valid `Authorization: Bearer <token>` header.

For detailed documentation on public endpoints, see [PUBLIC_API.md](PUBLIC_API.md) and [PUBLIC_API_TESTING.md](PUBLIC_API_TESTING.md).

### Standard Error Response

All errors are normalized to a consistent shape:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "details": [{ "message": "season must be a 4-digit year" }]
}
```

Fields:

- `statusCode` – HTTP status
- `error` – standard error phrase
- `message` – human readable summary
- `code` (optional) – app/database specific code
- `details` (optional) – validation or contextual info
