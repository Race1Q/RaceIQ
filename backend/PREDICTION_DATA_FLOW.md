# Prediction Endpoint Data Flow

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Client Application                              │
│                    GET /api/predictions/:raceId                         │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    PredictionsController                                │
│  • Validates raceId parameter                                           │
│  • Routes to service layer                                              │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    PredictionsService.getPredictionsByRaceId()          │
│                                                                           │
│  STEP 1: Find Race                                                       │
│  ├─ Query: races table                                                  │
│  └─ Validates: Race exists                                              │
│                                                                           │
│  STEP 2: Find Race Session                                              │
│  ├─ Query: sessions table WHERE type='Race'                             │
│  └─ Validates: Session exists                                           │
│                                                                           │
│  STEP 3: Get All Drivers in Race                                        │
│  ├─ Query: race_results table                                           │
│  └─ Returns: List of drivers with their constructors                    │
│                                                                           │
│  STEP 4: Find Previous Sessions (for standings calculation)             │
│  ├─ Query: sessions + races WHERE season matches AND round < current    │
│  └─ Returns: Array of session IDs                                       │
│                                                                           │
│  STEP 5: Calculate Features for Each Driver (Parallel Processing)       │
│  ├─ Feature 1: driver_standings_position_before_race                    │
│  │   └─ SUM points from previous sessions, rank all drivers             │
│  ├─ Feature 2: driver_points_before_race                                │
│  │   └─ SUM driver points from previous sessions                        │
│  ├─ Feature 3: constructor_standings_position_before_race               │
│  │   └─ SUM constructor points from previous sessions, rank all teams   │
│  ├─ Feature 4: constructor_points_before_race                           │
│  │   └─ SUM constructor points from previous sessions                   │
│  ├─ Feature 5: driver_age                                               │
│  │   └─ (race_date - driver_date_of_birth) / 365.25                    │
│  ├─ Feature 6: avg_points_last_5_races                                  │
│  │   └─ Query last 5 races for driver, calculate AVG points             │
│  ├─ Feature 7: avg_finish_pos_at_circuit                                │
│  │   └─ Query all historical races at circuit, calculate AVG position   │
│  └─ Feature 8: avg_constructor_points_last_5_races                      │
│      └─ Query last 5 races, SUM points per race, calculate AVG          │
│                                                                           │
│  STEP 6: Format Data for Python                                         │
│  └─ Create JSON array with driver_id + 8 features for each driver       │
│                                                                           │
│  STEP 7: Execute Python Script                                          │
│  ├─ Script: run_prediction.py                                           │
│  ├─ Input: JSON string of all drivers with features                     │
│  └─ Python: venv/bin/python3                                            │
│                                                                           │
│  STEP 8: Parse Python Results                                           │
│  └─ Extract predictions with podium_probability for each driver         │
│                                                                           │
│  STEP 9: Enrich Results                                                 │
│  └─ Add driver names and constructor names to predictions               │
│                                                                           │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    Python ML Script (run_prediction.py)                 │
│                                                                           │
│  1. Load trained model: f1_podium_model.pkl                             │
│  2. Parse JSON input from Node.js                                       │
│  3. Create pandas DataFrame with features in correct order              │
│  4. Run model.predict_proba() for all drivers                           │
│  5. Sort results by probability (descending)                            │
│  6. Return JSON with predictions                                        │
│                                                                           │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Response to Client                              │
│  {                                                                       │
│    "raceId": 1234,                                                      │
│    "raceName": "Monaco Grand Prix",                                     │
│    "predictions": [                                                     │
│      {                                                                  │
│        "driverId": 1,                                                   │
│        "driverName": "Max Verstappen",                                  │
│        "constructorName": "Red Bull Racing",                            │
│        "podiumProbability": 0.8542                                      │
│      },                                                                 │
│      ...                                                                │
│    ]                                                                    │
│  }                                                                      │
└─────────────────────────────────────────────────────────────────────────┘
```

## Database Queries Summary

### Query 1: Find Race
```sql
SELECT * FROM races 
WHERE id = :raceId
```

### Query 2: Find Race Session
```sql
SELECT * FROM sessions 
WHERE race_id = :raceId AND type = 'Race'
```

### Query 3: Get Race Results
```sql
SELECT * FROM race_results 
WHERE session_id = :sessionId
```

### Query 4: Get Previous Sessions
```sql
SELECT s.id FROM sessions s
INNER JOIN races r ON s.race_id = r.id
WHERE r.season_id = :seasonId 
  AND r.round < :currentRound
  AND s.type = 'Race'
```

### Query 5a: Driver Standings Points
```sql
SELECT SUM(points) as total_points
FROM race_results
WHERE driver_id = :driverId 
  AND session_id IN (:...previousSessionIds)
```

### Query 5b: All Driver Standings (for ranking)
```sql
SELECT driver_id, SUM(points) as total_points
FROM race_results
WHERE session_id IN (:...previousSessionIds)
GROUP BY driver_id
ORDER BY total_points DESC
```

### Query 6a: Constructor Standings Points
```sql
SELECT SUM(points) as total_points
FROM race_results
WHERE constructor_id = :constructorId 
  AND session_id IN (:...previousSessionIds)
```

### Query 6b: All Constructor Standings (for ranking)
```sql
SELECT constructor_id, SUM(points) as total_points
FROM race_results
WHERE session_id IN (:...previousSessionIds)
GROUP BY constructor_id
ORDER BY total_points DESC
```

### Query 7: Driver Last 5 Races
```sql
SELECT rr.points
FROM race_results rr
INNER JOIN sessions s ON rr.session_id = s.id
INNER JOIN races r ON s.race_id = r.id
WHERE rr.driver_id = :driverId
  AND r.season_id = :seasonId
  AND r.round < :currentRound
  AND s.type = 'Race'
ORDER BY r.round DESC
LIMIT 5
```

### Query 8: Driver Circuit History
```sql
SELECT rr.position
FROM race_results rr
INNER JOIN sessions s ON rr.session_id = s.id
INNER JOIN races r ON s.race_id = r.id
WHERE rr.driver_id = :driverId
  AND r.circuit_id = :circuitId
  AND r.id < :currentRaceId
  AND s.type = 'Race'
  AND rr.position IS NOT NULL
```

### Query 9: Constructor Last 5 Races
```sql
SELECT r.round, SUM(rr.points) as total_points
FROM race_results rr
INNER JOIN sessions s ON rr.session_id = s.id
INNER JOIN races r ON s.race_id = r.id
WHERE rr.constructor_id = :constructorId
  AND r.season_id = :seasonId
  AND r.round < :currentRound
  AND s.type = 'Race'
GROUP BY r.round
ORDER BY r.round DESC
LIMIT 5
```

## Performance Considerations

### Database Queries
- **Total queries per request**: ~15 + (9 × number_of_drivers)
- **For 20 drivers**: ~195 queries
- **Optimization opportunities**:
  1. ✅ Parallel processing with Promise.all() (implemented)
  2. 🔄 Add database indexes on frequently queried columns
  3. 🔄 Consider materializing standings in a view
  4. 🔄 Cache predictions for completed races

### Python Script
- **Execution time**: ~200-500ms for 20 drivers
- **Bottleneck**: Model loading (done once per request)
- **Optimization**: Keep Python process running and use IPC

### Total Response Time
- Expected: 2-5 seconds for 20 drivers
- Dominated by: Database feature calculation
- Cacheable: Yes (predictions for past races never change)
