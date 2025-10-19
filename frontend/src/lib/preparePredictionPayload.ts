import type { Driver } from '../types';
import { apiFetch } from './api';

interface QualifyingResult {
  driverId: number;
  position: number;
}

interface DriverStanding {
  driver: { id: number };
  points: number;
  position: number;
}

export const preparePredictionPayload = async (drivers: Driver[], currentYear: number) => {
  // Fetch necessary data for feature engineering
  const qualifyingResults: QualifyingResult[] = await apiFetch(`/api/qualifying-results?season=${currentYear}&limit=300`);
  const standings: DriverStanding[] = await apiFetch(`/api/standings/drivers?season=${currentYear}`);

  const qualyMap = new Map(qualifyingResults.map(r => [r.driverId, r.position]));
  const standingsMap = new Map(standings.map(s => [s.driver.id, { points: s.points, position: s.position }]));

  return drivers.map(driver => {
    const standing = standingsMap.get(driver.id) || { points: 0, position: 20 };

    // Basic validation and fallback for features
    const features: Record<string, number> = {
      grid_position: qualyMap.get(driver.id) || 20,
      driver_standings_position_before_race: standing.position,
      driver_points_before_race: standing.points,
      constructor_standings_position_before_race: 0, // Placeholder
      driver_age: 30, // Placeholder
      avg_points_last_5_races: 0,
      avg_finish_pos_at_circuit: 0, // Placeholder
    };

    // Ensure all feature values are numbers
    for (const key in features) {
      if (typeof features[key] !== 'number' || isNaN(features[key])) {
        features[key] = 0;
      }
    }

    return {
      driverId: driver.id.toString(),
      features,
    };
  });
};
