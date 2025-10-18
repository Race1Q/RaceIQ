// frontend/src/hooks/useHomePageData.ts

import { useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { buildApiUrl } from '../lib/api';
import { fetchCached } from '../lib/requestCache';
import type { FeaturedDriver } from '../types';
import type { Race } from '../types/races';

interface HomePageData {
    featuredDriver: FeaturedDriver | null;
    seasonSchedule: Race[];
    loading: boolean;
    error: string | null;
    isFallback: boolean;
}

// A simple fallback object; optionally move to a shared fallback module
const fallbackFeaturedDriver: FeaturedDriver = {
    id: 1,
    fullName: 'Max Verstappen',
    driverNumber: 1,
    countryCode: 'NLD',
    teamName: 'Red Bull Racing',
    seasonPoints: 400,
    seasonWins: 15,
    seasonPoles: 8,
    position: 1,
    imageUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png.transform/2col-retina/image.png',
    careerStats: { wins: 60, podiums: 105, poles: 35 },
    recentForm: [{ position: 1, raceName: 'Previous GP', countryCode: 'USA' }],
};

export function useHomePageData(): HomePageData {
    const [featuredDriver, setFeaturedDriver] = useState<FeaturedDriver | null>(null);
    const [seasonSchedule, setSeasonSchedule] = useState<Race[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFallback, setIsFallback] = useState(false);
    const toast = useToast();

    useEffect(() => {
        let alive = true; // Cleanup flag to prevent state updates on unmounted component
        
        const fetchHomePageData = async () => {
            try {
                if (!alive) return; // Early exit if unmounted
                setLoading(true);
                setError(null);
                setIsFallback(false);

                const currentYear = new Date().getFullYear();

                // Fetch both in parallel with caching and timeout
                // Using timestamp to force cache refresh for debugging
                const cacheKey = `home:featured:${Date.now()}`;
                const [driverData, scheduleData] = await Promise.all([
                  fetchCached<FeaturedDriver>(cacheKey, buildApiUrl('/api/standings/featured-driver')),
                  fetchCached<Race[]>(`home:races:${currentYear}`, buildApiUrl(`/api/seasons/${currentYear}/races`)),
                ]);
                
                // Debug logging to see what data we're getting
                console.log('[DEBUG] useHomePageData: Received driver data =', {
                  fullName: driverData.fullName,
                  position: driverData.position,
                  recentFormLength: driverData.recentForm?.length,
                  recentFormSample: driverData.recentForm?.slice(0, 2)
                });

                if (alive) {
                  setFeaturedDriver(driverData);
                  setSeasonSchedule(Array.isArray(scheduleData) ? scheduleData : []);
                }
            } catch (err) {
                if (!alive) return; // Don't update state if unmounted
                const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
                console.error('Error fetching home page data:', errorMessage);
                setError(errorMessage);
                setFeaturedDriver(fallbackFeaturedDriver);
                setSeasonSchedule([]);
                setIsFallback(true);
                toast({
                    title: 'Could not fetch live home page data',
                    description: 'Displaying cached information.',
                    status: 'warning',
                    duration: 5000,
                    isClosable: true,
                });
            } finally {
                if (alive) {
                  setLoading(false);
                }
            }
        };

        fetchHomePageData();
        
        return () => {
          alive = false; // Mark as unmounted to prevent state updates
        };
    }, [toast]);

    return { featuredDriver, seasonSchedule, loading, error, isFallback };
}
