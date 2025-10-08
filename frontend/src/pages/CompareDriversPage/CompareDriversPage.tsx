// frontend/src/pages/CompareDriversPage/CompareDriversPage.tsx
import { useAuth0 } from '@auth0/auth0-react';
import { Box, Heading, Grid, Text, Button, VStack, HStack, Image, Badge, Skeleton, SkeletonText } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDriverComparison } from '../../hooks/useDriverComparison';
import type { SelectOption } from '../../components/DropDownSearch/SearchableSelect';
import { DriverSelectionPanel } from './components/DriverSelectionPanel';
import { AnimatedStatistics } from './components/AnimatedStatistics';
import { AnimatedCompositeScore } from './components/AnimatedCompositeScore';
import PageHeader from '../../components/layout/PageHeader';
import { getTeamColor } from '../../lib/teamColors';
import { driverHeadshots } from '../../lib/driverHeadshots';
import { driverTeamMapping } from '../../lib/driverTeamMapping';

// Step types for progressive disclosure
type ComparisonStep = 'drivers' | 'parameters' | 'results';

const CompareDriversPage = () => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  
  // Progressive disclosure state
  const [currentStep, setCurrentStep] = useState<ComparisonStep>('drivers');

  // Enhanced hook with new comparison features
  const { 
    allDrivers, 
    driver1, 
    driver2, 
    loading, 
    error, 
    handleSelectDriver,
    // NEW: Comparison features
    years,
    stats1,
    stats2,
    enabledMetrics,
    score,
    selectDriver,
    selectDriverForYears,
    toggleMetric,
  } = useDriverComparison();
  
  // Year selection state - allow multiple years per driver
  const [selectedYears1, setSelectedYears1] = useState<string[]>([]);
  const [selectedYears2, setSelectedYears2] = useState<string[]>([]);

  // Available metrics for comparison
  const availableMetrics = {
    wins: 'Wins',
    podiums: 'Podiums',
    poles: 'Pole Positions',
    fastest_laps: 'Fastest Laps',
    points: 'Points',
    races: 'Races',
    dnf: 'DNFs',
    avg_finish: 'Average Finish',
  };

  // Convert allDrivers to SelectOption format for dropdowns
  const driverOptions: SelectOption[] = useMemo(() => {
    return allDrivers.map(driver => ({
      value: driver.id.toString(),
      label: driver.full_name || 'Unknown Driver',
      extra: driver.current_team_name || 'Unknown Team'
    }));
  }, [allDrivers]);

  // Convert years to SelectOption format
  const yearOptions: SelectOption[] = useMemo(() => {
    return years.map(year => ({
      value: year.toString(),
      label: year.toString()
    }));
  }, [years]);

  // Check if we can proceed to next step
  const canProceedToParameters = driver1 && driver2;
  const canProceedToResults = canProceedToParameters && selectedYears1.length > 0 && selectedYears2.length > 0;

  // Navigation functions
  const nextStep = () => {
    if (currentStep === 'drivers' && canProceedToParameters) {
      setCurrentStep('parameters');
    } else if (currentStep === 'parameters' && canProceedToResults) {
      // Aggregate data for selected years before showing results
      if (driver1 && driver2 && selectedYears1.length > 0 && selectedYears2.length > 0) {
        const years1 = selectedYears1.map(y => parseInt(y, 10));
        const years2 = selectedYears2.map(y => parseInt(y, 10));

        // Fetch aggregated stats for both drivers
        selectDriverForYears(1, driver1.id.toString(), years1);
        selectDriverForYears(2, driver2.id.toString(), years2);
      }
      setCurrentStep('results');
    }
  };

  const prevStep = () => {
    if (currentStep === 'parameters') {
      setCurrentStep('drivers');
    } else if (currentStep === 'results') {
      setCurrentStep('parameters');
    }
  };

  // Year selection handlers
  const handleYearSelection = (driverSlot: 1 | 2, year: string) => {
    if (driverSlot === 1) {
      setSelectedYears1(prev => 
        prev.includes(year) 
          ? prev.filter(y => y !== year)
          : [...prev, year]
      );
    } else {
      setSelectedYears2(prev => 
        prev.includes(year) 
          ? prev.filter(y => y !== year)
          : [...prev, year]
      );
    }
  };

  // PDF export handler
  const handleExportPdf = () => {
    // TODO: Implement PDF export functionality
    console.log('Exporting PDF...');
  };

  // Step 1: Driver Selection Component
  const Step1DriverSelection = () => (
    <VStack spacing="lg" w="full">
      <Heading size="lg" fontFamily="heading" color="text-primary" textAlign="center">
        Select Drivers to Compare
      </Heading>
      
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap="lg" w="full" maxW="800px" mx="auto">
        <DriverSelectionPanel
          title="Driver 1"
          allDrivers={driverOptions}
          selectedDriverData={driver1}
          onDriverSelect={(id) => {
            const driverId = String(id);
            // Use the new selectDriver function for live stats
            selectDriver(1, driverId, 'career');
            // Also update legacy data for backward compatibility
            handleSelectDriver(1, driverId);
          }}
          isLoading={loading}
          extraControl={null}
        />
        
        <DriverSelectionPanel
          title="Driver 2"
          allDrivers={driverOptions}
          selectedDriverData={driver2}
          onDriverSelect={(id) => {
            const driverId = String(id);
            // Use the new selectDriver function for live stats
            selectDriver(2, driverId, 'career');
            // Also update legacy data for backward compatibility
            handleSelectDriver(2, driverId);
          }}
          isLoading={loading}
          extraControl={null}
        />
      </Grid>
    </VStack>
  );

  // Step 2: Parameters Selection Component
  const Step2Parameters = () => (
    <VStack spacing="lg" w="full">
      <Heading size="lg" fontFamily="heading" color="text-primary" textAlign="center">
        Select Comparison Parameters
      </Heading>
      
      {/* Year Selection */}
      <VStack spacing="md" w="full" maxW="600px" mx="auto">
        <Text fontFamily="heading" fontWeight="bold" color="text-primary">
          Select Years for Comparison
        </Text>
        
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="lg" w="full">
          {/* Driver 1 Years */}
          <VStack spacing="sm" align="stretch">
            <Text fontSize="sm" color="text-muted" textAlign="center">
              {driver1?.fullName} - Years
            </Text>
            <VStack spacing="xs">
              {yearOptions.map((year) => {
                const yearValue = String(year.value);
                return (
                  <Button
                    key={yearValue}
                    size="sm"
                    variant={selectedYears1.includes(yearValue) ? "solid" : "outline"}
                    colorScheme={selectedYears1.includes(yearValue) ? "blue" : "gray"}
                    onClick={() => {
                      handleYearSelection(1, yearValue);
                      // Also trigger live stats update for this year
                      if (driver1) {
                        const yearNumber = parseInt(yearValue, 10) as number;
                        selectDriver(1, String(driver1.id), yearNumber);
                      }
                    }}
                    w="full"
                  >
                    {year.label}
                  </Button>
                );
              })}
            </VStack>
          </VStack>

          {/* Driver 2 Years */}
          <VStack spacing="sm" align="stretch">
            <Text fontSize="sm" color="text-muted" textAlign="center">
              {driver2?.fullName} - Years
            </Text>
            <VStack spacing="xs">
              {yearOptions.map((year) => {
                const yearValue = String(year.value);
                return (
                  <Button
                    key={yearValue}
                    size="sm"
                    variant={selectedYears2.includes(yearValue) ? "solid" : "outline"}
                    colorScheme={selectedYears2.includes(yearValue) ? "blue" : "gray"}
                    onClick={() => {
                      handleYearSelection(2, yearValue);
                      // Also trigger live stats update for this year
                      if (driver2) {
                        const yearNumber = parseInt(yearValue, 10) as number;
                        selectDriver(2, String(driver2.id), yearNumber);
                      }
                    }}
                    w="full"
                  >
                    {year.label}
                  </Button>
                );
              })}
            </VStack>
          </VStack>
        </Grid>
      </VStack>

      {/* Metrics Selection */}
      <VStack spacing="md" w="full" maxW="600px" mx="auto">
        <Text fontFamily="heading" fontWeight="bold" color="text-primary">
          Select Metrics to Compare
        </Text>
        
        <Grid templateColumns="repeat(auto-fit, minmax(150px, 1fr))" gap="sm" w="full">
          {Object.entries(availableMetrics).map(([key, label]) => (
            <Button
              key={key}
              size="sm"
              variant={enabledMetrics[key as keyof typeof enabledMetrics] ? "solid" : "outline"}
              colorScheme={enabledMetrics[key as keyof typeof enabledMetrics] ? "blue" : "gray"}
              onClick={() => toggleMetric(key as keyof typeof enabledMetrics)}
              w="full"
            >
              {label}
            </Button>
          ))}
        </Grid>
      </VStack>
    </VStack>
  );

  // Step 3: Results Display Component
  const Step3Results = () => {
    // Get driver headshots - use stats data if available, fallback to legacy
    const driver1Headshot = (stats1 ? driverHeadshots[driver1?.fullName || ''] : driver1 ? driverHeadshots[driver1.fullName] : null);
    const driver2Headshot = (stats2 ? driverHeadshots[driver2?.fullName || ''] : driver2 ? driverHeadshots[driver2.fullName] : null);

    // Get team colors - use stats data if available, fallback to legacy
    const driver1TeamColor = (stats1 ? getTeamColor(driverTeamMapping[driver1?.id || ''] || '') : driver1 ? getTeamColor(driverTeamMapping[driver1.id] || '') : '#e10600');
    const driver2TeamColor = (stats2 ? getTeamColor(driverTeamMapping[driver2?.id || ''] || '') : driver2 ? getTeamColor(driverTeamMapping[driver2.id] || '') : '#e10600');

    return (
      <VStack spacing="lg" w="full">
        <Heading size="lg" fontFamily="heading" color="text-primary" textAlign="center">
          Comparison Results
        </Heading>

        {/* Animated Composite Score */}
        {!loading && score && (
          <AnimatedCompositeScore
            score={score}
            driver1TeamColor={driver1TeamColor}
            driver2TeamColor={driver2TeamColor}
            driver1Name={driver1?.fullName}
            driver2Name={driver2?.fullName}
          />
        )}

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
            
            {/* Driver Headshots and Names */}
            {!loading && (
              <Grid templateColumns="1fr auto 1fr" gap="lg" w="full" maxW="800px" mx="auto" alignItems="center">
              {/* Driver 1 */}
              <VStack spacing="md" align="center">
                <Box position="relative">
                  <Image
                    src={driver1Headshot || '/default-driver.png'}
                    alt={driver1?.fullName || 'Driver 1'}
                    w="120px"
                    h="120px"
                    borderRadius="full"
                    objectFit="cover"
                    border="3px solid"
                    borderColor={driver1TeamColor}
                    boxShadow={`0 0 20px ${driver1TeamColor}40`}
                  />
                </Box>
                <VStack spacing="xs" textAlign="center">
                  <Text fontFamily="heading" fontWeight="bold" fontSize="lg" color="text-primary">
                    {driver1?.fullName || 'Driver 1'}
                  </Text>
                  {driver1?.teamName && (
                    <Text fontSize="sm" color="text-muted">
                      {driver1.teamName}
                    </Text>
                  )}
                </VStack>
              </VStack>

              {/* VS Badge */}
              <VStack spacing="sm">
                <Badge
                  bg="bg-glassmorphism"
                  color="text-primary"
                  px="md"
                  py="sm"
                  borderRadius="full"
                  fontSize="sm"
                  fontFamily="heading"
                  fontWeight="bold"
                  border="1px solid"
                  borderColor="border-accent"
                >
                  VS
                </Badge>
              </VStack>

              {/* Driver 2 */}
              <VStack spacing="md" align="center">
                <Box position="relative">
                  <Image
                    src={driver2Headshot || '/default-driver.png'}
                    alt={driver2?.fullName || 'Driver 2'}
                    w="120px"
                    h="120px"
                    borderRadius="full"
                    objectFit="cover"
                    border="3px solid"
                    borderColor={driver2TeamColor}
                    boxShadow={`0 0 20px ${driver2TeamColor}40`}
                  />
                </Box>
                <VStack spacing="xs" textAlign="center">
                  <Text fontFamily="heading" fontWeight="bold" fontSize="lg" color="text-primary">
                    {driver2?.fullName || 'Driver 2'}
                  </Text>
                  {driver2?.teamName && (
                    <Text fontSize="sm" color="text-muted">
                      {driver2.teamName}
                    </Text>
                  )}
                </VStack>
              </VStack>
            </Grid>
            )}

            {/* Animated Statistics */}
            {!loading && stats1 && stats2 && (
              <AnimatedStatistics
                driver1={driver1}
                driver2={driver2}
                stats1={stats1}
                stats2={stats2}
                enabledMetrics={enabledMetrics}
                driver1TeamColor={driver1TeamColor}
                driver2TeamColor={driver2TeamColor}
              />
            )}
          </VStack>
        </Box>

        {/* Export Button */}
        <Button
          leftIcon={<Download size={16} />}
          onClick={handleExportPdf}
          colorScheme="blue"
          size="lg"
          fontFamily="heading"
        >
          Export Results
        </Button>
      </VStack>
    );
  };

  // Main render
  if (!isAuthenticated) {
    return (
      <Box p="lg" textAlign="center">
        <VStack spacing="md">
          <Heading size="lg" fontFamily="heading" color="text-primary">
            Please log in to compare drivers
          </Heading>
          <Button onClick={() => loginWithRedirect()} colorScheme="blue" size="lg">
            Log In
          </Button>
        </VStack>
      </Box>
    );
  }

  return (
    <Box p="lg" minH="100vh" bg="bg-primary">
      <PageHeader title="Compare Drivers" />
      
      {/* Error Display */}
      {error && (
        <Box p="md" bg="red.50" border="1px solid" borderColor="red.200" borderRadius="md" mb="lg">
          <Text color="red.600" fontFamily="heading">
            Error: {error}
          </Text>
        </Box>
      )}

      {/* Main Content */}
      <VStack spacing="lg" w="full" maxW="1200px" mx="auto">
        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === 'drivers' && (
            <motion.div
              key="drivers"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              style={{ width: '100%' }}
            >
              <Step1DriverSelection />
            </motion.div>
          )}
          
          {currentStep === 'parameters' && (
            <motion.div
              key="parameters"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              style={{ width: '100%' }}
            >
              <Step2Parameters />
            </motion.div>
          )}
          
          {currentStep === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              style={{ width: '100%' }}
            >
              <Step3Results />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Controls */}
        <HStack spacing="md" justify="center" w="full">
          {currentStep !== 'drivers' && (
            <Button
              leftIcon={<ChevronLeft size={16} />}
              onClick={prevStep}
              variant="outline"
              size="lg"
              fontFamily="heading"
            >
              Previous
            </Button>
          )}
          
          {currentStep !== 'results' && (
            <Button
              rightIcon={<ChevronRight size={16} />}
              onClick={nextStep}
              isDisabled={
                (currentStep === 'drivers' && !canProceedToParameters) ||
                (currentStep === 'parameters' && !canProceedToResults)
              }
              colorScheme="blue"
              size="lg"
              fontFamily="heading"
            >
              Next
            </Button>
          )}
        </HStack>
      </VStack>
    </Box>
  );
};

export default CompareDriversPage;