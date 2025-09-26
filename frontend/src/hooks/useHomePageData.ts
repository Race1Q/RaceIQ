// frontend/src/hooks/useHomePageData.ts

import { useState, useEffect } from 'react';
import { buildApiUrl } from '../lib/api';
import { supabase } from '../lib/supabase';

interface PodiumResult {
    position: number;
    driverName: string;
    countryCode?: string; // optional 3-letter code when available
}

export interface Race {
    id: number;
    name: string;
    round: number;
    date: string;
    circuit: {
        id: number;
        name: string;
        country_code: string;
    };
    podium: PodiumResult[] | null;
}

export type RaceWithPodium = Race;

interface DriverStanding {
	driverId: number;
	driverFullName: string;
	constructorName: string;
	seasonPoints: number;
	seasonWins: number;
}

interface DriverStats {
	wins: number;
	podiums: number;
	poles: number;
	totalPoints: number;
	fastestLaps: number;
	racesCompleted: number;
}

interface FeaturedDriver {
	id: number;
	fullName: string;
	driverNumber: number | null;
	countryCode: string | null;
	teamName: string;
	seasonPoints: number;
	seasonWins: number;
	position: number;
	careerStats: DriverStats;
	recentForm: { position: number; raceName: string; countryCode: string }[];
}

interface HomePageData {
    featuredDriver: FeaturedDriver | null;
    seasonSchedule: Race[];
    loading: boolean;
    error: string | null;
}

// Default fallback driver used when live data fails
const defaultFeaturedDriver: FeaturedDriver = {
	id: 1,
	fullName: 'Max Verstappen',
	driverNumber: 1,
	countryCode: 'NED',
	teamName: 'Red Bull Racing',
  seasonPoints: 310,
  seasonWins: 10,
  position: 1,
	careerStats: {
    wins: 61,
    podiums: 110,
    poles: 42,
    totalPoints: 2700,
    fastestLaps: 32,
    racesCompleted: 190,
	},
  recentForm: [
    { position: 1, raceName: 'Italian Grand Prix', countryCode: 'ITA' },
    { position: 2, raceName: 'Dutch Grand Prix', countryCode: 'NLD' },
    { position: 1, raceName: 'Belgian Grand Prix', countryCode: 'BEL' },
    { position: 3, raceName: 'British Grand Prix', countryCode: 'GBR' },
    { position: 1, raceName: 'Austrian Grand Prix', countryCode: 'AUT' },
  ],
};

export function useHomePageData(): HomePageData {
    const [featuredDriver, setFeaturedDriver] = useState<FeaturedDriver | null>(null);
    const [seasonSchedule, setSeasonSchedule] = useState<Race[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchHomePageData = async () => {
			try {
				setLoading(true);
				setError(null);

				const currentYear = new Date().getFullYear();

				// Fetch all races for the current year
				const racesResponse = await fetch(buildApiUrl(`/api/seasons/${currentYear}/races`));
				if (!racesResponse.ok) {
					throw new Error(`Failed to fetch races: ${racesResponse.statusText}`);
				}
                const races: Race[] = await racesResponse.json();

                // Provide full season schedule directly
                setSeasonSchedule(races);

                // Get the latest completed race round
                const latestCompleted = races
                    .filter(r => new Date(r.date) < new Date())
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                const latestRound = latestCompleted.length > 0 ? latestCompleted[0].round : 1;

				// Fetch standings using conditional logic based on year
				let driverStandingsResponse;

				// For modern years, use the fast Supabase RPC
				if (currentYear >= 2023) {
					// fetching standings from materialized view
				
					const { data: standings, error } = await supabase
						.from('driver_standings_materialized') // Query the view like a table
						.select('*')
						.eq('seasonYear', currentYear); // Filter by the current year
				
					if (error) {
						throw new Error(`Supabase Query Error: ${error.message}`);
					}
				
					// The data is already in the correct shape, just wrap it
					driverStandingsResponse = { driverStandings: standings };

				} else {
					// For historical data, use the existing NestJS API
					// fetching standings using NestJS API for historical years
					const response = await fetch(buildApiUrl(`/api/standings/${currentYear}/${latestRound}`));
					if (!response.ok) {
						throw new Error('Failed to fetch historical standings');
					}
					{
						const raw = await response.json();
						driverStandingsResponse = {
							driverStandings: (raw.driverStandings ?? [])
								.filter((s: any) => s?.driver && s?.team)
								.map((s: any) => ({
									driverId: s.driver.id,
									driverFullName: `${s.driver.first_name} ${s.driver.last_name}`,
									constructorName: s.team.name,
									seasonPoints: s.points,
									seasonWins: s.wins,
								})),
						};
					}
				}

				// The RPC now returns a flat object with aliased names
				const topDriverStanding: DriverStanding = driverStandingsResponse.driverStandings?.[0];

				if (!topDriverStanding) {
					// Check if driverStandings exists and is an array
					if (!driverStandingsResponse.driverStandings || !Array.isArray(driverStandingsResponse.driverStandings)) {
						throw new Error('Driver standings data is missing or not an array');
					}
					throw new Error('No driver standings found');
				}

				// Fetch the top driver's career stats
				const statsResponse = await fetch(buildApiUrl(`/api/drivers/${topDriverStanding.driverId}/stats`));
				if (!statsResponse.ok) {
					throw new Error(`Failed to fetch driver stats: ${statsResponse.statusText}`);
				}
				const statsData = await statsResponse.json();
				const careerStats: DriverStats = statsData.careerStats;

				// Fetch recent form (last 5 results)
				let recentForm: { position: number; raceName: string; countryCode: string }[] = [];
				try {
					const recentFormResponse = await fetch(buildApiUrl(`/api/drivers/${topDriverStanding.driverId}/recent-form`));
					if (recentFormResponse.ok) {
						recentForm = await recentFormResponse.json();
						console.log('Data received in hook:', recentForm);
					} else {
						console.error('Failed to fetch recent form');
					}
				} catch (e) {
					console.error('Recent form fetch error', e);
				}

				// Combine standings data and career stats using the new field names
				const featuredDriverData: FeaturedDriver = {
					id: topDriverStanding.driverId,
					fullName: topDriverStanding.driverFullName,
					// These fields might not be in the RPC response, so handle them safely
					driverNumber: statsData.driver.driver_number || null, 
					countryCode: statsData.driver.country_code || null,
					teamName: topDriverStanding.constructorName, // Use the direct field
					seasonPoints: topDriverStanding.seasonPoints,
					seasonWins: topDriverStanding.seasonWins,
					position: 1, // The query is ordered by points, so the first result is always P1
					careerStats,
					recentForm,
				};

				setFeaturedDriver(featuredDriverData);

			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : 'Failed to fetch home page data';
				setError(errorMessage);
				console.error('Error fetching home page data:', err);
				// Set the fallback driver on error
				setFeaturedDriver(defaultFeaturedDriver);
			} finally {
				setLoading(false);
			}
		};

		fetchHomePageData();
	}, []);

    return {
        featuredDriver,
        seasonSchedule,
        loading,
        error
    };
}
