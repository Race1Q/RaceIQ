// frontend/src/pages/CompareConstructorsPage/CompareConstructorsPage.tsx
import { useAuth0 } from '@auth0/auth0-react';
import { Box, Heading, Grid, Flex, Text, Button, VStack, HStack, Skeleton, SkeletonText, useColorModeValue } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Download } from 'lucide-react';
import { useConstructorComparison, type ConstructorDetails } from '../../hooks/useConstructorComparison';
import type { SelectOption } from '../../components/DropDownSearch/SearchableSelect';
import { ConstructorSelectionPanel } from './components/ConstructorSelectionPanel';
import { ConstructorComparisonTable } from './components/ConstructorComparisonTable';
import PageHeader from '../../components/layout/PageHeader';
import LayoutContainer from '../../components/layout/LayoutContainer';
import CompareTabs from '../../components/compare/CompareTabs';
import { ConstructorPdfComparisonCard } from '../../components/compare/ConstructorPdfComparisonCard';
import { getTeamColor } from '../../lib/teamColors';

// Step types for progressive disclosure
type ComparisonStep = 'parameters' | 'results';
type ParameterPhase = 'constructors' | 'time' | 'stats';

const CompareConstructorsPage = () => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  
  // Theme-aware colors
  const surfaceBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const primaryTextColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.300');
  const glassmorphismBg = useColorModeValue('gray.50', 'rgba(255, 255, 255, 0.05)');
  
  // Progressive disclosure state
  const [currentStep, setCurrentStep] = useState<ComparisonStep>('parameters');
  const [currentPhase, setCurrentPhase] = useState<ParameterPhase>('constructors');

  // Enhanced hook with new comparison features
  const {
    allConstructors, 
    constructor1, 
    constructor2, 
    loading, 
    error, 
    handleSelectConstructor,
    // NEW: Comparison features
    years,
    stats1,
    stats2,
    enabledMetrics,
    score,
    selectConstructor,
    selectConstructorForYears,
    toggleMetric,
  } = useConstructorComparison();
  
  // Year selection state - allow multiple years per constructor
  const [selectedYears1, setSelectedYears1] = useState<string[]>([]);
  const [selectedYears2, setSelectedYears2] = useState<string[]>([]);

  // Simple mapping of constructor names to their debut years (frontend-only solution)
  const constructorDebutYears: Record<string, number> = {
    'Red Bull Racing': 2005,
    'Mercedes': 2010,
    'Ferrari': 1950,
    'McLaren': 1966,
    'Aston Martin': 2021,
    'Alpine': 2021,
    'Williams': 1977,
    'AlphaTauri': 2006,
    'Alfa Romeo': 1993,
    'Haas F1 Team': 2016,
    'Kick Sauber': 1993,
    'RB F1 Team': 2006,
    // Add more as needed
  };

  // Filter years based on constructor's debut year
  const getFilteredYears = (constructor: ConstructorDetails | null) => {
    if (!constructor?.name) return years;
    const debutYear = constructorDebutYears[constructor.name] || 1950;
    return years.filter(year => year >= debutYear);
  };

  // Map UI metric keys to internal hook keys and back
  const uiToInternal: Record<string, keyof typeof enabledMetrics> = {
    wins: 'wins',
    podiums: 'podiums',
    poles: 'poles',
    fastest_laps: 'fastestLaps',
    points: 'points',
    dnf: 'dnfs',
    races: 'races',
  } as any;
  const internalToUi: Record<string, string> = {
    wins: 'wins',
    podiums: 'podiums',
    poles: 'poles',
    fastestLaps: 'fastest_laps',
    points: 'points',
    dnfs: 'dnf',
    races: 'races',
  };

  // Step navigation helpers
  const canProceedToParameters = !!(constructor1 && constructor2);
  const enabledMetricsArray = Object.keys(enabledMetrics)
    .filter(key => enabledMetrics[key as keyof typeof enabledMetrics])
    .map(key => internalToUi[key])
    .filter(Boolean);
  const canProceedToResults = canProceedToParameters && enabledMetricsArray.length > 0 && selectedYears1.length > 0 && selectedYears2.length > 0;

  // Auto-progress through phases (matching drivers behavior)
  useEffect(() => {
    if (canProceedToParameters && currentPhase === 'constructors') {
      const timer = setTimeout(() => {
        setCurrentPhase('time');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [canProceedToParameters, currentPhase]);

  useEffect(() => {
    if (selectedYears1.length > 0 && selectedYears2.length > 0 && currentPhase === 'time') {
      const timer = setTimeout(() => {
        setCurrentPhase('stats');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [selectedYears1, selectedYears2, currentPhase]);

  // Scroll to top when navigating to results step
  useEffect(() => {
    if (currentStep === 'results') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  const exportPdf = async () => {
    if (!constructor1 || !constructor2 || !stats1 || !stats2) {
      alert('Please select both constructors and complete the comparison before exporting.');
      return;
    }

    try {
      const teamColor1 = getTeamColor(constructor1.name || '');
      const teamColor2 = getTeamColor(constructor2.name || '');

      // Build an enabled metrics object from what the user selected (start all false)
      const enabledFromSelection: any = {
        wins: false,
        podiums: false,
        poles: false,
        fastestLaps: false,
        points: false,
        dnfs: false,
        races: false,
      };
      enabledMetricsArray.forEach((uiKey) => {
        const internal = uiToInternal[uiKey];
        if (internal && internal in enabledFromSelection) {
          enabledFromSelection[internal] = true;
        }
      });

      await ConstructorPdfComparisonCard({
        constructor1: {
          ...constructor1,
          teamColor: teamColor1,
        },
        constructor2: {
          ...constructor2,
          teamColor: teamColor2,
        },
        stats1: stats1.yearStats || stats1.career,
        stats2: stats2.yearStats || stats2.career,
        enabledMetrics: enabledFromSelection,
        score,
      });
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export PDF. Check console for details or try using different constructors.');
    }
  };
  
  const nextStep = () => {
    if (currentStep === 'parameters') {
      if (currentPhase === 'constructors' && canProceedToParameters) {
        setCurrentPhase('time');
      } else if (currentPhase === 'time' && selectedYears1.length > 0 && selectedYears2.length > 0) {
        setCurrentPhase('stats');
      } else if (currentPhase === 'stats' && canProceedToResults) {
        // Aggregate data for selected years before showing results
        if (constructor1 && constructor2 && selectedYears1.length > 0 && selectedYears2.length > 0) {
          const years1 = selectedYears1.map(y => parseInt(y, 10));
          const years2 = selectedYears2.map(y => parseInt(y, 10));
          
          // Fetch aggregated stats for both constructors
          selectConstructorForYears(1, constructor1.id.toString(), years1);
          selectConstructorForYears(2, constructor2.id.toString(), years2);
        }
        setCurrentStep('results');
      }
    }
  };

  
  const prevStep = () => {
    if (currentStep === 'parameters') {
      if (currentPhase === 'constructors') {
        // Already at first phase, do nothing
        return;
      } else if (currentPhase === 'time') {
        setCurrentPhase('constructors');
      } else if (currentPhase === 'stats') {
        setCurrentPhase('time');
      }
    } else if (currentStep === 'results') {
      setCurrentStep('parameters');
      setCurrentPhase('stats'); // Go back to stats phase
    }
  };

  // Build dropdown options with proper name fallbacks
  const constructorOptions: SelectOption[] = allConstructors.map((c) => {
    return {
      value: c.id,
      label: c.name,
    };
  });

  if (!isAuthenticated) {
    return (
      <Flex direction="column" align="center" justify="center" minH="60vh" gap={4} p="xl">
        <Heading size="md" fontFamily="heading">Login to Compare Constructors</Heading>
        <Text color={mutedTextColor}>Please sign in to access the comparison tool.</Text>
        <Button
          bg="border-accent"
          _hover={{ bg: 'border-accentDark' }}
          color={useColorModeValue('gray.800', 'white')}
          onClick={() => loginWithRedirect()}
        >
          Login
        </Button>
      </Flex>
    );
  }

  // Phase 1: Constructor Selection Component (within parameters step)
  const Phase1ConstructorSelection = () => (
    <VStack spacing="xl" align="stretch">
      <VStack spacing="md" textAlign="center">
        <Heading size="lg" fontFamily="heading">Choose Your Constructors</Heading>
        <Text color={mutedTextColor} fontSize="lg">
          {constructor1?.id && constructor2?.id 
            ? "Both constructors selected - ready to proceed" 
            : constructor1?.id 
            ? "Select the second constructor to compare" 
            : "Select two constructors to compare their performance"
          }
        </Text>
      </VStack>
      
      <Grid
        templateColumns={{ base: '1fr', lg: '1fr auto 1fr' }}
        gap="lg"
        alignItems="flex-start"
        maxW="1000px"
        mx="auto"
      >
        <ConstructorSelectionPanel
          title="Constructor 1"
          allConstructors={constructorOptions}
          selectedConstructorData={constructor1}
          onConstructorSelect={(id) => {
            const constructorId = String(id);
            // Use the new selectConstructor function for live stats
            selectConstructor(1, constructorId, 'career');
            // Also update legacy data for backward compatibility
            handleSelectConstructor(1, constructorId);
          }}
          isLoading={loading}
          extraControl={null}
        />

        <Flex
          align="center"
          justify="center"
          h={{ base: '60px', lg: '150px' }}
        >
          <Heading size={{ base: 'xl', lg: '3xl' }} color="border-accent" fontFamily="heading">
            VS
          </Heading>
        </Flex>

        <ConstructorSelectionPanel
          title="Constructor 2"
          allConstructors={constructorOptions}
          selectedConstructorData={constructor2}
          onConstructorSelect={(id) => {
            const constructorId = String(id);
            // Use the new selectConstructor function for live stats
            selectConstructor(2, constructorId, 'career');
            // Also update legacy data for backward compatibility
            handleSelectConstructor(2, constructorId);
          }}
          isLoading={loading}
          extraControl={null}
        />
      </Grid>
      
    </VStack>
  );

  // Phase 2: Time Selection Component (within parameters step)
  const Phase2TimeSelection = () => {
    const constructor1Years = getFilteredYears(constructor1);
    const constructor2Years = getFilteredYears(constructor2);

    return (
      <VStack spacing="xl" align="stretch">
        <VStack spacing="md" textAlign="center">
          <Heading size="lg" fontFamily="heading">Select Time Period</Heading>
          <Text color={mutedTextColor} fontSize="lg">
            Choose the years for each constructor's comparison data
          </Text>
        </VStack>
        
        {/* Selected Constructors Preview */}
        <Box p="lg" bg={surfaceBg} borderRadius="lg" border="1px solid" borderColor={borderColor}>
          <VStack spacing="md">
            <Heading size="md" fontFamily="heading" color={primaryTextColor}>Selected Constructors</Heading>
            <Grid templateColumns={{ base: '1fr', md: '1fr auto 1fr' }} gap="md" w="full" maxW="600px" mx="auto">
              <Box textAlign="center" p="md" bg={glassmorphismBg} borderRadius="md">
                <Text fontSize="sm" color={mutedTextColor} mb="xs">Constructor 1</Text>
                <Text fontFamily="heading" fontWeight="bold">{constructor1?.name || 'Not Selected'}</Text>
                {constructor1?.nationality && (
                  <Text fontSize="xs" color={mutedTextColor}>{constructor1.nationality}</Text>
                )}
              </Box>
              
              <Flex align="center" justify="center">
                <Text fontSize="lg" color="border-accent" fontFamily="heading">VS</Text>
              </Flex>
              
              <Box textAlign="center" p="md" bg={glassmorphismBg} borderRadius="md">
                <Text fontSize="sm" color={mutedTextColor} mb="xs">Constructor 2</Text>
                <Text fontFamily="heading" fontWeight="bold">{constructor2?.name || 'Not Selected'}</Text>
                {constructor2?.nationality && (
                  <Text fontSize="xs" color={mutedTextColor}>{constructor2.nationality}</Text>
                )}
              </Box>
            </Grid>
          </VStack>
        </Box>

        {/* Year Selection */}
        <Box p="lg" bg={surfaceBg} borderRadius="lg" border="1px solid" borderColor={borderColor}>
          <VStack spacing="md" align="stretch">
            <Heading size="md" fontFamily="heading" color={primaryTextColor}>Time Period Selection</Heading>
            <Text fontSize="sm" color={mutedTextColor}>Select one or more years for each constructor's comparison data</Text>
            
            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap="lg" w="full">
              {/* Constructor 1 Year Selection */}
              <VStack spacing="sm" align="stretch">
                <HStack justify="space-between" align="center">
                  <Text fontSize="sm" fontFamily="heading" color={primaryTextColor}>
                    {constructor1?.name || 'Constructor 1'} - Years
                  </Text>
                  <Button
                    size="xs"
                    variant="ghost"
                    color="border-accent"
                    _hover={{ bg: "border-accent", color: "white" }}
                    onClick={() => {
                      if (selectedYears1.length === constructor1Years.length) {
                        setSelectedYears1([]);
                      } else {
                        setSelectedYears1(constructor1Years.map(y => y.toString()));
                      }
                    }}
                    fontFamily="heading"
                    fontSize="xs"
                  >
                    {selectedYears1.length === constructor1Years.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </HStack>
                <Flex gap="sm" flexWrap="wrap" justify="center">
                  {constructor1Years.length > 0 ? (
                    constructor1Years.map((year) => {
                      const isSelected = selectedYears1.includes(year.toString());
                      return (
                        <Button
                          key={`constructor1-${year}`}
                          size="sm"
                          variant={isSelected ? "solid" : "outline"}
                          colorScheme={isSelected ? "red" : "gray"}
                          bg={isSelected ? "border-accent" : "transparent"}
                          color={isSelected ? "white" : "text-primary"}
                          borderColor="border-accent"
                          _hover={{
                            bg: isSelected ? "border-accentDark" : "border-accent",
                            color: "white",
                            transform: 'scale(1.05)',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                          }}
                          _active={{
                            transform: 'scale(0.95)'
                          }}
                          onClick={() => {
                            const yearStr = year.toString();
                            if (isSelected) {
                              // Remove year
                              setSelectedYears1(prev => prev.filter(y => y !== yearStr));
                            } else {
                              // Add year
                              setSelectedYears1(prev => [...prev, yearStr]);
                            }
                          }}
                          fontFamily="heading"
                          transition="all 0.2s ease"
                        >
                          {year}
                        </Button>
                      );
                    })
                  ) : (
                    <Text fontSize="sm" color={mutedTextColor}>No years available</Text>
                  )}
                </Flex>
              </VStack>

              {/* Constructor 2 Year Selection */}
              <VStack spacing="sm" align="stretch">
                <HStack justify="space-between" align="center">
                  <Text fontSize="sm" fontFamily="heading" color={primaryTextColor}>
                    {constructor2?.name || 'Constructor 2'} - Years
                  </Text>
                  <Button
                    size="xs"
                    variant="ghost"
                    color="border-accent"
                    _hover={{ bg: "border-accent", color: "white" }}
                    onClick={() => {
                      if (selectedYears2.length === constructor2Years.length) {
                        setSelectedYears2([]);
                      } else {
                        setSelectedYears2(constructor2Years.map(y => y.toString()));
                      }
                    }}
                    fontFamily="heading"
                    fontSize="xs"
                  >
                    {selectedYears2.length === constructor2Years.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </HStack>
                <Flex gap="sm" flexWrap="wrap" justify="center">
                  {constructor2Years.length > 0 ? (
                    constructor2Years.map((year) => {
                      const isSelected = selectedYears2.includes(year.toString());
                      return (
                        <Button
                          key={`constructor2-${year}`}
                          size="sm"
                          variant={isSelected ? "solid" : "outline"}
                          colorScheme={isSelected ? "red" : "gray"}
                          bg={isSelected ? "border-accent" : "transparent"}
                          color={isSelected ? "white" : "text-primary"}
                          borderColor="border-accent"
                          _hover={{
                            bg: isSelected ? "border-accentDark" : "border-accent",
                            color: "white",
                            transform: 'scale(1.05)',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                          }}
                          _active={{
                            transform: 'scale(0.95)'
                          }}
                          onClick={() => {
                            const yearStr = year.toString();
                            if (isSelected) {
                              // Remove year
                              setSelectedYears2(prev => prev.filter(y => y !== yearStr));
                            } else {
                              // Add year
                              setSelectedYears2(prev => [...prev, yearStr]);
                            }
                          }}
                          fontFamily="heading"
                          transition="all 0.2s ease"
                        >
                          {year}
                        </Button>
                      );
                    })
                  ) : (
                    <Text fontSize="sm" color={mutedTextColor}>No years available</Text>
                  )}
                </Flex>
              </VStack>
            </Grid>

            {/* Year Selection Status */}
            {(selectedYears1.length > 0 || selectedYears2.length > 0) && (
              <Box p="sm" bg={glassmorphismBg} borderRadius="md" textAlign="center">
                <Text fontSize="xs" color={mutedTextColor}>
                  {selectedYears1.length > 0 && selectedYears2.length > 0 ? (
                    `Comparing ${constructor1?.name} (${selectedYears1.join(', ')}) vs ${constructor2?.name} (${selectedYears2.join(', ')})`
                  ) : selectedYears1.length > 0 ? (
                    `${constructor1?.name} years selected: ${selectedYears1.join(', ')}. Select years for ${constructor2?.name}.`
                  ) : selectedYears2.length > 0 ? (
                    `${constructor2?.name} years selected: ${selectedYears2.join(', ')}. Select years for ${constructor1?.name}.`
                  ) : (
                    'Select years for both constructors to proceed'
                  )}
                </Text>
              </Box>
            )}
          </VStack>
        </Box>

        
      </VStack>
    );
  };

  // Phase 3: Stats Selection Component (within parameters step)
  const Phase3StatsSelection = () => {
    // Available metrics for comparison
    const availableMetrics = {
      wins: 'Wins',
      podiums: 'Podiums',
      poles: 'Pole Positions',
      fastest_laps: 'Fastest Laps',
      points: 'Points',
      races: 'Races',
      dnf: 'DNFs',
    };

    const enabledMetricsArray = Object.keys(enabledMetrics)
      .filter(key => enabledMetrics[key as keyof typeof enabledMetrics])
      .map(key => internalToUi[key])
      .filter(Boolean);

    return (
      <VStack spacing="xl" align="stretch">
        <VStack spacing="md" textAlign="center">
          <Heading size="lg" fontFamily="heading">Select Statistics</Heading>
          <Text color={mutedTextColor} fontSize="lg">
            Choose the metrics you want to compare
          </Text>
        </VStack>
        
        {/* Statistics Selection */}
        <Box p="lg" bg={surfaceBg} borderRadius="lg" border="1px solid" borderColor={borderColor}>
          <VStack spacing="md" align="stretch">
            <HStack justify="space-between" align="center">
              <Heading size="md" fontFamily="heading" color={primaryTextColor}>Statistics to Compare</Heading>
              <Button
                size="sm"
                variant="ghost"
                color="border-accent"
                _hover={{ bg: "border-accent", color: "white" }}
                onClick={() => {
                  const allMetricKeys = Object.keys(availableMetrics);
                  const allSelected = allMetricKeys.every(key => enabledMetricsArray.includes(key));
                  
                  if (allSelected) {
                    allMetricKeys.forEach(key => {
                      const mapped = uiToInternal[key];
                      if (mapped) toggleMetric(mapped as any);
                    });
                  } else {
                    allMetricKeys.forEach(key => {
                      if (!enabledMetricsArray.includes(key)) {
                        const mapped = uiToInternal[key];
                        if (mapped) toggleMetric(mapped as any);
                      }
                    });
                  }
                }}
                fontFamily="heading"
              >
                {Object.keys(availableMetrics).every(key => enabledMetricsArray.includes(key)) ? 'Deselect All' : 'Select All'}
              </Button>
            </HStack>
            <Text fontSize="sm" color={mutedTextColor}>
              Select the metrics you want to compare. Choose at least one statistic.
            </Text>
            
            <Flex gap="sm" flexWrap="wrap" justify="center">
              {Object.entries(availableMetrics).map(([key, label]) => (
                <Button
                  key={key}
                  size="sm"
                  variant={enabledMetricsArray.includes(key) ? "solid" : "outline"}
                  colorScheme={enabledMetricsArray.includes(key) ? "red" : "gray"}
                  bg={enabledMetricsArray.includes(key) ? "border-accent" : "transparent"}
                  color={enabledMetricsArray.includes(key) ? "white" : "text-primary"}
                  borderColor="border-accent"
                  borderWidth={enabledMetricsArray.includes(key) ? "2px" : "1px"}
                  boxShadow={enabledMetricsArray.includes(key) ? "0 0 10px rgba(225, 6, 0, 0.3)" : "none"}
                  _hover={{
                    bg: enabledMetricsArray.includes(key) ? "border-accentDark" : "border-accent",
                    color: "white",
                    transform: 'scale(1.05)',
                    boxShadow: enabledMetricsArray.includes(key) ? "0 0 15px rgba(225, 6, 0, 0.5)" : "0 4px 15px rgba(0,0,0,0.1)"
                  }}
                  _active={{ transform: 'scale(0.95)' }}
                  onClick={() => {
                    const mapped = uiToInternal[key];
                    if (mapped) toggleMetric(mapped as any);
                  }}
                  fontFamily="heading"
                  transition="all 0.2s ease"
                  position="relative"
                >
                  {enabledMetricsArray.includes(key) && (
                    <Box
                      position="absolute"
                      top="-2px"
                      right="-2px"
                      w="16px"
                      h="16px"
                      bg="green.500"
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="10px"
                      color={useColorModeValue('gray.800', 'white')}
                      fontWeight="bold"
                    >
                      ✓
                    </Box>
                  )}
                  {label}
                </Button>
              ))}
            </Flex>
            {enabledMetricsArray.length === 0 && (
              <Text fontSize="xs" color="border-accent" textAlign="center" mt="sm">
                Please select at least one statistic to compare
              </Text>
            )}
          </VStack>
        </Box>

        {/* Fixed height spacer to keep button position stable */}
        <Box minH="100px" mt="xl">
          {canProceedToResults && (
            <Flex justify="flex-end">
              <Button
                rightIcon={<ChevronRight size={20} />}
                onClick={nextStep}
                size="lg"
                bg="border-accent"
                _hover={{ 
                  bg: 'border-accentDark',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                }}
                _active={{
                  bg: 'border-accentDark',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                }}
                color={useColorModeValue('gray.800', 'white')}
                fontFamily="heading"
                boxShadow="0 4px 15px rgba(0,0,0,0.1)"
              >
                View Comparison
              </Button>
            </Flex>
          )}
        </Box>
      </VStack>
    );
  };

  // Step 1: Progressive Parameters Selection (matching drivers structure)
  const Step1Parameters = () => (
    <VStack spacing="xl" align="stretch">
      {/* Phase 1: Constructor Selection - Always visible */}
      <Phase1ConstructorSelection />
      
      {/* Phase 2: Time Period Selection - Appears after constructors selected */}
      {(currentPhase === 'time' || currentPhase === 'stats') && (
        <Phase2TimeSelection />
      )}
      
      {/* Phase 3: Statistics Selection - Appears after time period selected */}
      {currentPhase === 'stats' && (
        <Phase3StatsSelection />
      )}
    </VStack>
  );

  // Step 3: Results Display Component
  const Step3Results = () => {
    // Get team colors
    const constructor1TeamColor = constructor1 ? getTeamColor(constructor1.name || '', { hash: true }) : '#e10600';
    const constructor2TeamColor = constructor2 ? getTeamColor(constructor2.name || '', { hash: true }) : '#e10600';

    // Available metrics for comparison
    const availableMetrics = {
      wins: 'Wins',
      podiums: 'Podiums',
      poles: 'Pole Positions',
      fastest_laps: 'Fastest Laps',
      points: 'Points',
      races: 'Races',
      dnf: 'DNFs',
    };

    return (
      <VStack spacing="xl" align="stretch">
        <VStack spacing="md" textAlign="center">
          <Heading size="lg" fontFamily="heading">Head-to-Head Comparison</Heading>
          <Text color={mutedTextColor} fontSize="lg">
            See how your selected constructors stack up against each other
          </Text>
          {selectedYears1.length > 0 && selectedYears2.length > 0 && (
            <Text color="border-accent" fontSize="md" fontFamily="heading" fontWeight="bold">
              {constructor1?.name} ({selectedYears1.join(', ')}) vs {constructor2?.name} ({selectedYears2.join(', ')})
            </Text>
          )}
        </VStack>

        {/* Central-Axis Results Display */}
        <Box p="lg" bg={surfaceBg} borderRadius="lg" border="1px solid" borderColor={borderColor}>
          <VStack spacing="lg">
            <Heading size="md" fontFamily="heading" color={primaryTextColor}>Statistics Comparison</Heading>
            
            {/* Loading State */}
            {loading && (
              <VStack spacing="md" w="full">
                <Skeleton height="120px" width="120px" borderRadius="full" />
                <SkeletonText noOfLines={2} spacing="2" skeletonHeight="4" />
                <VStack spacing="sm" w="full">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} height="60px" width="full" borderRadius="md" />
                  ))}
                </VStack>
              </VStack>
            )}
            
            {/* Two-Column Layout */}
            {!loading && stats1 && stats2 && (
              <ConstructorComparisonTable
                constructor1={constructor1}
                constructor2={constructor2}
                stats1={stats1}
                stats2={stats2}
                enabledMetrics={enabledMetricsArray}
                availableMetrics={availableMetrics}
                teamColor1={constructor1TeamColor}
                teamColor2={constructor2TeamColor}
              />
            )}
          </VStack>
        </Box>

        {/* Composite Score Visualization */}
        {score && enabledMetricsArray.length > 0 && (() => {
          const totalScore = score ? (score.c1 || 0) + (score.c2 || 0) : 0;
          const constructor1Percentage = totalScore > 0 ? ((score.c1 || 0) / totalScore) * 100 : 50;
          const constructor2Percentage = totalScore > 0 ? ((score.c2 || 0) / totalScore) * 100 : 50;
          
          return (
            <Box p="lg" bg="bg-surface" borderRadius="lg" border="1px solid" borderColor="border-primary">
              <VStack spacing="md">
                <Heading size="md" fontFamily="heading" color="text-primary">Composite Score</Heading>
              
              {/* Tug-of-War Style Bar */}
              <Box w="full" maxW="800px" mx="auto">
                <Flex align="center" justify="space-between" mb="sm">
                  <Text fontSize="sm" color="text-muted" fontFamily="heading">
                    {constructor1?.name}
                  </Text>
                  <Text fontSize="sm" color="text-muted" fontFamily="heading">
                    {constructor2?.name}
                  </Text>
                </Flex>
                
                <Box position="relative" h="8px" bg="border-subtle" borderRadius="full" overflow="hidden">
                  <Flex h="full">
                    <Box
                      h="full"
                      bg={constructor1TeamColor}
                      w={`${constructor1Percentage}%`}
                      transition="width 0.8s ease"
                    />
                    <Box
                      h="full"
                      bg={constructor2TeamColor}
                      w={`${constructor2Percentage}%`}
                      transition="width 0.8s ease"
                    />
                  </Flex>
                </Box>
                
                <Flex align="center" justify="space-between" mt="sm">
                  <Text fontSize="lg" fontFamily="heading" fontWeight="bold" color={constructor1TeamColor}>
                    {score.c1?.toFixed(1) || '0.0'}
                  </Text>
                  <Text fontSize="lg" fontFamily="heading" fontWeight="bold" color={constructor2TeamColor}>
                    {score.c2?.toFixed(1) || '0.0'}
                  </Text>
                </Flex>
              </Box>

              <VStack spacing="2" align="center" maxW="900px">
                <Text fontSize="sm" color="text-primary" fontWeight="bold">How this score works</Text>
                <Text fontSize="xs" color="text-muted" textAlign="center">
                  We compare constructors on each enabled metric, normalize to 0–1, then average and scale to 0–100.
                </Text>
                <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={2} w="full">
                  <Box p="sm" bg="bg-glassmorphism" borderRadius="md" textAlign="center">
                    <Text fontSize="xs" color="text-muted" mb="1">Higher is better</Text>
                    <Text fontSize="xs" color="text-primary" fontWeight="bold">Wins, Podiums, Points</Text>
                  </Box>
                  <Box p="sm" bg="bg-glassmorphism" borderRadius="md" textAlign="center">
                    <Text fontSize="xs" color="text-muted" mb="1">Lower is better</Text>
                    <Text fontSize="xs" color="text-primary" fontWeight="bold">DNFs</Text>
                  </Box>
                </Grid>
              </VStack>
            </VStack>
          </Box>
          );
        })()}

        {/* Action Buttons */}
        <Flex justify="space-between" mt="xl">
          <Button
            leftIcon={<ChevronLeft size={20} />}
            onClick={prevStep}
            variant="outline"
            fontFamily="heading"
            _hover={{
              transform: 'translateX(-2px)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}
            transition="all 0.2s ease"
          >
            Back to Parameters
          </Button>
          
          <Button
            leftIcon={<Download size={20} />}
            onClick={exportPdf}
            bg="border-accent"
            _hover={{ 
              bg: 'border-accentDark',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
            }}
            _active={{
              transform: 'translateY(0px)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}
            color={useColorModeValue('gray.800', 'white')}
            fontFamily="heading"
            transition="all 0.2s ease"
            boxShadow="0 4px 15px rgba(0,0,0,0.1)"
          >
            Export Results
          </Button>
        </Flex>
      </VStack>
    );
  };

  return (
    <Box
      sx={{
        background: `
          radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0),
          linear-gradient(45deg, #0a0a0a 25%, transparent 25%, transparent 75%, #0a0a0a 75%),
          linear-gradient(-45deg, #0a0a0a 25%, transparent 25%, transparent 75%, #0a0a0a 75%)
        `,
        backgroundSize: '20px 20px, 20px 20px, 20px 20px',
        backgroundColor: '#0a0a0a',
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
      <PageHeader 
        title="Constructor Comparison" 
        subtitle="Compare F1 constructors head-to-head"
      />
      <LayoutContainer>
        <CompareTabs active="constructors" />
        <Box p={{ base: 'md', md: 'xl' }}>
          {error && <Text color="border-accent" textAlign="center" fontSize="lg" p="xl">{error}</Text>}

          {/* Progress Indicator */}
          <Box mb="xl" maxW="400px" mx="auto">
            <HStack spacing="sm" justify="center">
              {['parameters', 'results'].map((step, index) => (
                <HStack key={step} spacing="sm">
                  <Box
                    w="8px"
                    h="8px"
                    borderRadius="full"
                    bg={currentStep === step ? 'border-accent' : useColorModeValue('gray.100', 'whiteAlpha.100')}
                    transition="all 0.3s ease"
                  />
                  {index < 1 && (
                    <Box
                      w="20px"
                      h="2px"
                      bg={currentStep === 'results' ? 'border-accent' : useColorModeValue('gray.100', 'whiteAlpha.100')}
                      transition="all 0.3s ease"
                    />
                  )}
                </HStack>
              ))}
            </HStack>
            <Text fontSize="xs" color={mutedTextColor} textAlign="center" mt="sm">
              {currentStep === 'parameters' ? (
                currentPhase === 'constructors' ? 'Step 1 of 2 - Select Constructors' :
                currentPhase === 'time' ? 'Step 1 of 2 - Select Time Period' :
                'Step 1 of 2 - Select Statistics'
              ) : 'Step 2 of 2 - View Results'}
            </Text>
          </Box>

          {/* Progressive Disclosure: Render current step */}
          {currentStep === 'parameters' && <Step1Parameters />}
          {currentStep === 'results' && <Step3Results />}
        </Box>
      </LayoutContainer>
    </Box>
  );
};

export default CompareConstructorsPage;
