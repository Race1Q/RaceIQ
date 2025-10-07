// src/pages/Constructors/Constructors.tsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  useToast,
  Box,
  Text,
  Container,
  SimpleGrid,
  Flex,
  Image,
  Input,
} from '@chakra-ui/react';
import { Select } from 'chakra-react-select';
import { InputGroup, InputRightElement, IconButton } from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';
import F1LoadingSpinner from '../../components/F1LoadingSpinner/F1LoadingSpinner';
import { buildApiUrl } from '../../lib/api';
import { getTeamColor } from '../../lib/teamColors';
import { teamCarImages } from '../../lib/teamCars';
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


const Constructors = () => {
  const toast = useToast();
  const { isAuthenticated } = useAuth0();
  const [constructors, setConstructors] = useState<ApiConstructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'all'>('active');

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



  const statusOptions: Option[] = [
    { value: 'active', label: 'Active Teams' },
    { value: 'inactive', label: 'Inactive Teams' },
    { value: 'all', label: 'All Teams' },
  ];

  // Apply filters based on authentication status
  const filteredConstructors = useMemo(() => {
    if (!isAuthenticated) {
      // Non-logged-in users: show only active constructors
      return constructors.filter(c => c.is_active);
    }
    
    // Logged-in users: apply search and status filters
    return constructors.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.nationality.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
          ? c.is_active
          : !c.is_active;

      return matchesSearch && matchesStatus;
    });
  }, [constructors, searchTerm, statusFilter, isAuthenticated]);

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
              {error}
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
                  <Link
                    key={constructor.id}
                    to={`/constructors/${constructor.id}`}
                    state={{ constructorId: constructor.id }}
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
            </>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default Constructors;
