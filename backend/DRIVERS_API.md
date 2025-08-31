# Drivers API Documentation

The Drivers API provides public access to Formula 1 driver information and statistics. All endpoints are RESTful and return JSON responses.

## Base URL
```
http://localhost:3000/api/drivers
```

## Endpoints

### 1. Get All Drivers
**GET** `/drivers`

Returns a list of all drivers with basic information.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "driver_number": 44,
      "first_name": "Lewis",
      "last_name": "Hamilton",
      "name_acronym": "HAM",
      "country_code": "GB",
      "date_of_birth": "1985-01-07",
      "full_name": "Lewis Hamilton"
    }
  ],
  "total": 20
}
```

### 2. Get Driver by ID
**GET** `/drivers/{id}`

Returns detailed information for a specific driver.

**Parameters:**
- `id` (number, required): Driver ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "driver_number": 44,
    "first_name": "Lewis",
    "last_name": "Hamilton",
    "name_acronym": "HAM",
    "country_code": "GB",
    "date_of_birth": "1985-01-07",
    "full_name": "Lewis Hamilton",
    "team_name": "Mercedes",
    "nationality": "British",
    "car_number": 44
  }
}
```

### 3. Get Driver Statistics
**GET** `/drivers/{id}/stats`

Returns comprehensive statistics for a specific driver including career totals and current season performance.

**Parameters:**
- `id` (number, required): Driver ID

**Response:**
```json
{
  "success": true,
  "data": {
    "total_points": 4639.5,
    "total_wins": 103,
    "total_podiums": 197,
    "total_fastest_laps": 64,
    "total_races": 332,
    "total_poles": 104,
    "current_position": 3,
    "current_season_points": 234,
    "current_season_wins": 0,
    "current_season_podiums": 6
  }
}
```

### 4. Search Drivers
**GET** `/drivers/search?q={query}`

Search drivers by name or acronym.

**Parameters:**
- `q` (string, required): Search query

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "driver_number": 44,
      "first_name": "Lewis",
      "last_name": "Hamilton",
      "name_acronym": "HAM",
      "country_code": "GB",
      "date_of_birth": "1985-01-07",
      "full_name": "Lewis Hamilton"
    }
  ],
  "total": 1
}
```

## Error Responses

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Driver with id 999 not found",
  "error": "Not Found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Failed to fetch drivers",
  "error": "Internal Server Error"
}
```

## Authentication

All public endpoints listed above do **not** require authentication. They are freely accessible to anyone.

For authenticated endpoints (admin functions), see the legacy endpoints below:

### Legacy Authenticated Endpoints

- `GET /drivers/auth/all` - Get all drivers (requires `read:drivers` scope)
- `GET /drivers/auth/search?q={query}` - Search drivers (requires `read:drivers` scope)
- `POST /drivers/ingest` - Ingest drivers data (requires `write:drivers` scope)

## Testing

You can test the API using the provided test script:

```bash
cd backend
node test-drivers-api.js
```

## Swagger Documentation

Interactive API documentation is available at:
```
http://localhost:3000/api/docs
```

## Data Sources

The driver statistics are calculated from the following database tables:
- `drivers` - Basic driver information
- `race_results` - Race results and points
- `qualifying_results` - Qualifying positions and pole positions
- `driver_standings` - Current championship positions

## Notes

- All endpoints return data in a consistent format with `success` and `data` fields
- Driver statistics are calculated in real-time from the database
- The `full_name` field is computed as `first_name + " " + last_name`
- Current season statistics are based on the current year
- Fastest lap statistics are not yet implemented (returns 0)
