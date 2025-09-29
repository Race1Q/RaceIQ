// frontend/src/pages/CompareDriversPage/CompareDriversPage.tsx
import { useAuth0 } from '@auth0/auth0-react';
import { Box, Heading, Grid, Flex, Text, Button, VStack, HStack } from '@chakra-ui/react';
import { useDriverComparison } from '../../hooks/useDriverComparison';
import type { SelectOption } from '../../components/DropDownSearch/SearchableSelect';
import { DriverSelectionPanel } from './components/DriverSelectionPanel';
import { ComparisonTable } from './components/ComparisonTable';
import F1LoadingSpinner from '../../components/F1LoadingSpinner/F1LoadingSpinner';


const CompareDriversPage = () => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();

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
    selection1,
    selection2,
    stats1,
    stats2,
    enabledMetrics,
    score,
    selectDriver,
    toggleMetric,
  } = useDriverComparison();

  // Build dropdown options with proper name fallbacks
  const driverOptions: SelectOption[] = allDrivers.map((d) => {
    // Create a proper display name with fallbacks
    const displayName = d.full_name || 
                       (d.given_name && d.family_name ? `${d.given_name} ${d.family_name}` : '') ||
                       d.code ||
                       `Driver ${d.id}`;
    
    return {
      value: String(d.id),
      label: displayName,
    };
  }).filter(option => option.label.trim() !== ''); // Remove any entries with empty labels





  if (!isAuthenticated) {
    return (
      <Flex direction="column" align="center" justify="center" minH="60vh" gap={4} p="xl">
        <Heading size="md" fontFamily="heading">Login to Compare Drivers</Heading>
        <Text color="text-secondary">Please sign in to access the comparison tool.</Text>
        <Button
          bg="brand.red"
          _hover={{ bg: 'brand.redDark' }}
          color="white"
          onClick={() => loginWithRedirect()}
        >
          Login
        </Button>
      </Flex>
    );
  }

  return (
    <Box p={{ base: 'md', md: 'xl' }}>
      <Heading as="h1" size="2xl" textAlign="center" mb="xl" fontFamily="heading">
        Driver Comparison
      </Heading>

      {error && <Text color="brand.red" textAlign="center" fontSize="lg" p="xl">{error}</Text>}

      {/* Driver Selection Grid - Always visible */}
      <Grid
        templateColumns={{ base: '1fr', lg: '1fr auto 1fr' }}
        gap="lg"
        mb="xl"
        alignItems="flex-start"
      >
        <DriverSelectionPanel
          title="Driver 1"
          allDrivers={driverOptions}
          selectedDriverData={driver1}
          onDriverSelect={(id) => {
            handleSelectDriver(1, String(id)); // Legacy compatibility
            selectDriver(1, String(id), 'career'); // New functionality
          }}
          isLoading={loading}
          // NEW: Year selection support - using simplified controls in panel
          extraControl={selection1 ? (
            <VStack spacing="sm" align="stretch" w="100%">
              <Text fontSize="sm" fontWeight="medium" color="text-secondary">
                {selection1.year === 'career' ? 'Career Stats' : `${selection1.year} Season`}
              </Text>
            </VStack>
          ) : null}
        />

        <Flex
          align="center"
          justify="center"
          h="150px"
          display={{ base: 'none', lg: 'flex' }}
        >
          <Heading size="3xl" color="brand.red" fontFamily="heading">
            VS
          </Heading>
        </Flex>

        <DriverSelectionPanel
          title="Driver 2"
          allDrivers={driverOptions}
          selectedDriverData={driver2}
          onDriverSelect={(id) => {
            handleSelectDriver(2, String(id)); // Legacy compatibility
            selectDriver(2, String(id), 'career'); // New functionality
          }}
          isLoading={loading}
          // NEW: Year selection support - using simplified controls in panel  
          extraControl={selection2 ? (
            <VStack spacing="sm" align="stretch" w="100%">
              <Text fontSize="sm" fontWeight="medium" color="text-secondary">
                {selection2.year === 'career' ? 'Career Stats' : `${selection2.year} Season`}
              </Text>
            </VStack>
          ) : null}
        />
      </Grid>

      {/* Loading Spinner - Below driver selection cards */}
      {loading && <F1LoadingSpinner text="Loading comparison data..." />}

      {/* Comparison Table - Only show when both drivers are selected and not loading */}
      {driver1 && driver2 && !loading && (
        <ComparisonTable 
          driver1={driver1} 
          driver2={driver2} 
          // NEW: Pass additional stats for enhanced comparison
          stats1={stats1}
          stats2={stats2}
          enabledMetrics={enabledMetrics}
          selection1={selection1}
          selection2={selection2}
          score={score}
          // NEW: Pass handlers for the updated filter styling
          onYearChange={(driverIndex, year) => {
            const driverId = driverIndex === 1 ? selection1?.driverId : selection2?.driverId;
            if (driverId) {
              selectDriver(driverIndex, driverId, year);
            }
          }}
          onMetricToggle={toggleMetric}
          availableYears={years}
        />
      )}
    </Box>
  );
};

export default CompareDriversPage;
