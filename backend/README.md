# RaceIQ Driver Standings Export API

A Node.js + Express.js service for exporting F1 driver standings from Supabase PostgreSQL database.

## Features

- 🚀 **RESTful API** for driver standings
- 📊 **JSON and CSV export** formats
- 🔒 **Security-first** with Helmet, CORS, and API key authentication
- 📈 **Pagination and sorting** support
- 🧪 **Comprehensive testing** with Jest and Supertest
- ☁️ **Azure deployment ready**

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase)
- npm or yarn

### Installation

```bash
cd backend/standings-api
npm install
```

### Environment Setup

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Configure your environment variables:
```bash
# Database
DATABASE_URL=postgresql://username:password@host:5432/database

# Server
PORT=3001
NODE_ENV=development

# Security (optional)
API_KEY=your-secure-api-key
CORS_ORIGIN=http://localhost:5173,https://your-frontend-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Database Schema

Ensure your Supabase database has these tables:

```sql
-- Drivers
CREATE TABLE drivers (
  id bigint PRIMARY KEY,
  driver_number integer,
  first_name text,
  last_name text,
  name_acronym varchar,
  country_code varchar,
  date_of_birth varchar
);

-- Seasons
CREATE TABLE seasons (
  id bigint PRIMARY KEY,
  year integer UNIQUE NOT NULL
);

-- Races
CREATE TABLE races (
  id bigint PRIMARY KEY,
  season_id integer REFERENCES seasons(id),
  round integer,
  name text NOT NULL,
  date date,
  time time
);

-- Driver standings (aggregated per race)
CREATE TABLE driver_standings (
  id bigint PRIMARY KEY,
  race_id bigint REFERENCES races(id),
  driver_id bigint REFERENCES drivers(id),
  points numeric,
  position integer,
  season varchar,
  wins bigint
);
```

### Running the Server

```bash
# Development mode
npm run dev

# Production mode
npm start

# Run tests
npm test
```

The server will start on `http://localhost:3001`

## API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication
- **API Key** (optional): Set `x-api-key` header if `API_KEY` is configured
- **CORS**: Configured for allowed origins

### Endpoints

#### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T12:00:00Z",
  "service": "raceiq-standings-api",
  "version": "1.0.0"
}
```

#### Get Driver Standings (JSON)
```http
GET /api/standings/drivers?season=2025&page=1&limit=20&sort=points&dir=desc
```

**Query Parameters:**
- `season` (optional): Season year (defaults to latest)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `sort` (optional): Sort field - `points`, `wins`, `position` (default: points)
- `dir` (optional): Sort direction - `asc`, `desc` (default: desc)
- `format` (optional): Response format - `json`, `csv` (default: json)

**Response:**
```json
{
  "season": 2025,
  "page": 1,
  "limit": 20,
  "totalItems": 22,
  "totalPages": 2,
  "data": [
    {
      "driver_id": 1,
      "driver": "Max Verstappen",
      "name_acronym": "VER",
      "driver_number": 1,
      "points": 255,
      "position": 1,
      "wins": 6
    }
  ]
}
```

#### Export Driver Standings (CSV)
```http
GET /api/standings/drivers/export?season=2025
```

**Response:** CSV file download with headers:
```
position,driver,name_acronym,driver_number,points,wins
1,Max Verstappen,VER,1,255,6
2,Lewis Hamilton,HAM,44,220,4
```

### Example Requests

```bash
# Get current season standings
curl "http://localhost:3001/api/standings/drivers"

# Get specific season with pagination
curl "http://localhost:3001/api/standings/drivers?season=2024&page=1&limit=10"

# Sort by wins ascending
curl "http://localhost:3001/api/standings/drivers?sort=wins&dir=asc"

# Export as CSV
curl "http://localhost:3001/api/standings/drivers?format=csv" -o standings.csv

# Full export
curl "http://localhost:3001/api/standings/drivers/export?season=2025" -o full-standings.csv

# With API key
curl -H "x-api-key: your-api-key" "http://localhost:3001/api/standings/drivers"
```

## Development

### Project Structure

```
backend/standings-api/
├── index.js                 # Main server file
├── standings.routes.js      # API routes
├── db.js                    # Database connection
├── csv.js                   # CSV generation utility
├── package.json            # Dependencies
├── .env.example            # Environment template
├── jest.config.js          # Test configuration
├── __tests__/              # Test files
│   └── standings.test.js
└── README.md               # This file
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:cov
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

## Deployment

### Local Development
```bash
npm run dev
```

### Production Build
```bash
npm start
```

### Azure App Service Deployment

1. **Create App Service:**
```bash
az webapp create \
  --resource-group your-resource-group \
  --plan your-app-service-plan \
  --name raceiq-standings-api \
  --runtime "NODE:18-lts"
```

2. **Configure Environment Variables:**
```bash
az webapp config appsettings set \
  --resource-group your-resource-group \
  --name raceiq-standings-api \
  --settings \
    DATABASE_URL="your-supabase-connection-string" \
    NODE_ENV="production" \
    API_KEY="your-secure-api-key" \
    CORS_ORIGIN="https://your-frontend-domain.com" \
    PORT=8080
```

3. **Deploy:**
```bash
az webapp up \
  --resource-group your-resource-group \
  --name raceiq-standings-api \
  --src-path ./backend/standings-api
```

4. **Health Check Configuration:**
   - Health check endpoint: `/health`
   - Path mapping: `/`

### Docker Deployment (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## Security

### Features Implemented
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing control
- **Rate Limiting**: Request throttling
- **Input Validation**: Parameter sanitization
- **SQL Injection Protection**: Parameterized queries
- **API Key Authentication**: Optional authentication

### Best Practices
- Environment variables for secrets
- No hardcoded credentials
- Input validation and sanitization
- Error handling without information leakage
- HTTPS in production

## Monitoring

### Health Checks
- Endpoint: `GET /health`
- Returns service status and timestamp
- Use for load balancer health probes

### Logging
- Morgan middleware for HTTP request logging
- Structured logging with timestamps
- Error logging with stack traces in development

### Performance
- Database connection pooling
- Query result caching headers (1 hour for standings)
- Rate limiting to prevent abuse
- Pagination to limit response sizes

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check `DATABASE_URL` format
   - Verify Supabase connection string
   - Ensure SSL settings are correct

2. **API Key Authentication Failed**
   - Verify `API_KEY` environment variable
   - Check `x-api-key` header format

3. **CORS Errors**
   - Add your domain to `CORS_ORIGIN`
   - Check for trailing commas in origin list

4. **Rate Limiting**
   - Adjust `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX_REQUESTS`
   - Check client request frequency

### Debug Mode

Set `NODE_ENV=development` for:
- Detailed error messages
- Request logging
- Stack traces in responses

## Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Check the troubleshooting section
- Review the API documentation
- Create an issue in the repository