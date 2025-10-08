// src/pages/Constructors/Constructors.tsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  useToast,
  Box,
  Text,
  SimpleGrid,
  Container,
  Flex,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select'; // Assuming 'react-select' is used for the custom styled select
import F1LoadingSpinner from '../../components/F1LoadingSpinner/F1LoadingSpinner'; // Assuming this path
import { buildApiUrl } from '../../lib/api';
import { getTeamColor } from '../../lib/teamColors';
import { teamCarImages } from '../../lib/teamCars';
import { useConstructorStandings } from '../../hooks/useConstructorStandings';
import PageHeader from '../../components/layout/PageHeader';

// Interfaces
interface ApiConstructor {
  id: number;
  name: string;
  nationality: string;
  url: string;
  is_active: boolean;
}

interface Option {
  value: string;
  label: string;
}

type FilterOption = 'active' | 'historical' | 'all';

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

const statusOptions: Option[] = [
  { value: 'active', label: 'Active Teams' },
  { value: 'historical', label: 'Historical Teams' },
  { value: 'all', label: 'All Teams' },
];

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
        <Box bg="bg-surface" py={{ base: 4, md: 6 }}>
          <Container maxW="container.2xl" px={{ base: 4, md: 6 }}>
            <Flex
              gap={4}
              direction={{ base: 'column', md: 'row' }}
              w="full"
              align={{ base: 'stretch', md: 'center' }}
            >
              {(statusFilter === 'all' || statusFilter === 'historical') && (
                <Box maxW={{ base: 'full', md: '260px' }} w="100%">
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
              )}

              <Box
                maxW={{ base: 'full', md: '220px' }}
                w={{ base: 'full', md: '220px' }}
              >
                <Select
                  options={statusOptions}
                  value={
                    statusOptions.find((o) => o.value === statusFilter) || null
                  }
                  onChange={(option) => {
                    const newStatus = (option as Option).value as FilterOption;
                    setStatusFilter(newStatus);
                    if (newStatus === 'active') {
                      setSearchTerm('');
                    }
                  }}
                  placeholder="Filter by Status"
                  isClearable={false}
                  // This is a common pattern for styling 'react-select' with Chakra UI tokens
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      backgroundColor: '#0f0f0f', // bg-primary
                      borderColor: '#2d2d2d', // border-primary
                      color: 'white',
                    }),
                    menu: (provided) => ({
                      ...provided,
                      backgroundColor: '#0f0f0f',
                      color: 'white',
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      backgroundColor: state.isFocused ? '#2d2d2d' : '#0f0f0f',
                      color: 'white',
                    }),
                    singleValue: (provided) => ({
                      ...provided,
                      color: 'white',
                    }),
                  }}
                />
              </Box>
            </Flex>
          </Container>
        </Box>
      )}

      <Box bg="bg-primary" color="text-primary" py={{ base: 'md', md: 'lg' }}>
        <Container maxW="container.2xl" px={{ base: 4, md: 6 }}>
          {loading || (standingsLoading && isAuthenticated) ? (
            <F1LoadingSpinner text="Loading Constructors..." />
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
                const teamColor = getTeamColor(constructor.name);
                const gradientBg = `linear-gradient(135deg, #${teamColor} 0%, rgba(0,0,0,0.75) 100%)`;
                const carImage = teamCarImages[constructor.name];
                const standing = standingsMap.get(constructor.name);

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
                      }}
                      align="center"
                      justify="space-between"
                      _before={{
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                        background:
                          'radial-gradient(1200px 600px at 85% 30%, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 60%)',
                      }}
                    >
                      <Box textAlign="left" zIndex={1}>
                        <Text
                          fontWeight="bold"
                          fontSize="lg"
                          color="white"
                          fontFamily="heading"
                        >
                          {constructor.name}
                        </Text>
                        <Text color="white" opacity={0.8}>
                          {getFlagEmoji(constructor.nationality)}{' '}
                          {constructor.nationality}
                        </Text>
                        <Flex
                          mt={3}
                          gap={4}
                          color="whiteAlpha.900"
                          fontFamily="heading"
                          fontSize="sm"
                        >
                          <Box>
                            <Text opacity={0.8}>Position</Text>
                            <Text fontWeight="bold">
                              {standing?.position ?? '—'}
                            </Text>
                          </Box>
                          <Box>
                            <Text opacity={0.8}>Points</Text>
                            <Text fontWeight="bold">
                              {standing?.seasonPoints ?? '—'}
                            </Text>
                          </Box>
                        </Flex>
                      </Box>

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

                      <Box
                        position="absolute"
                        right={-20}
                        top={-20}
                        w={'220px'}
                        h={'220px'}
                        borderRadius="full"
                        bg="whiteAlpha.100"
                        filter="blur(30px)"
                      />
                    </Flex>
                  </Box>
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