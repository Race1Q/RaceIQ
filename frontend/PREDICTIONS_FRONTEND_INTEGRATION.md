# Frontend Predictions Integration - Complete Guide

**Date:** October 16, 2025  
**Branch:** feat/MLIntegration  
**Purpose:** Update frontend to work with new ML prediction backend API

---

## 📋 Summary of Changes

The frontend has been completely refactored to use the new `/api/predictions/:raceId` endpoint. All prediction displays now use a centralized custom hook with proper loading states, error handling, and consistent UI patterns.

---

## 🎯 Updated Components

### 1. **Prediction Service** (`services/predictionService.ts`)

#### New Types
```typescript
export interface DriverPrediction {
  driverId: number;
  driverName: string;
  constructorName: string;
  podiumProbability: number;
}

export interface RacePredictionsResponse {
  raceId: number;
  raceName: string;
  predictions: DriverPrediction[];
}
```

#### New Function
```typescript
export const getPredictionsByRaceId = async (raceId: number): Promise<RacePredictionsResponse>
```

**Features:**
- ✅ Uses GET endpoint (simpler than POST)
- ✅ No need to manually fetch/calculate driver data
- ✅ Backend handles all feature engineering
- ✅ Returns enriched data with driver/team names
- ✅ Comprehensive logging for debugging

#### Legacy Support
The old `getPredictions()` function is kept for backward compatibility but marked as deprecated.

---

### 2. **Custom Hook** (`hooks/usePredictions.ts`)

Centralized hook for fetching predictions with built-in state management.

#### API
```typescript
function usePredictions(raceId: number | null): {
  loading: boolean;
  error: string | null;
  data: RacePredictionsResponse | null;
  predictions: DriverPrediction[];
  topThree: DriverPrediction[];
  refetch: () => Promise<void>;
}
```

#### Features
- ✅ Automatic fetching on mount
- ✅ Loading state management
- ✅ Error state management
- ✅ Null-safe (accepts null raceId)
- ✅ Manual refetch capability
- ✅ Convenient `topThree` accessor

#### Usage Example
```typescript
const { predictions, loading, error, topThree } = usePredictions(raceId);

if (loading) return <Skeleton />;
if (error) return <ErrorAlert message={error} />;

return (
  <div>
    {predictions.map(p => <PredictionCard key={p.driverId} prediction={p} />)}
  </div>
);
```

---

### 3. **PredictionsTab** (`pages/RacesPage/components/PredictionsTab.tsx`)

Complete rewrite for the Race Details page Predictions tab.

#### Before
- ❌ Used legacy POST endpoint
- ❌ Required manual driver data fetching
- ❌ Basic loading (spinner only)
- ❌ Simple error message
- ❌ Minimal UI

#### After
- ✅ Uses new GET endpoint via `usePredictions` hook
- ✅ No manual data preparation needed
- ✅ Skeleton loading states
- ✅ Comprehensive error/empty states with Alert components
- ✅ Rich UI with:
  - Position badges
  - Driver names and team names
  - Probability bars
  - Visual distinction for top 3
  - Hover effects
  - Trophy and trending icons
  - Footer notes

#### Features
- **Loading State**: Skeleton loaders for 5 predictions
- **Error State**: Alert with detailed message
- **Empty State**: Info alert when no predictions available
- **Success State**: Full list of predictions with:
  - Ranked display (1, 2, 3, ...)
  - Driver name + team name
  - Podium probability as percentage
  - Visual progress bar
  - Special styling for top 3 (colored border/background)
  - Hover animations

---

### 4. **PodiumPredictionWidget** (`pages/Dashboard/widgets/PodiumPredictionWidget.tsx`)

Completely refactored widget for Dashboard and Next Race displays.

#### Before
- ❌ Used legacy POST endpoint
- ❌ Required `preparePredictionPayload` helper
- ❌ Basic spinner loading
- ❌ Simple error text
- ❌ Limited information (driver last name only)

#### After
- ✅ Uses `usePredictions` hook
- ✅ Accepts `raceId` prop
- ✅ Skeleton loading states
- ✅ Alert-based error handling
- ✅ Displays:
  - Driver full name
  - Team name
  - Probability
  - Trophy icon
  - Trending icon for #1
  - Visual distinction for top prediction

#### Props
```typescript
interface PodiumPredictionWidgetProps {
  raceId?: number | null;
}
```

#### States Handled
1. **Loading**: Skeleton placeholders for 3 predictions
2. **Error**: Warning alert
3. **No Race ID**: Informative message
4. **Empty Predictions**: "Not available yet" message
5. **Success**: Top 3 predictions with rich formatting

---

### 5. **NextRaceWidget** (`pages/Dashboard/widgets/NextRaceWidget.tsx`)

Updated to pass `raceId` to PodiumPredictionWidget.

#### Change
```typescript
// Before
<PodiumPredictionWidget />

// After
<PodiumPredictionWidget raceId={data.raceId} />
```

**Note**: Requires backend to include `raceId` in the `/api/dashboard` response.

---

### 6. **Types** (`types/index.ts`)

Updated `NextRace` interface to include optional `raceId`.

```typescript
export interface NextRace {
  raceId?: number; // NEW: Optional race ID for predictions
  raceName: string;
  circuitName: string;
  raceDate: string;
}
```

---

## 🎨 UI/UX Improvements

### Loading States
All three locations now use **Chakra UI Skeleton** components instead of simple spinners:

```tsx
<Skeleton height="20px" width="150px" />
```

Benefits:
- More professional appearance
- Shows content structure while loading
- Better user experience

### Error States
Replaced simple error text with **Chakra Alert** components:

```tsx
<Alert status="error" variant="subtle">
  <AlertIcon />
  <AlertTitle>Unable to Load Predictions</AlertTitle>
  <AlertDescription>
    {error}. Please try again later.
  </AlertDescription>
</Alert>
```

### Empty States
Added informative messages when no data available:

```tsx
<Alert status="info">
  <AlertIcon />
  <AlertTitle>No Predictions Available</AlertTitle>
  <AlertDescription>
    Predictions for this race are not yet available.
  </AlertDescription>
</Alert>
```

---

## 📍 Display Locations

### Location 1: Dashboard (PodiumPredictionWidget in NextRaceWidget)

**Path**: `pages/Dashboard/DashboardPage.tsx` → `widgets/NextRaceWidget.tsx` → `widgets/PodiumPredictionWidget.tsx`

**Display**:
- Top 3 predicted drivers
- Compact format
- Driver last name + team
- Probability percentage
- Trophy icon
- Trending icon for #1

**Data Source**: `data.nextRace.raceId` from `/api/dashboard`

---

### Location 2: Next Race Widget (Standalone or in Dashboard)

**Path**: Same as above

**Display**: Same as Location 1 (they're the same component)

---

### Location 3: Race Details Page - Predictions Tab

**Path**: `pages/RaceDetailPage/RaceDetailPage.tsx` → `pages/RacesPage/components/PredictionsTab.tsx`

**Display**:
- **All** drivers (not just top 3)
- Full driver names
- Team names
- Position badges
- Probability bars
- Special highlighting for top 3
- Hover effects
- Comprehensive header with trophy icon
- Footer note about predictions

**Data Source**: `raceId` from URL parameter

---

## 🔄 Data Flow

```
┌─────────────────────────────────────────┐
│  Component (e.g., PredictionsTab)       │
│  - Receives raceId prop                 │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  usePredictions(raceId)                 │
│  - Manages loading, error, data states  │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  getPredictionsByRaceId(raceId)         │
│  - Calls GET /api/predictions/:raceId   │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Backend API                             │
│  - Fetches race data                    │
│  - Calculates features                  │
│  - Runs ML model                        │
│  - Returns predictions                  │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Response                                │
│  {                                       │
│    raceId: 1234,                        │
│    raceName: "Monaco GP",               │
│    predictions: [...]                   │
│  }                                      │
└─────────────────────────────────────────┘
```

---

## 🧪 Testing Checklist

### 1. PredictionsTab (Race Details Page)

#### Test Scenarios
- [ ] Navigate to a race details page
- [ ] Click "Predictions" tab
- [ ] Verify loading skeleton appears
- [ ] Verify predictions load and display
- [ ] Verify top 3 have special styling
- [ ] Verify hover effects work
- [ ] Test with invalid race ID (should show error)
- [ ] Test with race that has no predictions

#### What to Check
- Driver names are full names (not IDs)
- Team names appear correctly
- Probabilities are between 0-100%
- Progress bars match percentages
- Top 3 have colored borders
- Position badges show correct numbers (1, 2, 3...)

---

### 2. PodiumPredictionWidget (Dashboard)

#### Test Scenarios
- [ ] Load Dashboard
- [ ] Find Next Race widget
- [ ] Verify "Podium Prediction" section exists
- [ ] Verify loading skeletons appear first
- [ ] Verify top 3 predictions load
- [ ] Test with no raceId in nextRace data
- [ ] Test error handling

#### What to Check
- Only top 3 predictions shown
- Driver last names displayed
- Team names displayed
- Trophy icon visible
- Trending icon on #1 prediction
- Probabilities formatted as percentages

---

### 3. Integration Tests

```bash
cd frontend
npm test
```

#### Key Tests
- `PredictionsTab.test.tsx` (if created)
- `PodiumPredictionWidget.test.tsx` (if created)
- `usePredictions.test.ts` (if created)

---

## 🚨 Known Limitations & Future Work

### 1. Backend Dependency
**Issue**: Frontend requires backend to return `raceId` in `/api/dashboard` response  
**Status**: Needs backend update  
**Workaround**: PodiumPredictionWidget shows "not available" message if no raceId

### 2. Real-time Updates
**Issue**: Predictions don't auto-refresh  
**Solution**: Add manual refresh button or polling

### 3. Caching
**Issue**: No caching of predictions  
**Solution**: Implement React Query or SWR for caching

### 4. Historical Races
**Issue**: Predictions for past races might not make sense  
**Solution**: Add logic to hide predictions for completed races

---

## 📝 Migration Guide

### For Components Using Old API

If you have existing code using the old `getPredictions` function:

#### Before
```typescript
const [predictions, setPredictions] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const { drivers } = useDriversData(year);

useEffect(() => {
  const fetch = async () => {
    setLoading(true);
    try {
      const payload = await preparePredictionPayload(drivers, year);
      const results = await getPredictions(payload);
      setPredictions(results.sort(...));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  fetch();
}, [drivers]);
```

#### After
```typescript
const { predictions, loading, error } = usePredictions(raceId);

// That's it! All state management is handled.
```

---

## 🔍 Debugging

### Check Network Requests
```typescript
// Service already logs requests
// Check browser console for:
[PredictionService] Fetching predictions for race ID: 1234
[PredictionService] ✅ Received 20 predictions for Monaco Grand Prix
```

### Check Hook State
```typescript
const predictions = usePredictions(raceId);
console.log('Predictions hook state:', predictions);
// Shows: loading, error, data, predictions, topThree
```

### Backend Logs
Check backend terminal for:
```
[PredictionsService] Starting predictions for race ID: 1234
[PredictionsService] ✅ Feature calculation complete
[PredictionsService] 🐍 Executing Python prediction script...
```

---

## 🎯 Best Practices

### 1. Always Use the Hook
```typescript
// ✅ Good
const { predictions, loading, error } = usePredictions(raceId);

// ❌ Avoid
const [data, setData] = useState(null);
useEffect(() => {
  getPredictionsByRaceId(raceId).then(setData);
}, [raceId]);
```

### 2. Handle All States
```typescript
// ✅ Good - Handle loading, error, empty, success
if (loading) return <Skeleton />;
if (error) return <Alert status="error">{error}</Alert>;
if (!predictions.length) return <Alert status="info">No data</Alert>;
return <PredictionsList predictions={predictions} />;
```

### 3. Use Type Safety
```typescript
// ✅ Good - Import and use types
import type { DriverPrediction } from '@/services/predictionService';

interface Props {
  prediction: DriverPrediction;
}
```

---

## 📊 Performance Considerations

### Backend Query Complexity
- Each prediction request triggers ~200 database queries
- Expected response time: 2-5 seconds
- **Recommendation**: Cache predictions for completed races

### Frontend Optimization
- Hook automatically prevents duplicate fetches
- Race ID changes trigger refetch
- Consider adding debouncing for rapid tab switches

---

## ✅ Checklist

- [x] Updated `predictionService.ts` with new types and GET function
- [x] Created `usePredictions` custom hook
- [x] Updated `PredictionsTab` component
- [x] Updated `PodiumPredictionWidget` component
- [x] Updated `NextRaceWidget` to pass raceId
- [x] Updated `NextRace` type to include raceId
- [x] Added loading skeletons everywhere
- [x] Added error handling with Alerts
- [x] Added empty state handling
- [x] Documented all changes
- [ ] Update backend `/api/dashboard` to include raceId in nextRace
- [ ] Write unit tests for new hook
- [ ] Write integration tests
- [ ] Test with real data
- [ ] Update Storybook (if applicable)

---

**Status:** ✅ Frontend Implementation Complete  
**Next Steps:** Backend team to add `raceId` to dashboard response, then test end-to-end
