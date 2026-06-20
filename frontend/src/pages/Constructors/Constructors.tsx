// src/pages/Constructors/Constructors.tsx
import { useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense } from 'react';
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
import { useConstructorStatsBulk } from '../../hooks/useConstructorStatsBulk';
import { useResolvedDefaultSeasonYear } from '../../hooks/useResolvedDefaultSeasonYear';
import { getCalendarSeasonYear } from '../../lib/seasonYear';
import { TEAM_META } from '../../theme/teamTokens';

// Import critical layout components normally (don't lazy load)
import ConstructorsSkeleton from './ConstructorsSkeleton';
import LayoutContainer from '../../components/layout/LayoutContainer';
import PageHeader from '../../components/layout/PageHeader';
import PendingSeasonDataBanner from '../../components/PendingSeasonDataBanner/PendingSeasonDataBanner';
import FilterTabs from '../../components/FilterTabs/FilterTabs';

// Lazy load ONLY TeamCard for better code splitting
const TeamCard = lazy(() => import('../../components/TeamCard/TeamCard').then(module => ({ default: module.TeamCard })));

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
    'RB': 'rb', // Fallback for duplicate entry
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

// Map a constructor nationality (adjective or ISO code) to an ISO 3166-1 alpha-2
// code so we can render an SVG flag (emoji flags don't render on Windows).
const getCountryCode = (nationality: string): string | undefined => {
  const map: Record<string, string> = {
    British: 'GB', English: 'GB',
    Italian: 'IT',
    German: 'DE',
    French: 'FR',
    Austrian: 'AT',
    Swiss: 'CH',
    American: 'US',
    Dutch: 'NL',
    Spanish: 'ES',
    Canadian: 'CA',
    Australian: 'AU',
    Japanese: 'JP',
    Indian: 'IN',
    Irish: 'IE',
    Russian: 'RU',
    Mexican: 'MX',
    Brazilian: 'BR',
    Belgian: 'BE',
    Swedish: 'SE',
    'New Zealander': 'NZ',
    Malaysian: 'MY',
    // Accept raw ISO alpha-2 codes too
    GB: 'GB', IT: 'IT', DE: 'DE', FR: 'FR', AT: 'AT', CH: 'CH', US: 'US',
    ES: 'ES', NL: 'NL', CA: 'CA', AU: 'AU', JP: 'JP',
  };
  return map[nationality];
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
  // Teams that actually competed in the selected season (season-driven "active" set),
  // derived from /api/constructors?year= so the page reflects the real grid each year
  // instead of the manually-maintained is_active flag.
  const [seasonTeamIds, setSeasonTeamIds] = useState<Set<number>>(new Set());
  const [seasonRaceCount, setSeasonRaceCount] = useState<number | null>(null);
  const { defaultSeasonYear, loading: resolvingDefaultSeason } = useResolvedDefaultSeasonYear();
  const [selectedSeason, setSelectedSeason] = useState<number>(getCalendarSeasonYear());
  const appliedDefaultSeason = useRef(false);

  useEffect(() => {
    if (!resolvingDefaultSeason && !appliedDefaultSeason.current) {
      appliedDefaultSeason.current = true;
      setSelectedSeason(defaultSeasonYear);
    }
  }, [resolvingDefaultSeason, defaultSeasonYear]);

  // Replace individual stats fetching with bulk stats
  const { 
    data: bulkStats, 
    loading: bulkStatsLoading, 
    error: bulkStatsError 
  } = useConstructorStatsBulk(selectedSeason, statusFilter === 'all');

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

  // Fetch the teams + race count for the selected season (season-driven active set).
  useEffect(() => {
    let alive = true;
    const fetchSeasonGrid = async () => {
      try {
        const [seasonTeams, seasonRaces] = await Promise.all([
          publicFetch(buildApiUrl(`/api/constructors?year=${selectedSeason}`)),
          publicFetch(buildApiUrl(`/api/races?year=${selectedSeason}`)),
        ]);
        if (!alive) return;
        setSeasonTeamIds(
          new Set(
            (Array.isArray(seasonTeams) ? seasonTeams : []).map((c: ApiConstructor) => c.id),
          ),
        );
        setSeasonRaceCount(Array.isArray(seasonRaces) ? seasonRaces.length : null);
      } catch {
        // Non-fatal: fall back to the is_active flag if the season grid can't load.
        if (alive) {
          setSeasonTeamIds(new Set());
          setSeasonRaceCount(null);
        }
      }
    };
    fetchSeasonGrid();
    return () => {
      alive = false;
    };
  }, [selectedSeason, publicFetch]);

  // Create stats map from bulk data
  const statsMap = useMemo(() => {
    if (!bulkStats) return new Map();
    
    const map = new Map();
    bulkStats.constructors.forEach(constructor => {
      map.set(constructor.constructorId, constructor.stats);
    });
    return map;
  }, [bulkStats]);

  // A team is "active" for the selected season if it appears in that season's grid.
  // Fall back to the is_active flag only when the season grid hasn't loaded.
  const isActiveTeam = useCallback(
    (c: ApiConstructor) => (seasonTeamIds.size > 0 ? seasonTeamIds.has(c.id) : c.is_active),
    [seasonTeamIds],
  );

  const filteredConstructors = useMemo(() => {
    let filtered: ApiConstructor[];

    if (!isAuthenticated) {
      filtered = constructors.filter((c) => isActiveTeam(c));
    } else {
      filtered = constructors.filter((c) => {
        const matchesStatus =
          statusFilter === 'all'
            ? true
            : statusFilter === 'active'
            ? isActiveTeam(c)
            : !isActiveTeam(c);

        const matchesSearch = c.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

        return matchesStatus && matchesSearch;
      });
    }

    // Deduplicate RB entries: prefer "RB F1 Team" or "Racing Bulls" over "RB"
    const hasRBF1Team = filtered.some(c => 
      c.name === 'RB F1 Team' || c.name === 'Racing Bulls'
    );
    const hasRB = filtered.some(c => c.name === 'RB');
    
    if (hasRBF1Team && hasRB) {
      // Filter out the duplicate "RB" entry when the proper name exists
      filtered = filtered.filter(c => c.name !== 'RB');
    }

    return filtered;
  }, [constructors, statusFilter, isAuthenticated, searchTerm, isActiveTeam]);

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
      const statsA = statsMap.get(a.id);
      const statsB = statsMap.get(b.id);
      const pa = statsA?.points ?? 0;
      const pb = statsB?.points ?? 0;
      return pb - pa;
    });
    return arr;
  }, [filteredConstructors, statsMap]);

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
      <PageHeader
        title="Constructors"
        subtitle="Explore F1 teams and constructors"
      />

      <LayoutContainer maxW="container.2xl" py={{ base: 3, md: 4 }}>
        <PendingSeasonDataBanner
          defaultSeasonYear={defaultSeasonYear}
          loading={resolvingDefaultSeason}
        />
      </LayoutContainer>

      {isAuthenticated && (
        <LayoutContainer>
          <VStack spacing={6} align="stretch">
            {/* Filter and info bar */}
            <Flex justify="space-between" align="center" flexDirection={{ base: 'column', md: 'row' }} gap={4}>
              {/* Filter tabs - left aligned */}
              <FilterTabs 
                value={statusFilter} 
                onChange={(newFilter) => {
                  setStatusFilter(newFilter);
                  if (newFilter === 'active') {
                    setSearchTerm('');
                  }
                }} 
              />
              
              {/* Broadcast-style stat bar - right aligned */}
              <HStack spacing={8} color="text-muted" fontSize="sm" fontFamily="heading">
                <Text>{selectedSeason} Season</Text>
                <Box w="1px" h="4" bg="border-primary" />
                <Text>{seasonTeamIds.size > 0 ? seasonTeamIds.size : '—'} Teams</Text>
                <Box w="1px" h="4" bg="border-primary" />
                <Text>{seasonRaceCount ?? '—'} Races</Text>
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
          {loading || (standingsLoading && isAuthenticated) || bulkStatsLoading ? (
            <ConstructorsSkeleton />
          ) : error || standingsError || bulkStatsError ? (
            <Text
              color="brand.redLight"
              textAlign="center"
              fontSize="1.2rem"
              p="xl"
            >
              {error || standingsError || bulkStatsError}
            </Text>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2 }} gap="lg">
              {sortedConstructors.map((constructor) => {
                const teamKey = getTeamKey(constructor.name);
                const isHistorical = !isActiveTeam(constructor);
                const carImage = isHistorical
                  ? '/assets/F1Car.png'
                  : (teamCarImages[constructor.name] || '/assets/default-car.png');
                const flagEmoji = getFlagEmoji(constructor.nationality);
                const countryCode = getCountryCode(constructor.nationality);

                // Get stats from bulk data instead of individual calls
                const bulkStats = statsMap.get(constructor.id);
                const displayPoints = bulkStats?.points ?? 0;
                const displayWins = bulkStats?.wins ?? 0;
                const displayPodiums = bulkStats?.podiums ?? 0;

                return (
                  <Suspense key={constructor.id} fallback={<TeamCardLoadingFallback />}>
                    <TeamCard
                      teamKey={teamKey}
                      teamName={constructor.name}
                      countryName={constructor.nationality}
                      countryCode={countryCode}
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