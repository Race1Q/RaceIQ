// frontend/src/hooks/useDriverDetails.ts
import { useState, useEffect } from 'react';
import { fallbackDriverDetails } from '../lib/fallbackData/driverDetails';
import type { DriverDetailsData } from '../types';

export const useDriverDetails = (driverId?: string) => {
  const [driverDetails, setDriverDetails] = useState<DriverDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const [isFallback] = useState(false);

  useEffect(() => {
    // TODO: This hook will be updated to fetch live data.
    // For now, we return rich fallback data to build the UI.
    console.log(`Simulating fetch for driverId: ${driverId}`);
    setDriverDetails(fallbackDriverDetails);
    setLoading(false);
  }, [driverId]);

  return { driverDetails, loading, error, isFallback };
};