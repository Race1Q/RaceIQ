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
        const fetchHomePageData = async () => {
            try {
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

                setFeaturedDriver(driverData);
                setSeasonSchedule(Array.isArray(scheduleData) ? scheduleData : []);
            } catch (err) {
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
                setLoading(false);
            }
        };

        fetchHomePageData();
    }, [toast]);

    return { featuredDriver, seasonSchedule, loading, error, isFallback };
}
