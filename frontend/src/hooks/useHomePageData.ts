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
    position: 1,
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
                const [driverData, scheduleData] = await Promise.all([
                  fetchCached<FeaturedDriver>('home:featured', buildApiUrl('/api/standings/featured-driver')),
                  fetchCached<Race[]>(`home:races:${currentYear}`, buildApiUrl(`/api/seasons/${currentYear}/races`)),
                ]);
                
                // Minimal, non-noisy log in dev only
                if (import.meta.env.DEV) {
                  console.debug('[Home] featured=', driverData.fullName, 'recentForm avg=', driverData?.recentForm?.length
                    ? (driverData.recentForm.slice(0,5).reduce((s,r)=>s + r.position,0) / Math.min(5, driverData.recentForm.length)).toFixed(2)
                    : 'n/a');
                }

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
