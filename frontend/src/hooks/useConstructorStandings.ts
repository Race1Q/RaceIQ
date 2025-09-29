import { useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { supabase } from '../lib/supabase';

export interface ConstructorStandingRow {
  seasonYear: number;
  constructorId: number;
  constructorName: string;
  seasonPoints: number;
  seasonWins: number;
  position: number;
}

export const useConstructorStandings = (seasonYear: number) => {
  const [standings, setStandings] = useState<ConstructorStandingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from<ConstructorStandingRow>('constructor_standings_materialized')
          .select('*')
          .eq('seasonYear', seasonYear)
          .order('position', { ascending: true });

        if (error) throw error;
        setStandings(data || []);
      } catch (err: any) {
        const message = err?.message || 'Failed to fetch constructor standings.';
        setError(message);
        toast({
          title: 'Constructor standings error',
            description: message,
            status: 'error',
            duration: 5000,
            isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [seasonYear, toast]);

  return { standings, loading, error };
};
