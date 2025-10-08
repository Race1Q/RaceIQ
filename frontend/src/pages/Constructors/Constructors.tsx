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
import PageLoadingOverlay from '../../components/loaders/PageLoadingOverlay';
import { buildApiUrl } from '../../lib/api';
import { getTeamColor } from '../../lib/teamColors';
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
      />
      
      {/* Filters Section - Only for logged-in users */}
      {isAuthenticated && (
        <Box bg="bg-primary" color="text-primary" py={{ base: 4, md: 6 }}>
          <Container maxW="container.2xl" px={{ base: 4, md: 6 }}>
            <Flex gap={4} direction={{ base: 'column', md: 'row' }} w="full" align={{ base: 'stretch', md: 'center' }}>

              {/* Left: Search - Show for All Teams and Inactive Teams */}
              {(statusFilter === 'all' || statusFilter === 'inactive') && (
                <Box maxW={{ base: 'full', md: '260px' }} w="100%">
                  <InputGroup>
                    <Input
                      placeholder="Search by name"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      bg="gray.700"
                      color="white"
                    />
                    {searchTerm && (
                      <InputRightElement>
                        <IconButton
                          aria-label="Clear search"
                          icon={<CloseIcon />}
                          size="sm"
                          onClick={() => setSearchTerm('')}
                          bg="gray.600"
                          _hover={{ bg: 'gray.500' }}
                        />
                      </InputRightElement>
                    )}
                  </InputGroup>
                </Box>
              )}
              

              {/* Status Filter */}
              <Box maxW={{ base: 'full', md: '220px' }} w={{ base: 'full', md: '220px' }}>
                <Select
                  options={statusOptions}
                  value={statusOptions.find((o) => o.value === statusFilter) || null}
                  onChange={(option) => {
                    const newStatus = (option as Option).value as 'active' | 'inactive' | 'all';
                    setStatusFilter(newStatus);
                    // Clear search when switching to 'active' (only active teams don't show search)
                    if (newStatus === 'active') {
                      setSearchTerm('');
                    }
                  }}
                  placeholder="Filter by Status"
                  isClearable={false}
                  chakraStyles={{
                    control: (provided) => ({
                      ...provided,
                      bg: 'gray.700',
                      color: 'white',
                      borderColor: 'gray.600',
                    }),
                    menu: (provided) => ({ ...provided, bg: 'gray.700', color: 'white' }),
                    option: (provided, state) => ({
                      ...provided,
                      bg: state.isFocused ? 'gray.600' : 'gray.700',
                      color: 'white',
                    }),
                    singleValue: (provided) => ({ ...provided, color: 'white' }),
                  }}
                />
              </Box>
            </Flex>
          </Container>
        </Box>
      )}
      
      <Box bg="bg-primary" color="text-primary" py={{ base: 'md', md: 'lg' }}>
        <Container maxW="container.2xl" px={{ base: 4, md: 6 }}>
          {loading && <F1LoadingSpinner text="Loading Constructors..." />}
          {error && (
            <Text color="brand.redLight" textAlign="center" fontSize="1.2rem" p="xl">
              {error || standingsError}
            </Text>
          )}

          {!loading && !error && (
            <>
              {/* Constructors Grid */}
            <SimpleGrid columns={{ base: 1, md: 2 }} gap="lg">
              {filteredConstructors.map((constructor) => {
                const teamColor = getTeamColor(constructor.name);
                const gradientBg = `linear-gradient(135deg, #${teamColor} 0%, rgba(0,0,0,0.75) 100%)`;
                const carImage = teamCarImages[constructor.name];

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
                    <Flex
                      position="relative"
                      bgGradient={gradientBg}
                      borderRadius="lg"
                      p={6}
                      overflow="hidden"
                      transition="all 0.2s ease-in-out"
                      _hover={{
                        transform: 'translateY(-4px)',
                        boxShadow: 'lg',
                        cursor: 'pointer',
                      }}
                      align="center"
                      justify="space-between"
                      _before={{
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                        background: 'radial-gradient(1200px 600px at 85% 30%, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 60%)'
                      }}
                    >
                      {/* Left: Info */}
                      <Box textAlign="left" zIndex={1}>
                        <Text fontWeight="bold" fontSize="lg" color="white" fontFamily="heading">
                          {constructor.name}
                        </Heading>
                        <Text color={fallbackMeta.textOn} opacity={0.8}>
                          {getFlagEmoji(constructor.nationality)} {constructor.nationality}
                        </Text>
                        <Text fontSize="sm" color="whiteAlpha.800" fontFamily="body">
                          {constructor.nationality}
                        </Text>
                        {/* Key stats preview (placeholder if real API not wired here) */}
                        <Flex mt={3} gap={4} color="whiteAlpha.900" fontFamily="heading" fontSize="sm">
                          <Box>
                            <Text opacity={0.8}>Position</Text>
                            <Text fontWeight="bold">—</Text>
                          </Box>
                          <Box>
                            <Text opacity={0.8}>Points</Text>
                            <Text fontWeight="bold">—</Text>
                          </Box>
                        </Flex>
                      </Box>

                      {/* Right: Car Image */}
                      {carImage && (
                        <Image
                          src={carImage}
                          alt={`${constructor.name} car`}
                          position="relative"
                          maxH={{ base: '90px', md: '140px' }}
                          maxW={{ base: '200px', md: '320px' }}
                          w="auto"
                          h="auto"
                          objectFit="contain"
                          ml={{ base: 2, md: 4 }}
                          flexShrink={0}
                          zIndex={1}
                        />
                      )}

                      {/* Decorative overflow shard/right glow */}
                      <Box position="absolute" right={-20} top={-20} w={"220px"} h={"220px"} borderRadius="full" bg="whiteAlpha.100" filter="blur(30px)" />
                    </Flex>
                  </Link>
                );
              })}
            </SimpleGrid>
          )}
      </LayoutContainer>
    </Box>
  );
};

export default Constructors;
