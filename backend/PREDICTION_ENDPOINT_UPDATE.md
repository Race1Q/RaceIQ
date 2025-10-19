# Prediction Endpoint Update - ML Model Integration

**Date:** October 16, 2025  
**Branch:** feat/MLIntegration  
**Purpose:** Update backend API to align with updated Python ML model for F1 podium predictions

---

## Summary of Changes

The backend prediction endpoint has been completely updated to work with the new machine learning model that predicts Formula 1 podium finishers. The key change is the removal of the data-leaking `grid_position` feature and the addition of `avg_constructor_points_last_5_races`.

---

## 🎯 New Endpoint

### **GET /api/predictions/:raceId**

Returns podium predictions for all drivers participating in a specific race.

**Parameters:**
- `raceId` (number, path parameter) - The ID of the race to get predictions for

**Response:**
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
    ...
  ]
}
```

**Status Codes:**
- `200` - Success
- `404` - Race not found or no race results available
- `500` - Server error during prediction

---

## 📊 ML Model Features

### Old Features (7 features with data leak)
1. ❌ `grid_position` - **REMOVED** (data leak)
2. ✅ `driver_standings_position_before_race`
3. ✅ `driver_points_before_race`
4. ✅ `constructor_standings_position_before_race`
5. ✅ `driver_age`
6. ✅ `avg_points_last_5_races`
7. ✅ `avg_finish_pos_at_circuit`

### New Features (8 features, no data leak)
1. ✅ `driver_standings_position_before_race`
2. ✅ `driver_points_before_race`
3. ✅ `constructor_standings_position_before_race`
4. ✅ `constructor_points_before_race` - **ADDED**
5. ✅ `driver_age`
6. ✅ `avg_points_last_5_races`
7. ✅ `avg_finish_pos_at_circuit`
8. ✅ `avg_constructor_points_last_5_races` - **ADDED** (crucial new feature)

---

## 🔧 Files Modified

### 1. **predictions.controller.ts**
- Added new `GET /:raceId` endpoint
- Properly configured Swagger/OpenAPI documentation
- Uses `ParseIntPipe` for type-safe parameter parsing

### 2. **predictions.service.ts**
- Added comprehensive `getPredictionsByRaceId()` method
- Implements complex database queries to calculate all 8 features
- Features rich logging with emoji indicators for easy debugging
- Robust error handling with NestJS exceptions

### 3. **predictions.module.ts**
- Imported TypeORM repositories for:
  - `Race`
  - `Session`
  - `RaceResult`
  - `Driver`
  - `ConstructorEntity`
- Made service exportable for potential reuse

### 4. **predict-request.dto.ts**
- Removed `grid_position` field
- Added `constructor_points_before_race` field
- Added `avg_constructor_points_last_5_races` field
- Updated Swagger documentation

---

## 🧮 Feature Calculation Logic

### Driver Standings & Points Before Race
```sql
-- Calculates cumulative driver points from all previous races in the season
-- Ranks drivers by total points to determine standings position
```

### Constructor Standings & Points Before Race
```sql
-- Calculates cumulative constructor points (sum of both drivers)
-- Ranks constructors by total points to determine standings position
```

### Driver Age
```typescript
// Calculated as: (race_date - driver_date_of_birth) / 365.25
```

### Average Points Last 5 Races
```sql
-- Gets driver's last 5 race results before current race
-- Calculates average points earned
```

### Average Finish Position at Circuit
```sql
-- Gets all historical race results for driver at this specific circuit
-- Calculates average finishing position
-- Only includes races before the current one (no data leak)
```

### Average Constructor Points Last 5 Races (NEW!)
```sql
-- Gets constructor's total points (both drivers) from last 5 races
-- Groups by race round to get team total per race
-- Calculates average team performance
```

---

## 🐍 Python Script Integration

### Input Format
The service sends a **single JSON array string** containing all drivers:
```json
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
  ...
]
```

### Output Format
Python script (`run_prediction.py`) returns:
```json
{
  "success": true,
  "predictions": [
    {
      "driver_id": 1,
      "podium_probability": 0.8542
    },
    ...
  ]
}
```

Results are sorted by `podium_probability` in descending order.

---

## 🔍 Debugging Features

The service includes comprehensive logging at every step:

```
✅ - Success indicators
📊 - Data being sent
🐍 - Python script execution
📥 - Results received
❌ - Error indicators
```

### Example Log Output
```
[PredictionsService] Starting predictions for race ID: 1234
[PredictionsService] Found race: Monaco Grand Prix, Season: 2024, Circuit: 6
[PredictionsService] Found race session ID: 5678
[PredictionsService] Found 20 drivers participating in this race
[PredictionsService] Found 8 previous race sessions in this season
[PredictionsService] ✅ Feature calculation complete for all drivers
[PredictionsService] 📊 Data being sent to Python script:
[... JSON data ...]
[PredictionsService] 🐍 Executing Python prediction script...
[PredictionsService] 📥 Raw result from Python script:
[... Python output ...]
[PredictionsService] ✅ Predictions generated successfully for 20 drivers
```

---

## ⚠️ Error Handling

### Not Found Errors (404)
- Race doesn't exist
- Race session not found
- No race results available

### Internal Server Errors (500)
- Database query failures
- Python script execution errors
- Feature calculation errors
- JSON parsing errors

All errors include detailed messages and stack traces in logs.

---

## 🧪 Testing the Endpoint

### Using cURL
```bash
curl -X GET http://localhost:3000/api/predictions/1234
```

### Using Postman/Insomnia
```
GET http://localhost:3000/api/predictions/1234
```

### Expected Data Requirements
1. Race must exist in database
2. Race must have a session with type='Race'
3. Session must have race results
4. Drivers and constructors must be properly linked

---

## 🚀 Deployment Notes

### Prerequisites
1. Python virtual environment must be set up at: `backend/src/ml-scripts/venv`
2. Trained model file must exist: `backend/src/ml-scripts/f1_podium_model.pkl`
3. Python dependencies installed:
   - pandas
   - scikit-learn
   - joblib

### Environment Variables
No new environment variables required. Uses existing database connection.

---

## 📝 Future Improvements

1. **Caching**: Cache predictions to avoid recalculation
2. **Batch Processing**: Allow predictions for multiple races
3. **Confidence Intervals**: Return confidence ranges with predictions
4. **Feature Importance**: Return which features most influenced predictions
5. **Historical Accuracy**: Track and display prediction accuracy over time

---

## 👥 Integration Points

### Frontend Integration
```typescript
// Example fetch call
const response = await fetch(`/api/predictions/${raceId}`);
const data = await response.json();

// data.predictions is sorted by podiumProbability (highest first)
const topThree = data.predictions.slice(0, 3);
```

### Other Backend Services
The `PredictionsService` is now exported from the module and can be injected into other services:

```typescript
constructor(
  private readonly predictionsService: PredictionsService
) {}
```

---

## 🔗 Related Files

- ML Training Script: `backend/src/ml-scripts/train_model.py`
- ML Prediction Script: `backend/src/ml-scripts/run_prediction.py`
- Model Feature Checker: `backend/src/ml-scripts/check_model_features.py`
- Model File: `backend/src/ml-scripts/f1_podium_model.pkl`

---

## ✅ Checklist

- [x] Updated DTO to remove `grid_position`
- [x] Updated DTO to add `constructor_points_before_race`
- [x] Updated DTO to add `avg_constructor_points_last_5_races`
- [x] Created new GET endpoint with `:raceId`
- [x] Implemented feature calculation for all 8 features
- [x] Added comprehensive logging
- [x] Added error handling
- [x] Updated module dependencies
- [x] Tested Python script integration
- [x] Documented all changes

---

**Status:** ✅ Complete and Ready for Testing
