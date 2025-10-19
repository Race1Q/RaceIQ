# Testing Guide for Prediction Endpoint

## Quick Start

### 1. Verify Python Environment

```bash
cd backend/src/ml-scripts

# Check if virtual environment exists
ls -la venv/

# Activate virtual environment
source venv/bin/activate

# Verify Python packages
pip list | grep -E "(pandas|scikit-learn|joblib)"

# Test the model features checker
python check_model_features.py
```

**Expected Output:**

```
--- F1 Model Diagnostic ---
Attempting to load model from: /path/to/f1_podium_model.pkl
[SUCCESS] Model loaded. Features the model was trained on:
  - driver_standings_position_before_race
  - driver_points_before_race
  - constructor_standings_position_before_race
  - constructor_points_before_race
  - driver_age
  - avg_points_last_5_races
  - avg_finish_pos_at_circuit
  - avg_constructor_points_last_5_races
```

### 2. Test Python Script Directly

```bash
cd backend/src/ml-scripts

# Create test input
cat > test_input.json << 'EOF'
[
  {
    "driver_id": 1,
    "driver_standings_position_before_race": 1,
    "driver_points_before_race": 350,
    "constructor_standings_position_before_race": 1,
    "constructor_points_before_race": 500,
    "driver_age": 27.5,
    "avg_points_last_5_races": 22.8,
    "avg_finish_pos_at_circuit": 4.5,
    "avg_constructor_points_last_5_races": 38.2
  },
  {
    "driver_id": 2,
    "driver_standings_position_before_race": 3,
    "driver_points_before_race": 180,
    "constructor_standings_position_before_race": 2,
    "constructor_points_before_race": 350,
    "driver_age": 25.3,
    "avg_points_last_5_races": 15.4,
    "avg_finish_pos_at_circuit": 6.2,
    "avg_constructor_points_last_5_races": 28.5
  }
]
EOF

# Run prediction script
python run_prediction.py "$(cat test_input.json)"
```

**Expected Output:**

```json
{
  "success": true,
  "predictions": [
    {
      "driver_id": 1,
      "podium_probability": 0.8542
    },
    {
      "driver_id": 2,
      "podium_probability": 0.4231
    }
  ]
}
```

### 3. Start Backend Server

```bash
cd backend
npm install
npm run start:dev
```

### 4. Find a Test Race ID

#### Option A: Use Database Query

```sql
SELECT
  r.id as race_id,
  r.name as race_name,
  r.round,
  s.year as season,
  COUNT(rr.id) as num_drivers
FROM races r
JOIN seasons s ON r.season_id = s.id
JOIN sessions ses ON ses.race_id = r.id AND ses.type = 'Race'
JOIN race_results rr ON rr.session_id = ses.id
WHERE s.year >= 2023  -- Recent races
GROUP BY r.id, r.name, r.round, s.year
HAVING COUNT(rr.id) >= 15  -- Ensure enough drivers
ORDER BY s.year DESC, r.round DESC
LIMIT 10;
```

#### Option B: Use API

```bash
# Get recent races
curl http://localhost:3000/api/races?year=2024 | jq '.[] | {id, name, round}'
```

### 5. Test the Endpoint

#### Using cURL

```bash
# Replace 1234 with actual race ID from step 4
RACE_ID=1234

# Make request
curl -X GET "http://localhost:3000/api/predictions/${RACE_ID}" \
  -H "Content-Type: application/json" \
  | jq '.'
```

#### Using HTTPie

```bash
http GET "http://localhost:3000/api/predictions/${RACE_ID}"
```

#### Using Postman

1. Create new GET request
2. URL: `http://localhost:3000/api/predictions/1234`
3. Click Send

#### Using JavaScript/Fetch

```javascript
async function testPredictions(raceId) {
  const response = await fetch(
    `http://localhost:3000/api/predictions/${raceId}`,
  );
  const data = await response.json();
  console.log('Predictions:', data);
  return data;
}

// Test with race ID
testPredictions(1234);
```

### 6. Expected Response Format

```json
{
  "raceId": 1234,
  "raceName": "Monaco Grand Prix",
  "predictions": [
    {
      "driverId": 1,
      "driverName": "Max Verstappen",
      "constructorName": "Red Bull Racing",
      "podiumProbability": 0.8542
    },
    {
      "driverId": 44,
      "driverName": "Lewis Hamilton",
      "constructorName": "Mercedes",
      "podiumProbability": 0.7123
    },
    {
      "driverId": 16,
      "driverName": "Charles Leclerc",
      "constructorName": "Ferrari",
      "podiumProbability": 0.6845
    }
    // ... more drivers
  ]
}
```

---

## Debugging Common Issues

### Issue 1: Model File Not Found

**Error:** `Model file not found. Please train the model first.`

**Solution:**

```bash
cd backend/src/ml-scripts
python train_model.py
# Wait for training to complete
# Verify model file exists
ls -lh f1_podium_model.pkl
```

### Issue 2: Python Virtual Environment Not Found

**Error:** `ENOENT: no such file or directory, stat '/path/to/venv/bin/python3'`

**Solution:**

```bash
cd backend/src/ml-scripts
python3 -m venv venv
source venv/bin/activate
pip install pandas scikit-learn joblib python-dotenv supabase
```

### Issue 3: Missing Features Error

**Error:** `Missing feature in input data: avg_constructor_points_last_5_races`

**Cause:** Database query not returning all required features

**Debug:**

```bash
# Check server logs for the data being sent to Python
# Look for: 📊 Data being sent to Python script:

# Verify all 8 features are present:
# 1. driver_standings_position_before_race
# 2. driver_points_before_race
# 3. constructor_standings_position_before_race
# 4. constructor_points_before_race
# 5. driver_age
# 6. avg_points_last_5_races
# 7. avg_finish_pos_at_circuit
# 8. avg_constructor_points_last_5_races
```

### Issue 4: Race Not Found (404)

**Error:** `Race with ID X not found`

**Solution:**

```sql
-- Verify race exists
SELECT * FROM races WHERE id = X;

-- Check if race has a session
SELECT * FROM sessions WHERE race_id = X AND type = 'Race';

-- Check if race has results
SELECT COUNT(*) FROM race_results rr
JOIN sessions s ON rr.session_id = s.id
WHERE s.race_id = X AND s.type = 'Race';
```

### Issue 5: No Previous Sessions

**Error:** Empty predictions or all zeros

**Cause:** Race is the first race of the season

**Expected Behavior:**

- All "before_race" features will be 0
- avg_points_last_5_races will be 0
- Model will still make predictions based on other features

### Issue 6: Slow Response Time

**Symptoms:** Request takes >10 seconds

**Debug:**

```bash
# Check logs for timing information
# Enable query logging in TypeORM (app.module.ts):
# logging: true

# Profile database queries
# Look for slow queries in logs
```

**Optimization:**

```sql
-- Add indexes (if not already present)
CREATE INDEX IF NOT EXISTS idx_race_results_driver ON race_results(driver_id);
CREATE INDEX IF NOT EXISTS idx_race_results_constructor ON race_results(constructor_id);
CREATE INDEX IF NOT EXISTS idx_race_results_session ON race_results(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_race_type ON sessions(race_id, type);
CREATE INDEX IF NOT EXISTS idx_races_season_round ON races(season_id, round);
```

---

## Verification Checklist

### Pre-Flight Checks

- [ ] Python virtual environment exists
- [ ] Model file exists (f1_podium_model.pkl)
- [ ] Required Python packages installed
- [ ] Backend server running
- [ ] Database connection working
- [ ] Test race ID identified

### Test Cases

#### Test Case 1: Valid Race with Full Season Data

```bash
# Test with a mid-season race (round 10-15)
RACE_ID=<mid-season-race-id>
curl "http://localhost:3000/api/predictions/${RACE_ID}" | jq '.predictions | length'
# Expected: Number of drivers (18-22)
```

#### Test Case 2: First Race of Season

```bash
# Test with first race (round 1)
RACE_ID=<first-race-id>
curl "http://localhost:3000/api/predictions/${RACE_ID}" | jq '.predictions[0:3]'
# Expected: Predictions with lower confidence (more uncertainty)
```

#### Test Case 3: Recent Race

```bash
# Test with 2024 or 2025 race
RACE_ID=<recent-race-id>
curl "http://localhost:3000/api/predictions/${RACE_ID}" | jq '.raceName'
# Expected: Race name from recent season
```

#### Test Case 4: Invalid Race ID

```bash
curl "http://localhost:3000/api/predictions/999999" -w "\n%{http_code}\n"
# Expected: 404 status code
```

#### Test Case 5: Probability Range Check

```bash
curl "http://localhost:3000/api/predictions/${RACE_ID}" | \
  jq '.predictions[].podiumProbability' | \
  awk '{if ($1 < 0 || $1 > 1) print "Invalid probability: " $1}'
# Expected: No output (all probabilities between 0 and 1)
```

### Log Inspection

Look for these log messages in order:

1. ✅ `Starting predictions for race ID: X`
2. ✅ `Found race: <name>, Season: X, Circuit: X`
3. ✅ `Found race session ID: X`
4. ✅ `Found X drivers participating in this race`
5. ✅ `Found X previous race sessions in this season`
6. ✅ `Feature calculation complete for all drivers`
7. 📊 `Data being sent to Python script:`
8. 🐍 `Executing Python prediction script...`
9. 📥 `Raw result from Python script:`
10. ✅ `Predictions generated successfully for X drivers`

### Performance Benchmarks

| Metric               | Target | Acceptable |
| -------------------- | ------ | ---------- |
| First race of season | < 1s   | < 2s       |
| Mid-season race      | < 3s   | < 5s       |
| Full season race     | < 5s   | < 8s       |

---

## Integration Testing

### Frontend Integration Test

```typescript
// Example React component test
import { render, waitFor } from '@testing-library/react';
import PredictionsView from './PredictionsView';

test('loads and displays predictions', async () => {
  const { getByText } = render(<PredictionsView raceId={1234} />);

  await waitFor(() => {
    expect(getByText(/podium probability/i)).toBeInTheDocument();
  }, { timeout: 10000 });
});
```

### E2E Test

```bash
cd backend
npm run test:e2e
```

---

## Sample Test Data

If you need to create test data:

```sql
-- Insert test race
INSERT INTO races (season_id, circuit_id, round, name, date, time)
VALUES (23, 6, 15, 'Test Grand Prix', '2024-10-20', '14:00:00')
RETURNING id;

-- Insert test session (use race_id from above)
INSERT INTO sessions (race_id, type, start_time)
VALUES (<race_id>, 'Race', '2024-10-20 14:00:00+00')
RETURNING id;

-- Insert test race results (use session_id from above)
INSERT INTO race_results (session_id, driver_id, constructor_id, position, points, grid)
VALUES
  (<session_id>, 1, 1, 1, 25, 1),
  (<session_id>, 44, 2, 2, 18, 3),
  (<session_id>, 16, 3, 3, 15, 2);
```

---

## Monitoring in Production

### Health Check

```bash
# Simple health check
curl http://localhost:3000/api/predictions/health || echo "Service down"
```

### Log Monitoring

```bash
# Watch logs in real-time
tail -f logs/predictions.log | grep -E "(✅|❌|📊|🐍)"
```

### Alert Thresholds

- Response time > 10s: Warning
- Error rate > 5%: Critical
- Model file missing: Critical
- Python process crash: Critical

---

## Success Criteria

### Functional Requirements

- [x] Endpoint returns predictions for valid race ID
- [x] All 8 features calculated correctly
- [x] Python script receives correct JSON format
- [x] Results sorted by probability (descending)
- [x] Driver and constructor names included
- [x] Error handling for invalid race IDs

### Non-Functional Requirements

- [x] Response time < 5s for typical race
- [x] Comprehensive logging for debugging
- [x] Proper HTTP status codes
- [x] Input validation
- [x] Type-safe parameters
- [x] Swagger documentation

---

**Last Updated:** October 16, 2025
