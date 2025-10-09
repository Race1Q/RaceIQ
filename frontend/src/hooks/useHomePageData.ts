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
                
                // Debug logging
                console.log('=== FRONTEND FEATURED DRIVER DEBUG ===');
                console.log('Received driver data:', driverData);
                console.log('Driver name:', driverData.fullName);
                console.log('Driver position:', driverData.position);
                console.log('Recent form:', driverData.recentForm);
                if (driverData.recentForm && driverData.recentForm.length > 0) {
                    const last5 = driverData.recentForm.slice(0, 5);
                    const avgPos = last5.reduce((sum, race) => sum + race.position, 0) / last5.length;
                    console.log('Last 5 races:', last5.map(r => `P${r.position}`).join(', '));
                    console.log('Average position:', avgPos.toFixed(2));
                }
                console.log('=====================================');

                // Check if we're getting the old logic (championship leader) or new logic (best form)
                console.log('=== LOGIC ANALYSIS ===');
                console.log('Driver position in response:', driverData.position);
                console.log('Is this the championship leader?', driverData.position === 1);
                
                if (driverData.position === 1) {
                    console.log('⚠️  WARNING: Still getting championship leader (position 1)');
                    console.log('This suggests the backend changes are NOT deployed yet.');
                    console.log('Oscar Piastri is being selected as championship leader, not best form.');
                } else {
                    console.log('✅ Getting driver by form (position != 1)');
                    console.log('Backend changes appear to be deployed.');
                }
                
                // Try to fetch debug data (will fail if backend not deployed)
                try {
                    const debugRes = await fetch(buildApiUrl('/api/standings/featured-driver-debug'));
                    if (debugRes.ok) {
                        const debugData = await debugRes.json();
                        console.log('=== ALL DRIVERS FORM DEBUG ===');
                        console.log('Season:', debugData.season);
                        console.log('Total drivers:', debugData.totalDrivers);
                        console.log('Drivers with form data:', debugData.driversWithFormData);
                        console.log('Form rankings (best to worst):');
                        debugData.driverFormRankings.forEach((driver: any, index: number) => {
                            console.log(`${index + 1}. ${driver.driverName}: ${driver.last5Races.join(', ')} → Avg: ${driver.averagePosition} (Championship: P${driver.championshipRanking})`);
                        });
                        console.log('Best driver by form:', debugData.bestDriver?.driverName);
                        console.log('=====================================');
                    }
                } catch (debugError) {
                    console.warn('❌ Debug endpoint not available - backend changes not deployed yet');
                    console.log('Current featured driver is likely the championship leader, not best form.');
                }
                console.log('=====================================');
                
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
