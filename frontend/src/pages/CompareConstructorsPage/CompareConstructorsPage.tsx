// frontend/src/pages/CompareConstructorsPage/CompareConstructorsPage.tsx
import { useAuth0 } from '@auth0/auth0-react';
import { Box, Heading, Grid, Flex, Text, Button, VStack, HStack, IconButton, useDisclosure, Fade, SlideFade, Progress, CircularProgress, CircularProgressLabel, Image, Badge, Skeleton, SkeletonText, Tooltip, ScaleFade, useColorModeValue } from '@chakra-ui/react';
import { useRef, useMemo, useState } from 'react';
import { ChevronRight, ChevronLeft, ArrowRight, Trophy, Zap, Star, Target, Flag, Clock, Award } from 'lucide-react';
import { Download } from 'lucide-react';
import { useConstructorComparison } from '../../hooks/useConstructorComparison';
import type { SelectOption } from '../../components/DropDownSearch/SearchableSelect';
import { ConstructorSelectionPanel } from './components/ConstructorSelectionPanel';
import { ConstructorComparisonTable } from './components/ConstructorComparisonTable';
import PageLoadingOverlay from '../../components/loaders/PageLoadingOverlay';
import PageHeader from '../../components/layout/PageHeader';
import LayoutContainer from '../../components/layout/LayoutContainer';
import CompareTabs from '../../components/Compare/CompareTabs';
import { ConstructorPdfComparisonCard } from '../../components/compare/ConstructorPdfComparisonCard';
import { getTeamColor } from '../../lib/teamColors';

// Step types for progressive disclosure
type ComparisonStep = 'constructors' | 'parameters' | 'results';

const CompareConstructorsPage = () => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  
  // Progressive disclosure state
  const [currentStep, setCurrentStep] = useState<ComparisonStep>('constructors');

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
    clearSelection,
  } = useConstructorComparison();
  
  // Year selection state - allow multiple years per constructor
  const [selectedYears1, setSelectedYears1] = useState<string[]>([]);
  const [selectedYears2, setSelectedYears2] = useState<string[]>([]);

  // Step navigation helpers
  const canProceedToParameters = constructor1 && constructor2;
  const enabledMetricsArray = Object.keys(enabledMetrics).filter(key => enabledMetrics[key as keyof typeof enabledMetrics]);
  const canProceedToResults = canProceedToParameters && enabledMetricsArray.length > 0 && selectedYears1.length > 0 && selectedYears2.length > 0;

  const exportPdf = async () => {
    if (!constructor1 || !constructor2 || !stats1 || !stats2) {
      alert('Please select both constructors and complete the comparison before exporting.');
      return;
    }

    try {
      const teamColor1 = getTeamColor(constructor1.name || '');
      const teamColor2 = getTeamColor(constructor2.name || '');

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
        enabledMetrics,
        score,
      });
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export PDF. Check console for details or try using different constructors.');
    }
  };
  
  const nextStep = () => {
    if (currentStep === 'constructors' && canProceedToParameters) {
      setCurrentStep('parameters');
    } else if (currentStep === 'parameters' && canProceedToResults) {
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
  };
  
  const prevStep = () => {
    if (currentStep === 'parameters') {
      setCurrentStep('constructors');
    } else if (currentStep === 'results') {
      setCurrentStep('parameters');
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
        <Text color="text-secondary">Please sign in to access the comparison tool.</Text>
        <Button
          bg="border-accent"
          _hover={{ bg: 'border-accentDark' }}
          color="white"
          onClick={() => loginWithRedirect()}
        >
          Login
        </Button>
      </Flex>
    );
  }

  // Step 1: Constructor Selection Component
  const Step1ConstructorSelection = () => (
    <VStack spacing="xl" align="stretch">
      <VStack spacing="md" textAlign="center">
        <Heading size="lg" fontFamily="heading">Choose Your Constructors</Heading>
        <Text color="text-muted" fontSize="lg">
          Select two constructors to compare their performance
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
          onChange={(option) => {
            if (option) {
              const constructorId = String(option.value);
              // Use the new selectConstructor function for live stats
              selectConstructor(1, constructorId, 'career');
              // Also update legacy data for backward compatibility
              handleSelectConstructor(1, constructorId);
            }
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
          onChange={(option) => {
            if (option) {
              const constructorId = String(option.value);
              // Use the new selectConstructor function for live stats
              selectConstructor(2, constructorId, 'career');
              // Also update legacy data for backward compatibility
              handleSelectConstructor(2, constructorId);
            }
          }}
          isLoading={loading}
          extraControl={null}
        />
      </Grid>
      
      {canProceedToParameters && (
        <ScaleFade in={canProceedToParameters} initialScale={0.9}>
          <Flex justify="center" mt="xl">
            <Button
              rightIcon={<ChevronRight size={20} />}
              onClick={nextStep}
              size="lg"
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
              color="white"
              fontFamily="heading"
              transition="all 0.2s ease"
              boxShadow="0 4px 15px rgba(0,0,0,0.1)"
            >
              Continue to Parameters
            </Button>
          </Flex>
        </ScaleFade>
      )}
    </VStack>
  );

  // Step 2: Parameters Selection Component
  const Step2Parameters = () => {
    // Available metrics for comparison
    const availableMetrics = {
      wins: 'Wins',
      podiums: 'Podiums',
      poles: 'Pole Positions',
      fastestLaps: 'Fastest Laps',
      points: 'Points',
      races: 'Races',
      dnf: 'DNFs',
    };

    // Ensure years is an array
    const yearsArray = Array.isArray(years) ? years : [];

    return (
      <VStack spacing="xl" align="stretch">
        <VStack spacing="md" textAlign="center">
          <Heading size="lg" fontFamily="heading">Set Comparison Parameters</Heading>
          <Text color="text-muted" fontSize="lg">
            Choose the statistics and time period for your comparison
          </Text>
        </VStack>
        
        {/* Selected Constructors Preview */}
        <Box p="lg" bg="bg-surface" borderRadius="lg" border="1px solid" borderColor="border-primary">
          <VStack spacing="md">
            <Heading size="md" fontFamily="heading" color="text-primary">Selected Constructors</Heading>
            <Grid templateColumns={{ base: '1fr', md: '1fr auto 1fr' }} gap="md" w="full" maxW="600px" mx="auto">
              <Box textAlign="center" p="md" bg="bg-glassmorphism" borderRadius="md">
                <Text fontSize="sm" color="text-muted" mb="xs">Constructor 1</Text>
                <Text fontFamily="heading" fontWeight="bold">{constructor1?.name || 'Not Selected'}</Text>
                {constructor1?.nationality && (
                  <Text fontSize="xs" color="text-muted">{constructor1.nationality}</Text>
                )}
                {constructor1?.id && (
                  <Text fontSize="xs" color="border-accent" fontWeight="bold">#{constructor1.id}</Text>
                )}
              </Box>
              
              <Flex align="center" justify="center">
                <Text fontSize="lg" color="border-accent" fontFamily="heading">VS</Text>
              </Flex>
              
              <Box textAlign="center" p="md" bg="bg-glassmorphism" borderRadius="md">
                <Text fontSize="sm" color="text-muted" mb="xs">Constructor 2</Text>
                <Text fontFamily="heading" fontWeight="bold">{constructor2?.name || 'Not Selected'}</Text>
                {constructor2?.nationality && (
                  <Text fontSize="xs" color="text-muted">{constructor2.nationality}</Text>
                )}
                {constructor2?.id && (
                  <Text fontSize="xs" color="border-accent" fontWeight="bold">#{constructor2.id}</Text>
                )}
              </Box>
            </Grid>
          </VStack>
        </Box>

        {/* Year Selection */}
        <Box p="lg" bg="bg-surface" borderRadius="lg" border="1px solid" borderColor="border-primary">
          <VStack spacing="md" align="stretch">
            <Heading size="md" fontFamily="heading" color="text-primary">Time Period Selection</Heading>
            <Text fontSize="sm" color="text-muted">Select one or more years for each constructor's comparison data</Text>
            
            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap="lg" w="full">
              {/* Constructor 1 Year Selection */}
              <VStack spacing="sm" align="stretch">
                <Text fontSize="sm" fontFamily="heading" color="text-primary" textAlign="center">
                  {constructor1?.name || 'Constructor 1'} - Years
                </Text>
                <Flex gap="sm" flexWrap="wrap" justify="center">
                  {yearsArray.length > 0 ? (
                    yearsArray.map((year) => {
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
                              // Note: We'll aggregate multiple years in the results display
                              // For now, just fetch the most recent year for immediate display
                              if (constructor1) {
                                selectConstructor(1, constructor1.id.toString(), year);
                              }
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
                    <Text fontSize="sm" color="text-muted">No years available</Text>
                  )}
                </Flex>
                {selectedYears1.length > 0 && (
                  <Text fontSize="xs" color="border-accent" textAlign="center">
                    Selected: {selectedYears1.join(', ')}
                  </Text>
                )}
              </VStack>

              {/* Constructor 2 Year Selection */}
              <VStack spacing="sm" align="stretch">
                <Text fontSize="sm" fontFamily="heading" color="text-primary" textAlign="center">
                  {constructor2?.name || 'Constructor 2'} - Years
                </Text>
                <Flex gap="sm" flexWrap="wrap" justify="center">
                  {yearsArray.length > 0 ? (
                    yearsArray.map((year) => {
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
                              // Note: We'll aggregate multiple years in the results display
                              // For now, just fetch the most recent year for immediate display
                              if (constructor2) {
                                selectConstructor(2, constructor2.id.toString(), year);
                              }
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
                    <Text fontSize="sm" color="text-muted">No years available</Text>
                  )}
                </Flex>
                {selectedYears2.length > 0 && (
                  <Text fontSize="xs" color="border-accent" textAlign="center">
                    Selected: {selectedYears2.join(', ')}
                  </Text>
                )}
              </VStack>
            </Grid>

            {/* Year Selection Status */}
            {(selectedYears1.length > 0 || selectedYears2.length > 0) && (
              <Box p="sm" bg="bg-glassmorphism" borderRadius="md" textAlign="center">
                <Text fontSize="xs" color="text-muted">
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

        {/* Statistics Selection */}
        <Box p="lg" bg="bg-surface" borderRadius="lg" border="1px solid" borderColor="border-primary">
          <VStack spacing="md" align="stretch">
            <Heading size="md" fontFamily="heading" color="text-primary">Statistics to Compare</Heading>
            <Text fontSize="sm" color="text-muted">
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
                  _active={{
                    transform: 'scale(0.95)'
                  }}
                  onClick={() => toggleMetric(key as any)}
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
                      color="white"
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
            {(!selectedYears1.length || !selectedYears2.length) && (
              <Text fontSize="xs" color="border-accent" textAlign="center" mt="sm">
                Please select at least one year for both constructors to enable comparison
              </Text>
            )}
          </VStack>
        </Box>
        
        <Flex justify="space-between" mt="xl">
          <Button
            leftIcon={<ChevronLeft size={20} />}
            onClick={prevStep}
            variant="outline"
            fontFamily="heading"
          >
            Back to Constructors
          </Button>
          
          {canProceedToResults && (
            <Button
              rightIcon={<ArrowRight size={20} />}
              onClick={nextStep}
              size="lg"
              bg="border-accent"
              _hover={{ bg: 'border-accentDark' }}
              color="white"
              fontFamily="heading"
            >
              View Comparison
            </Button>
          )}
        </Flex>
      </VStack>
    );
  };

  // Step 3: Results Display Component
  const Step3Results = () => {
    // Get team colors
    const constructor1TeamColor = constructor1 ? getTeamColor(constructor1.name || '') : '#e10600';
    const constructor2TeamColor = constructor2 ? getTeamColor(constructor2.name || '') : '#e10600';

    // Available metrics for comparison
    const availableMetrics = {
      wins: 'Wins',
      podiums: 'Podiums',
      poles: 'Pole Positions',
      fastestLaps: 'Fastest Laps',
      points: 'Points',
      races: 'Races',
      dnf: 'DNFs',
    };

    return (
      <VStack spacing="xl" align="stretch">
        <VStack spacing="md" textAlign="center">
          <Heading size="lg" fontFamily="heading">Head-to-Head Comparison</Heading>
          <Text color="text-muted" fontSize="lg">
            See how your selected constructors stack up against each other
          </Text>
          {selectedYears1.length > 0 && selectedYears2.length > 0 && (
            <Text color="border-accent" fontSize="md" fontFamily="heading" fontWeight="bold">
              {constructor1?.name} ({selectedYears1.join(', ')}) vs {constructor2?.name} ({selectedYears2.join(', ')})
            </Text>
          )}
        </VStack>

        {/* Central-Axis Results Display */}
        <Box p="lg" bg="bg-surface" borderRadius="lg" border="1px solid" borderColor="border-primary">
          <VStack spacing="lg">
            <Heading size="md" fontFamily="heading" color="text-primary">Statistics Comparison</Heading>
            
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
            color="white"
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
    <Box>
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
              {['constructors', 'parameters', 'results'].map((step, index) => (
                <HStack key={step} spacing="sm">
                  <Box
                    w="8px"
                    h="8px"
                    borderRadius="full"
                    bg={currentStep === step ? 'border-accent' : 'border-subtle'}
                    transition="all 0.3s ease"
                  />
                  {index < 2 && (
                    <Box
                      w="20px"
                      h="2px"
                      bg={['constructors', 'parameters'].indexOf(currentStep) > index ? 'border-accent' : 'border-subtle'}
                      transition="all 0.3s ease"
                    />
                  )}
                </HStack>
              ))}
            </HStack>
            <Text fontSize="xs" color="text-muted" textAlign="center" mt="sm">
              Step {['constructors', 'parameters', 'results'].indexOf(currentStep) + 1} of 3
            </Text>
          </Box>

          {/* Progressive Disclosure: Render current step with animations */}
          <Fade in={currentStep === 'constructors'} unmountOnExit>
            {currentStep === 'constructors' && <Step1ConstructorSelection />}
          </Fade>
          
          <SlideFade in={currentStep === 'parameters'} offsetY="20px" unmountOnExit>
            {currentStep === 'parameters' && <Step2Parameters />}
          </SlideFade>
          
          <SlideFade in={currentStep === 'results'} offsetY="20px" unmountOnExit>
            {currentStep === 'results' && <Step3Results />}
          </SlideFade>
        </Box>
      </LayoutContainer>
    </Box>
  );
};

export default CompareConstructorsPage;
