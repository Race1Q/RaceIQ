# Frontend Predictions - Quick Start Guide

## 🚀 What Changed?

Your frontend now uses a **much simpler API** for predictions. Instead of manually fetching driver data and preparing payloads, just pass a `raceId` and get back predictions!

---

## 📦 New Files

1. **`frontend/src/hooks/usePredictions.ts`** - Custom hook for predictions
2. **`frontend/PREDICTIONS_FRONTEND_INTEGRATION.md`** - Full documentation

---

## 🔄 Updated Files

1. **`frontend/src/services/predictionService.ts`**
   - Added new `getPredictionsByRaceId(raceId)` function
   - Added new types: `DriverPrediction`, `RacePredictionsResponse`
   - Kept old function for backward compatibility

2. **`frontend/src/pages/RacesPage/components/PredictionsTab.tsx`**
   - Complete rewrite using `usePredictions` hook
   - Beautiful UI with skeletons, errors, and enhanced display

3. **`frontend/src/pages/Dashboard/widgets/PodiumPredictionWidget.tsx`**
   - Complete rewrite using `usePredictions` hook
   - Now accepts `raceId` prop
   - Shows top 3 predictions only

4. **`frontend/src/pages/Dashboard/widgets/NextRaceWidget.tsx`**
   - Passes `raceId` to PodiumPredictionWidget

5. **`frontend/src/types/index.ts`**
   - Added optional `raceId` to `NextRace` interface

---

## 🎯 How To Use

### In Any Component

```typescript
import { usePredictions } from '@/hooks/usePredictions';

function MyComponent({ raceId }: { raceId: number }) {
  const { predictions, loading, error, topThree } = usePredictions(raceId);

  if (loading) return <Skeleton />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {predictions.map(p => (
        <div key={p.driverId}>
          {p.driverName} ({p.constructorName}): {p.podiumProbability * 100}%
        </div>
      ))}
    </div>
  );
}
```

### API Response Format

```typescript
{
  raceId: 1234,
  raceName: "Monaco Grand Prix",
  predictions: [
    {
      driverId: 1,
      driverName: "Max Verstappen",
      constructorName: "Red Bull Racing",
      podiumProbability: 0.8542  // 85.42%
    },
    // ... more drivers, sorted by probability (descending)
  ]
}
```

---

## 🧪 Quick Test

### 1. Test Race Details Predictions Tab

```bash
# Start frontend
cd frontend
npm run dev

# Navigate to: http://localhost:5173/races/1234
# Click "Predictions" tab
# Should see loading skeletons, then predictions
```

### 2. Test Dashboard Podium Widget

```bash
# Navigate to: http://localhost:5173/dashboard
# Look for "Next Race" widget
# Should see "Podium Prediction" section with top 3
```

---

## ⚠️ Important Note

The Dashboard/Next Race widget requires the backend to include `raceId` in the `/api/dashboard` response:

```json
{
  "nextRace": {
    "raceId": 1234,  // ← This needs to be added by backend
    "raceName": "Monaco Grand Prix",
    "circuitName": "Circuit de Monaco",
    "raceDate": "2025-05-25T13:00:00Z"
  }
}
```

Until this is added, the Dashboard widget will show "Predictions available for upcoming races" instead of actual predictions.

---

## 🔍 Debugging

### Check Browser Console

```javascript
// You'll see logs like:
[PredictionService] Fetching predictions for race ID: 1234
[PredictionService] ✅ Received 20 predictions for Monaco Grand Prix
```

### Check Network Tab

- **Request**: `GET /api/predictions/1234`
- **Response**: JSON with `raceId`, `raceName`, and `predictions` array

### Check Backend Logs

```
[PredictionsService] Starting predictions for race ID: 1234
[PredictionsService] Found race: Monaco Grand Prix
[PredictionsService] ✅ Feature calculation complete
[PredictionsService] 🐍 Executing Python prediction script...
[PredictionsService] ✅ Predictions generated successfully for 20 drivers
```

---

## 🎨 Visual States

### Loading
- Skeleton placeholders showing structure
- Professional, not just spinners

### Error
- Chakra Alert component (red)
- Clear error message
- User-friendly wording

### Empty
- Chakra Alert component (blue/info)
- Explains why no data

### Success
- Full predictions list (Race Details Tab)
- Top 3 only (Dashboard/Next Race Widget)
- Rich formatting with icons, colors, progress bars

---

## 📚 More Information

See **`PREDICTIONS_FRONTEND_INTEGRATION.md`** for:
- Complete API documentation
- Detailed component breakdowns
- Migration guide from old code
- Performance considerations
- Testing checklist
- Best practices

---

## ✅ Status

**Frontend Implementation**: ✅ Complete  
**Backend Requirement**: Dashboard endpoint needs `raceId` in `nextRace`  
**Testing**: Ready for integration testing once backend is updated

---

**Questions?** Check the full documentation or ask the team!
