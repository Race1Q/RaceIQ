import { apiFetch } from '../lib/api';

// ============================================================================
// LEGACY POST ENDPOINT TYPES (for backward compatibility)
// ============================================================================
export interface DriverPredictionRequest {
  driverId: string;
  features: Record<string, any>;
}

export interface PredictionResponse {
  driverId: string;
  prediction: {
    success: boolean;
    podium_probability: number;
  };
}

// ============================================================================
// NEW GET ENDPOINT TYPES (recommended for all new code)
// ============================================================================

/**
 * Individual prediction for a driver in a race
 */
export interface DriverPrediction {
  driverId: number;
  driverName: string;
  constructorName: string;
  podiumProbability: number;
}

/**
 * Complete response from GET /api/predictions/:raceId
 */
export interface RacePredictionsResponse {
  raceId: number;
  raceName: string;
  predictions: DriverPrediction[];
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * LEGACY: Fetch predictions using the POST endpoint
 * @deprecated Use getPredictionsByRaceId instead
 */
export const getPredictions = async (drivers: DriverPredictionRequest[]): Promise<PredictionResponse[]> => {
  const requestBody = { drivers };
  console.log("SENDING PAYLOAD TO BACKEND:", JSON.stringify(requestBody, null, 2));

  try {
    const response = await apiFetch('/api/predictions/predict', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response) {
      throw new Error('Network response was not ok');
    }
    
    return response;
  } catch (error) {
    console.error('Error fetching predictions:', error);
    throw error;
  }
};

/**
 * NEW: Fetch predictions for all drivers in a specific race
 * This is the recommended API to use going forward.
 * 
 * @param raceId - The ID of the race to get predictions for
 * @returns Complete predictions with driver names and probabilities, sorted by probability (descending)
 * 
 * @example
 * ```typescript
 * const predictions = await getPredictionsByRaceId(1234);
 * console.log(predictions.predictions[0]); // Top predicted driver
 * ```
 */
export const getPredictionsByRaceId = async (raceId: number): Promise<RacePredictionsResponse> => {
  try {
    console.log(`[PredictionService] Fetching predictions for race ID: ${raceId}`);
    
    const response = await apiFetch<RacePredictionsResponse>(`/api/predictions/${raceId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response) {
      throw new Error('No response received from predictions API');
    }

    console.log(`[PredictionService] ✅ Received ${response.predictions.length} predictions for ${response.raceName}`);
    
    return response;
  } catch (error) {
    console.error(`[PredictionService] ❌ Error fetching predictions for race ${raceId}:`, error);
    throw error;
  }
};
