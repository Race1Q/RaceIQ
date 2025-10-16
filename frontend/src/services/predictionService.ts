import { apiFetch } from '../lib/api';

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
