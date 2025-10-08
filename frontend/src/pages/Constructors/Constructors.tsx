// src/pages/Constructors/Constructors.tsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  useToast,
  Box,
  Text,
  SimpleGrid,
  VStack,
  Heading,
} from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import F1LoadingSpinner from '../../components/F1LoadingSpinner/F1LoadingSpinner';
import { buildApiUrl } from '../../lib/api';
import { teamCarImages } from '../../lib/teamCars';
import { TeamCard } from '../../components/TeamCard/TeamCard';
import { SegmentTabs } from '../../components/SegmentTabs/SegmentTabs';
import { normalizeTeamName, getTeamMeta } from '../../theme/teamTokens';
import { useConstructorStandings } from '../../hooks/useConstructorStandings';
import PageHeader from '../../components/layout/PageHeader';
import LayoutContainer from '../../components/layout/LayoutContainer';

// Interfaces
interface ApiConstructor {
  id: number;
  name: string;
  nationality: string;
  url: string;
  is_active: boolean;
}

type FilterOption = "active" | "historical" | "all";

// Country flag emoji mapping - handles both ISO codes and full names
const getFlagEmoji = (nationality: string): string => {
  const flags: Record<string, string> = {
    // ISO Country Codes (what the API returns)
    'FR': '🇫🇷',  // France
    'GB': '🇬🇧',  // United Kingdom
    'IT': '🇮🇹',  // Italy
    'US': '🇺🇸',  // United States
    'DE': '🇩🇪',  // Germany
    'AT': '🇦🇹',  // Austria
    'CH': '🇨🇭',  // Switzerland
    'ES': '🇪🇸',  // Spain
    'CA': '🇨🇦',  // Canada
    'AU': '🇦🇺',  // Australia
    'JP': '🇯🇵',  // Japan
    'BR': '🇧🇷',  // Brazil
    'MX': '🇲🇽',  // Mexico
    'FI': '🇫🇮',  // Finland
    'DK': '🇩🇰',  // Denmark
    'MC': '🇲🇨',  // Monaco
    'TH': '🇹🇭',  // Thailand
    'NL': '🇳🇱',  // Netherlands
    
    // Full country names (fallback)
    'Austrian': '🇦🇹',
    'Italy': '🇮🇹',
    'Italian': '🇮🇹',
    'Germany': '🇩🇪',
    'German': '🇩🇪',
    'United Kingdom': '🇬🇧',
    'British': '🇬🇧',
    'UK': '🇬🇧',
    'France': '🇫🇷',
    'French': '🇫🇷',
    'Switzerland': '🇨🇭',
    'Swiss': '🇨🇭',
    'United States': '🇺🇸',
    'American': '🇺🇸',
    'USA': '🇺🇸',
    'Netherlands': '🇳🇱',
    'Dutch': '🇳🇱',
    'Spain': '🇪🇸',
    'Spanish': '🇪🇸',
    'Canada': '🇨🇦',
    'Canadian': '🇨🇦',
    'Australia': '🇦🇺',
    'Australian': '🇦🇺',
    'Japan': '🇯🇵',
    'Japanese': '🇯🇵',
    'Brazil': '🇧🇷',
    'Brazilian': '🇧🇷',
    'Mexico': '🇲🇽',
    'Mexican': '🇲🇽',
    'Finland': '🇫🇮',
    'Finnish': '🇫🇮',
    'Denmark': '🇩🇰',
    'Danish': '🇩🇰',
    'Monaco': '🇲🇨',
    'Monegasque': '🇲🇨',
    'Thailand': '🇹🇭',
    'Thai': '🇹🇭',
  };
  
  // Try exact match first (handles both ISO codes and full names)
  if (flags[nationality]) {
    return flags[nationality];
  }
  
  // Try case-insensitive match
  const lowerNationality = nationality.toLowerCase();
  for (const [key, flag] of Object.entries(flags)) {
    if (key.toLowerCase() === lowerNationality) {
      return flag;
    }
  }
  
  // Try partial match
  for (const [key, flag] of Object.entries(flags)) {
    if (key.toLowerCase().includes(lowerNationality) || lowerNationality.includes(key.toLowerCase())) {
      return flag;
    }
  }
  
  // Fallback to F1 flag
  return '🏁';
};

const Constructors = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth0();
  const [constructors, setConstructors] = useState<ApiConstructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<FilterOption>('active');
  const [selectedSeason] = useState<number>(new Date().getFullYear());
  
  // Get real constructor standings data (skip when logged out)
  const { standings: constructorStandings, loading: standingsLoading, error: standingsError } = useConstructorStandings(selectedSeason, { enabled: isAuthenticated });

  const publicFetch = useCallback(async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Failed to fetch data: ${response.status} ${response.statusText} - ${errorBody}`
      );
    }
    return response.json();
  }, []);

  useEffect(() => {
    const fetchConstructors = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiConstructors: ApiConstructor[] = await publicFetch(
          buildApiUrl('/api/constructors')
        );
        setConstructors(apiConstructors);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unexpected error occurred.';
        setError(errorMessage);
        toast({
          title: 'Error fetching constructors',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchConstructors();
  }, [publicFetch, toast]);

  // Apply filters based on authentication status
  const filteredConstructors = useMemo(() => {
    if (!isAuthenticated) {
      // Non-logged-in users: show only active constructors
      return constructors.filter(c => c.is_active);
    }
    
    // Logged-in users: apply status filters
    return constructors.filter((c) => {
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
          ? c.is_active
          : !c.is_active;

      return matchesStatus;
    });
  }, [constructors, statusFilter, isAuthenticated]);

  // Calculate max points for progress bars from real data
  const maxPoints = useMemo(() => {
    if (constructorStandings.length > 0) {
      return Math.max(...constructorStandings.map(s => s.seasonPoints), 1);
    }
    return 100; // fallback
  }, [constructorStandings]);

  // Create a map of constructor standings for easy lookup
  const standingsMap = useMemo(() => {
    const map = new Map();
    constructorStandings.forEach(standing => {
      map.set(standing.constructorName, standing);
    });
    return map;
  }, [constructorStandings]);

  // Sort constructors by points (descending) using standings data
  const sortedConstructors = useMemo(() => {
    const arr = [...filteredConstructors];
    arr.sort((a, b) => {
      const pa = standingsMap.get(a.name)?.seasonPoints ?? 0;
      const pb = standingsMap.get(b.name)?.seasonPoints ?? 0;
      return pb - pa;
    });
    return arr;
  }, [filteredConstructors, standingsMap]);

  return (
    <Box>
      <PageHeader 
        title="Constructors" 
        subtitle="Explore F1 teams and constructors"
        rightContent={
          isAuthenticated ? (
            <VStack align="end" spacing={2}>
              <SegmentTabs value={statusFilter} onChange={setStatusFilter} />
              <Text fontSize="sm" color="text-muted">
                {selectedSeason} Season · {filteredConstructors.filter(c => c.is_active).length} Teams · 24 Races
              </Text>
            </VStack>
          ) : (
            <Text fontSize="sm" color="text-muted">
              {selectedSeason} Season · {filteredConstructors.filter(c => c.is_active).length} Teams · 24 Races
            </Text>
          )
        }
      />
      
      <LayoutContainer maxW="1600px">

          {/* Loading & Error States */}
          {(loading || standingsLoading) && <F1LoadingSpinner text="Loading Constructors..." />}
          
          {(error || standingsError) && (
            <Text color="brand.redLight" textAlign="center" fontSize="1.2rem" p="xl">
              {error || standingsError}
            </Text>
          )}

          {/* Team grid */}
          {!loading && !error && !standingsLoading && !standingsError && (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {sortedConstructors.map((constructor) => {
                const teamKey = normalizeTeamName(constructor.name);
                const carImage = teamCarImages[constructor.name] || '/assets/default-car.png';
                
                // Get real standings data for this constructor
                const standing = standingsMap.get(constructor.name);
                
                // If we have a valid teamKey, use TeamCard
                if (teamKey) {
                  return (
                    <TeamCard
                      key={constructor.id}
                      teamKey={teamKey}
                      countryName={constructor.nationality}
                      points={standing?.seasonPoints || 0}
                      maxPoints={maxPoints}
                      wins={standing?.seasonWins || 0}
                      podiums={standing?.seasonPodiums || 0}
                      carImage={carImage}
                      onClick={() => navigate(`/constructors/${constructor.id}`)}
                    />
                  );
                }
                
                // Fallback for historical/unknown teams without teamKey
                const fallbackMeta = getTeamMeta(constructor.name);
                return (
                  <Box
                    key={constructor.id}
                    onClick={() => navigate(`/constructors/${constructor.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate(`/constructors/${constructor.id}`);
                      }
                    }}
                    cursor="pointer"
                  >
                    <Box
                      position="relative"
                      overflow="hidden"
                      rounded="2xl"
                      px={{ base: 4, md: 6 }}
                      py={{ base: 5, md: 6 }}
                      bgGradient={fallbackMeta.gradient}
                      border="1px solid"
                      borderColor="whiteAlpha.150"
                      boxShadow="0 8px 30px rgba(0,0,0,0.45)"
                      _hover={{ 
                        borderColor: "whiteAlpha.300",
                        transform: "translateY(-4px)",
                      }}
                      transition="all 0.2s ease"
                    >
                      <VStack align="start" spacing={2}>
                        <Heading size="md" color={fallbackMeta.textOn}>
                          {constructor.name}
                        </Heading>
                        <Text color={fallbackMeta.textOn} opacity={0.8}>
                          {getFlagEmoji(constructor.nationality)} {constructor.nationality}
                        </Text>
                      </VStack>
                    </Box>
                  </Box>
                );
              })}
            </SimpleGrid>
          )}
      </LayoutContainer>
    </Box>
  );
};

export default Constructors;
