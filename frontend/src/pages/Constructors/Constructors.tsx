// src/pages/Constructors/Constructors.tsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  useToast,
  Box,
  Text,
  Container,
  SimpleGrid,
  Flex,
  Input,
  Select,
  Image,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import F1LoadingSpinner from '../../components/F1LoadingSpinner/F1LoadingSpinner';
import { buildApiUrl } from '../../lib/api';
import { teamColors } from '../../lib/teamColors';
import { teamCarImages } from '../../lib/teamCars';

// Interfaces
interface ApiConstructor {
  id: number;
  name: string;
  nationality: string;
  url: string;
  is_active: boolean;
}

const Constructors = () => {
  const toast = useToast();
  const [constructors, setConstructors] = useState<ApiConstructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNationality, setSelectedNationality] = useState('');
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

  // Unique nationalities for filter
  const nationalityOptions = useMemo(() => {
    const unique = Array.from(new Set(constructors.map((c) => c.nationality)));
    return unique.sort();
  }, [constructors]);

  // Apply filters
  const filteredConstructors = useMemo(() => {
    return constructors.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.nationality.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesNationality = selectedNationality ? c.nationality === selectedNationality : true;

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
          ? c.is_active
          : !c.is_active;

      return matchesSearch && matchesNationality && matchesStatus;
    });
  }, [constructors, searchTerm, selectedNationality, statusFilter]);

  return (
    <Box bg="bg-primary" color="text-primary" minH="100vh" py="lg">
      <Container maxW="1600px">
        {loading && <F1LoadingSpinner text="Loading Constructors..." />}
        {error && (
          <Text color="brand.redLight" textAlign="center" fontSize="1.2rem" p="xl">
            {error}
          </Text>
        )}

        {!loading && !error && (
          <>
            {/* Header with Search, Title, Filters */}
            <Flex justify="space-between" align="center" mb="xl" wrap="wrap" gap={4}>
              {/* Left: Search */}
              <Box maxW="260px" w="100%">
                <Input
                  placeholder="Search by name or nationality"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  bg="gray.700"
                  color="white"
                />
              </Box>

              {/* Center: Title */}
              <Text fontSize="2xl" fontWeight="bold" fontFamily="heading">
                Constructors
              </Text>

              {/* Right: Filters */}
              <Flex gap={4}>
                {/* Nationality Filter */}
                <Box maxW="220px" w="100%">
                  <Select
                    placeholder="Choose Nationality"
                    value={selectedNationality}
                    onChange={(e) => setSelectedNationality(e.target.value)}
                    bg="gray.700"
                    color="white"
                  >
                    {nationalityOptions.map((nat) => (
                      <option key={nat} value={nat}>
                        {nat}
                      </option>
                    ))}
                  </Select>
                </Box>

                {/* Status Filter */}
                <Box maxW="200px" w="100%">
                  <Select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value as 'active' | 'inactive' | 'all')
                    }
                    bg="gray.700"
                    color="white"
                  >
                    <option value="active">Active Teams</option>
                    <option value="inactive">Inactive Teams</option>
                    <option value="all">All Teams</option>
                  </Select>
                </Box>
              </Flex>
            </Flex>

            {/* Constructors Grid */}
            <SimpleGrid columns={{ base: 1, md: 2 }} gap="lg">
              {filteredConstructors.map((constructor) => {
                const teamColor = teamColors[constructor.name] || 'FF1801';
                const gradientBg = `linear-gradient(135deg, #${teamColor} 0%, rgba(0,0,0,0.6) 100%)`;
                const carImage = teamCarImages[constructor.name];

                return (
                  <Link
                    key={constructor.id}
                    to={`/constructors/${constructor.id}`}
                    state={{ constructorId: constructor.id }}
                  >
                    <Flex
                      bgGradient={gradientBg}
                      borderRadius="lg"
                      p={6}
                      transition="all 0.2s ease-in-out"
                      _hover={{
                        transform: 'translateY(-4px)',
                        boxShadow: 'lg',
                        cursor: 'pointer',
                      }}
                      align="center"
                      justify="space-between"
                    >
                      {/* Left: Info */}
                      <Box textAlign="left">
                        <Text fontWeight="bold" fontSize="lg" color="white">
                          {constructor.name}
                        </Text>
                        <Text fontSize="sm" color="whiteAlpha.800">
                          {constructor.nationality}
                        </Text>
                      </Box>

                      {/* Right: Car Image */}
                        {carImage && (
                        <Image
                            src={carImage}
                            alt={`${constructor.name} car`}
                            maxH="80px"          // smaller height
                            objectFit="contain" // ensures full car is visible
                            borderRadius="md"
                            ml={4}
                            />
                        )}
                    </Flex>
                  </Link>
                );
              })}
            </SimpleGrid>
          </>
        )}
      </Container>
    </Box>
  );
};

export default Constructors;








