// src/pages/Constructors/Constructors.tsx
import { useState, useEffect, useCallback, useMemo } from 'react';
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
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import ConstructorsSkeleton from './ConstructorsSkeleton';
import LayoutContainer from '../../components/layout/LayoutContainer';
import { buildApiUrl } from '../../lib/api';
import { teamCarImages } from '../../lib/teamCars';
import { useConstructorStandings } from '../../hooks/useConstructorStandings';
import PageHeader from '../../components/layout/PageHeader';
import FilterTabs from '../../components/FilterTabs/FilterTabs';
import { TeamCard } from '../../components/TeamCard/TeamCard';
import { TEAM_META } from '../../theme/teamTokens';

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
    'Renault': 'alpine',
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

  return (
    <Box>
      <PageHeader
        title="Constructors"
        subtitle="Explore F1 teams and constructors"
      />

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
      )}

      <Box bg="bg-primary" color="text-primary" py={{ base: 'md', md: 'lg' }}>
        <Container maxW="container.2xl" px={{ base: 4, md: 6 }}>
          {loading || (standingsLoading && isAuthenticated) ? (
            <ConstructorsSkeleton />
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
                const isHistorical = teamKey === 'historical';
                const carImage = isHistorical 
                  ? '/assets/F1Car.png' 
                  : (teamCarImages[constructor.name] || '/assets/default-car.png');
                const standing = standingsMap.get(constructor.name);
                const flagEmoji = getFlagEmoji(constructor.nationality);

                return (
                  <TeamCard
                    key={constructor.id}
                    teamKey={teamKey}
                    teamName={constructor.name}
                    countryName={constructor.nationality}
                    countryFlagEmoji={flagEmoji}
                    points={standing?.seasonPoints ?? 0}
                    maxPoints={500} // Max points for progress bar
                    wins={standing?.seasonWins ?? 0}
                    podiums={standing?.seasonPodiums ?? 0}
                    carImage={carImage}
                    onClick={() => navigate(`/constructors/${constructor.id}`)}
                  />
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