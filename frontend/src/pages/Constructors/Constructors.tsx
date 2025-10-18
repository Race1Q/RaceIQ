// src/pages/Constructors/Constructors.tsx
import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import {
  useToast,
  Box,
  Text,
  SimpleGrid,
  Container,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  HStack,
  VStack,
  Spinner,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../../lib/api';
import { teamCarImages } from '../../lib/teamCars';
import { useConstructorStandings } from '../../hooks/useConstructorStandings';
import { TEAM_META } from '../../theme/teamTokens';

// Lazy load non-critical components for better code splitting
const TeamCard = lazy(() => import('../../components/TeamCard/TeamCard').then(module => ({ default: module.TeamCard })));
const ConstructorsSkeleton = lazy(() => import('./ConstructorsSkeleton'));
const LayoutContainer = lazy(() => import('../../components/layout/LayoutContainer'));
const PageHeader = lazy(() => import('../../components/layout/PageHeader'));
const FilterTabs = lazy(() => import('../../components/FilterTabs/FilterTabs'));

// Interfaces
interface ApiConstructor {
  id: number;
  name: string;
  nationality: string;
  url: string;
  is_active: boolean;
}



type FilterOption = 'active' | 'historical' | 'all';

// Map constructor names to team keys
const getTeamKey = (constructorName: string): keyof typeof TEAM_META => {
  const nameMap: Record<string, keyof typeof TEAM_META> = {
    // Current Teams (2024+)
    'Red Bull Racing': 'red_bull',
    'Red Bull': 'red_bull',
    'Ferrari': 'ferrari',
    'Mercedes': 'mercedes',
    'McLaren': 'mclaren',
    'Aston Martin': 'aston_martin',
    'Alpine F1 Team': 'alpine',
    'Alpine': 'alpine',
    'RB F1 Team': 'rb',
    'Racing Bulls': 'rb',
    'Sauber': 'sauber',
    'Kick Sauber': 'sauber',
    'Williams': 'williams',
    'Haas F1 Team': 'haas',
    'Haas': 'haas',
    // Recent Historical Teams
    'AlphaTauri': 'historical',
    'Alfa Romeo': 'historical',
    'Racing Point': 'aston_martin',
    'Force India': 'aston_martin',
    'Renault': 'renault',
    'Lotus F1': 'alpine',
    'Toro Rosso': 'rb',
  };
  
  const teamKey = nameMap[constructorName] || 'historical'; // fallback to historical theme
  return teamKey;
};

// Country flag emoji mapping
const getFlagEmoji = (nationality: string): string => {
  const flags: Record<string, string> = {
    FR: '🇫🇷',
    GB: '🇬🇧',
    IT: '🇮🇹',
    US: '🇺🇸',
    DE: '🇩🇪',
    AT: '🇦🇹',
    CH: '🇨🇭',
    ES: '🇪🇸',
    CA: '🇨🇦',
    AU: '🇦🇺',
    JP: '🇯🇵',
    BR: '🇧🇷',
    MX: '🇲🇽',
    FI: '🇫🇮',
    DK: '🇩🇰',
    MC: '🇲🇨',
    TH: '🇹🇭',
    NL: '🇳🇱',
    Austrian: '🇦🇹',
    Italian: '🇮🇹',
    German: '🇩🇪',
    British: '🇬🇧',
    French: '🇫🇷',
    Swiss: '🇨🇭',
    American: '🇺🇸',
    Dutch: '🇳🇱',
    Spanish: '🇪🇸',
    Canadian: '🇨🇦',
    Australian: '🇦🇺',
    Japanese: '🇯🇵',
    Brazilian: '🇧🇷',
    Mexican: '🇲🇽',
    Finnish: '🇫🇮',
    Danish: '🇩🇰',
    Monegasque: '🇲🇨',
    Thai: '🇹🇭',
  };
  return flags[nationality] || '🏁';
};


const Constructors = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth0();
  const [constructors, setConstructors] = useState<ApiConstructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<FilterOption>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeason] = useState<number>(new Date().getFullYear());
  const [careerStatsMap, setCareerStatsMap] = useState<Map<number, { points: number; wins: number; podiums: number }>>(new Map());

  // Preload critical car images for better LCP - only first 2 for faster initial load
  useEffect(() => {
    const criticalImages = [
      '/assets/2025redbullcarright-D1HxcSsM.png',
      '/assets/2025mclarencarright-DV8w4W6I.png',
    ];
    
    // Preload first 2 images immediately
    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      link.fetchPriority = 'high';
      document.head.appendChild(link);
    });

    // Preload remaining images after a short delay
    const timer = setTimeout(() => {
      const secondaryImages = [
        '/assets/2025ferraricarright-8vGLdqkm.png',
        '/assets/2025mercedescarright-DR3X3xFa.png',
      ];
      secondaryImages.forEach(src => {
        const img = new Image();
        img.src = src;
      });
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const {
    standings: constructorStandings,
    loading: standingsLoading,
    error: standingsError,
  } = useConstructorStandings(selectedSeason, { enabled: isAuthenticated });

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
          buildApiUrl('/api/constructors/all')
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

  // Fetch career stats for historical constructors - ONLY when viewing historical/all
  const fetchCareerStats = useCallback(async () => {
    // Only fetch if user is viewing historical or all teams
    if (statusFilter === 'active') return;
    if (!constructors.length) return;
    
    const historicalConstructors = constructors.filter(c => !c.is_active);
    if (historicalConstructors.length === 0) return;

    try {
      const statsPromises = historicalConstructors.map(async (constructor) => {
        try {
          const statsData = await publicFetch(
            buildApiUrl(`/api/constructors/${constructor.id}/stats`)
          );
          return {
            id: constructor.id,
            stats: {
              points: statsData.career.points || 0,
              wins: statsData.career.wins || 0,
              podiums: statsData.career.podiums || 0,
            },
          };
        } catch (error) {
          console.error(`Error fetching career stats for constructor ${constructor.id}:`, error);
          return null;
        }
      });

      const results = await Promise.all(statsPromises);
      const newStatsMap = new Map();
      results.forEach(result => {
        if (result) {
          newStatsMap.set(result.id, result.stats);
        }
      });
      setCareerStatsMap(newStatsMap);
    } catch (error) {
      console.error('Error fetching career stats:', error);
    }
  }, [constructors, publicFetch, statusFilter]);

  useEffect(() => {
    // Only fetch historical stats when needed
    if (statusFilter !== 'active') {
      fetchCareerStats();
    }
  }, [fetchCareerStats, statusFilter]);

  const filteredConstructors = useMemo(() => {
    if (!isAuthenticated) {
      return constructors.filter((c) => c.is_active);
    }
    return constructors.filter((c) => {
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
          ? c.is_active
          : !c.is_active;

      const matchesSearch = c.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [constructors, statusFilter, isAuthenticated, searchTerm]);

  const standingsMap = useMemo(() => {
    const map = new Map();
    constructorStandings.forEach((standing) => {
      map.set(standing.constructorName, standing);
    });
    return map;
  }, [constructorStandings]);

  const sortedConstructors = useMemo(() => {
    const arr = [...filteredConstructors];
    arr.sort((a, b) => {
      const pa = standingsMap.get(a.name)?.seasonPoints ?? 0;
      const pb = standingsMap.get(b.name)?.seasonPoints ?? 0;
      return pb - pa;
    });
    return arr;
  }, [filteredConstructors, standingsMap]);

  // Card click handler with useCallback for better performance
  const handleCardClick = useCallback((constructorId: number) => {
    navigate(`/constructors/${constructorId}`);
  }, [navigate]);

  // Team card loading fallback
  const TeamCardLoadingFallback = () => (
    <Box 
      display="flex" 
      alignItems="center" 
      justifyContent="center" 
      h="100%" 
      minH="200px"
      bg="bg-surface"
      borderRadius="2xl"
      border="1px solid"
      borderColor="border-primary"
    >
      <Spinner size="sm" color="brand.red" />
    </Box>
  );

  return (
    <Box>
      <Suspense fallback={<Box h="120px" bg="bg-surface-raised" />}>
        <PageHeader
          title="Constructors"
          subtitle="Explore F1 teams and constructors"
        />
      </Suspense>

      {isAuthenticated && (
        <Suspense fallback={<Box h="100px" />}>
          <LayoutContainer>
            <VStack spacing={6} align="stretch">
              {/* Filter and info bar */}
              <Flex justify="space-between" align="center" flexDirection={{ base: 'column', md: 'row' }} gap={4}>
                {/* Filter tabs - left aligned */}
                <Suspense fallback={<Box h="52px" w="300px" bg="bg-surface" borderRadius="full" />}>
                  <FilterTabs 
                    value={statusFilter} 
                    onChange={(newFilter) => {
                      setStatusFilter(newFilter);
                      if (newFilter === 'active') {
                        setSearchTerm('');
                      }
                    }} 
                  />
                </Suspense>
                
                {/* Broadcast-style stat bar - right aligned */}
                <HStack spacing={8} color="text-muted" fontSize="sm" fontFamily="heading">
                  <Text>2025 Season</Text>
                  <Box w="1px" h="4" bg="border-primary" />
                  <Text>10 Teams</Text>
                  <Box w="1px" h="4" bg="border-primary" />
                  <Text>24 Races</Text>
                </HStack>
              </Flex>

              {/* Search bar for historical/all */}
              {(statusFilter === 'all' || statusFilter === 'historical') && (
                <Flex justify="flex-start">
                  <Box maxW="400px" w="100%">
                    <InputGroup>
                      <Input
                        placeholder="Search by name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        bg="bg-primary"
                        borderColor="border-primary"
                      />
                      {searchTerm && (
                        <InputRightElement>
                          <IconButton
                            aria-label="Clear search"
                            icon={<CloseIcon />}
                            size="sm"
                            onClick={() => setSearchTerm('')}
                            variant="ghost"
                          />
                        </InputRightElement>
                      )}
                    </InputGroup>
                  </Box>
                </Flex>
              )}
            </VStack>
          </LayoutContainer>
        </Suspense>
      )}

      <Box 
        color="text-primary" 
        py={{ base: 'md', md: 'lg' }}
        minH="100vh"
        sx={{
          background: `
            radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0),
            linear-gradient(45deg, #0a0a0a 25%, transparent 25%, transparent 75%, #0a0a0a 75%),
            linear-gradient(-45deg, #0a0a0a 25%, transparent 25%, transparent 75%, #0a0a0a 75%)
          `,
          backgroundSize: '20px 20px, 20px 20px, 20px 20px',
          backgroundColor: '#0a0a0a',
          willChange: 'auto',
          contain: 'layout style paint',
          _light: {
            background: `
              radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0),
              linear-gradient(45deg, #f8f9fa 25%, transparent 25%, transparent 75%, #f8f9fa 75%),
              linear-gradient(-45deg, #f8f9fa 25%, transparent 25%, transparent 75%, #f8f9fa 75%)
            `,
            backgroundSize: '20px 20px, 20px 20px, 20px 20px',
            backgroundColor: '#f8f9fa',
          }
        }}
      >
        <Container maxW="container.2xl" px={{ base: 4, md: 6 }}>
          {loading || (standingsLoading && isAuthenticated) ? (
            <Suspense fallback={<Box minH="60vh" display="flex" alignItems="center" justifyContent="center"><Spinner /></Box>}>
              <ConstructorsSkeleton />
            </Suspense>
          ) : error || standingsError ? (
            <Text
              color="brand.redLight"
              textAlign="center"
              fontSize="1.2rem"
              p="xl"
            >
              {error || standingsError}
            </Text>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2 }} gap="lg">
              {sortedConstructors.map((constructor) => {
                const teamKey = getTeamKey(constructor.name);
                const isHistorical = !constructor.is_active;
                const carImage = isHistorical 
                  ? '/assets/F1Car.png' 
                  : (teamCarImages[constructor.name] || '/assets/default-car.png');
                const standing = standingsMap.get(constructor.name);
                const flagEmoji = getFlagEmoji(constructor.nationality);

                // Use career stats for historical teams, season stats for active teams
                const careerStats = careerStatsMap.get(constructor.id);
                const displayPoints = isHistorical && careerStats ? careerStats.points : (standing?.seasonPoints ?? 0);
                const displayWins = isHistorical && careerStats ? careerStats.wins : (standing?.seasonWins ?? 0);
                const displayPodiums = isHistorical && careerStats ? careerStats.podiums : (standing?.seasonPodiums ?? 0);

                return (
                  <Suspense key={constructor.id} fallback={<TeamCardLoadingFallback />}>
                    <TeamCard
                      teamKey={teamKey}
                      teamName={constructor.name}
                      countryName={constructor.nationality}
                      countryFlagEmoji={flagEmoji}
                      points={displayPoints}
                      maxPoints={isHistorical ? Math.max(1000, displayPoints) : 500}
                      wins={displayWins}
                      podiums={displayPodiums}
                      carImage={carImage}
                      isHistorical={isHistorical}
                      onClick={() => handleCardClick(constructor.id)}
                    />
                  </Suspense>
                );
              })}
            </SimpleGrid>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default Constructors;