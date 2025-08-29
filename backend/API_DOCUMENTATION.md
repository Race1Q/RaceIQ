# RaceIQ API Documentation

## Overview

RaceIQ provides a comprehensive Formula 1 racing data API. The **Driver Standings API** is publicly accessible and requires no authentication.

## Base URL

```
http://localhost:3000/api
```

## Driver Standings API

### Get All Driver Standings

Retrieve all driver standings with optional pagination.

**Endpoint:** `GET /driver-standings`

**Query Parameters:**
- `limit` (optional): Number of records to return (default: 100, max: 1000)
- `offset` (optional): Number of records to skip (default: 0)

**Example Request:**
```bash
curl "http://localhost:3000/api/driver-standings?limit=50&offset=0"
```

**Example Response:**
```json
[
  {
    "id": 1,
    "race_id": 1,
    "driver_id": 1,
    "position": 1,
    "points": 25,
    "wins": 1,
    "season": 2023
  }
]
```

### Get Driver Standings by Race

Retrieve driver standings for a specific race.

**Endpoint:** `GET /driver-standings/race/{raceId}`

**Path Parameters:**
- `raceId` (required): The ID of the race

**Example Request:**
```bash
curl "http://localhost:3000/api/driver-standings/race/1"
```

### Get Driver Standings by Driver

Retrieve all standings for a specific driver across all races.

**Endpoint:** `GET /driver-standings/driver/{driverId}`

**Path Parameters:**
- `driverId` (required): The ID of the driver

**Example Request:**
```bash
curl "http://localhost:3000/api/driver-standings/driver/1"
```

### Get Driver Standings by Season

Retrieve driver standings for a specific season.

**Endpoint:** `GET /driver-standings/season/{season}`

**Path Parameters:**
- `season` (required): The season year (e.g., 2023)

**Example Request:**
```bash
curl "http://localhost:3000/api/driver-standings/season/2023"
```

### Get Current Driver Standings

Retrieve the current season's driver standings.

**Endpoint:** `GET /driver-standings/current`

**Example Request:**
```bash
curl "http://localhost:3000/api/driver-standings/current"
```

### Search Driver Standings

Search driver standings by query.

**Endpoint:** `GET /driver-standings/search`

**Query Parameters:**
- `q` (required): Search query
- `limit` (optional): Number of records to return (default: 50, max: 200)

**Example Request:**
```bash
curl "http://localhost:3000/api/driver-standings/search?q=2023&limit=20"
```

### Test Connection

Test the database connection.

**Endpoint:** `GET /driver-standings/test-connection`

**Example Request:**
```bash
curl "http://localhost:3000/api/driver-standings/test-connection"
```

**Example Response:**
```json
{
  "success": true,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Error Responses

The API returns standard HTTP status codes:

- `200 OK`: Request successful
- `400 Bad Request`: Invalid parameters
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

**Error Response Format:**
```json
{
  "statusCode": 400,
  "message": "Invalid race ID",
  "error": "Bad Request"
}
```

## Rate Limiting

Currently, there are no rate limits applied to the public API endpoints. However, we reserve the right to implement rate limiting in the future to ensure fair usage.

## CORS

The API supports CORS for the following origins:
- `http://localhost:5173`
- `https://purple-sand-0300d7203.2.azurestaticapps.net`

## API Documentation

Interactive API documentation is available at:
```
http://localhost:3000/api/docs
```

## Data Schema

### DriverStanding Entity

```typescript
interface DriverStanding {
  id: number;
  race_id: number;
  driver_id: number;
  position: number;
  points: number;
  wins: number;
  season: number;
  // Additional fields may be present
}
```

## Usage Examples

### JavaScript/Node.js

```javascript
const response = await fetch('http://localhost:3000/api/driver-standings/season/2023');
const standings = await response.json();
console.log(standings);
```

### Python

```python
import requests

response = requests.get('http://localhost:3000/api/driver-standings/season/2023')
standings = response.json()
print(standings)
```

### cURL

```bash
# Get current season standings
curl "http://localhost:3000/api/driver-standings/current"

# Get standings for a specific race
curl "http://localhost:3000/api/driver-standings/race/1"

# Search standings
curl "http://localhost:3000/api/driver-standings/search?q=2023"
```

## Support

For questions or support regarding the API, please refer to the interactive documentation at `/api/docs` or contact the development team.

## Version History

- **v1.0**: Initial release with driver standings endpoints
