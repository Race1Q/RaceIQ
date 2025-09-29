// frontend/src/hooks/useHomePageData.ts

import { useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { buildApiUrl } from '../lib/api';
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

                // Fetch both in parallel
                const [driverRes, scheduleRes] = await Promise.all([
                    fetch(buildApiUrl('/api/standings/featured-driver')),
                    fetch(buildApiUrl(`/api/seasons/${currentYear}/races`)),
                ]);

                if (!driverRes.ok) {
                    let message = 'Failed to fetch featured driver';
                    try {
                        const body = await driverRes.json();
                        message = body?.message || message;
                    } catch {}
                    throw new Error(message);
                }

                if (!scheduleRes.ok) {
                    let message = 'Failed to fetch race schedule';
                    try {
                        const body = await scheduleRes.json();
                        message = body?.message || message;
                    } catch {}
                    throw new Error(message);
                }

                const driverData: FeaturedDriver = await driverRes.json();
                const scheduleData: Race[] = await scheduleRes.json();
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
