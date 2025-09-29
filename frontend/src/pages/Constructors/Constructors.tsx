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
  Image,
} from '@chakra-ui/react';
import { Select } from 'chakra-react-select';
import { InputGroup, InputRightElement, IconButton } from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
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

interface Option {
  value: string;
  label: string;
}

const Constructors = () => {
  const toast = useToast();
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

  // Apply filters
  const filteredConstructors = useMemo(() => {
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
  }, [constructors, searchTerm, statusFilter]);

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

              {/* Center: Title */}
              <Text fontSize="2xl" fontWeight="bold" fontFamily="heading">
                Constructors
              </Text>
              


              {/* Right: Filters */}
              <Flex gap={4}>

                {/* Left: Search - Show for All Teams and Inactive Teams */}
                {(statusFilter === 'all' || statusFilter === 'inactive') && (
                  <Box maxW="260px" w="100%">
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
                <Box maxW="220px" w="220px">
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
                        <Text fontWeight="bold" fontSize="lg" color="white" fontFamily="heading">
                          {constructor.name}
                        </Text>
                        <Text fontSize="sm" color="whiteAlpha.800" fontFamily="body">
                          {constructor.nationality}
                        </Text>
                      </Box>

                      {/* Right: Car Image */}
                      {carImage && (
                        <Image
                          src={carImage}
                          alt={`${constructor.name} car`}
                          maxH="80px"
                          objectFit="contain"
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










