// frontend/src/pages/CompareDriversPage/CompareDriversPage.tsx
import { useAuth0 } from '@auth0/auth0-react';
import { Box, Heading, Grid, Flex, Text, Button } from '@chakra-ui/react';
import { useDriverComparison } from '../../hooks/useDriverComparison';
import type { SelectOption } from '../../components/DropDownSearch/SearchableSelect';
import { DriverSelectionPanel } from './components/DriverSelectionPanel';
import { ComparisonTable } from './components/ComparisonTable';
import F1LoadingSpinner from '../../components/F1LoadingSpinner/F1LoadingSpinner';

const CompareDriversPage = () => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  // ✅ This hook should internally fetch:
  // - /api/drivers (for dropdowns)
  // - /api/drivers/:id/stats (for selected driver details)
  const { allDrivers, driver1, driver2, loading, error, handleSelectDriver } =
    useDriverComparison();

  // Build dropdown options with the new entity getter full_name
  const driverOptions: SelectOption[] = allDrivers.map((d) => ({
    value: d.id,
    label: d.full_name,
  }));

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

      {loading && <F1LoadingSpinner text="Fetching data..." />}
      {error && <Text color="brand.red" textAlign="center" fontSize="lg" p="xl">{error}</Text>}

      <Grid
        templateColumns={{ base: '1fr', lg: '1fr auto 1fr' }}
        gap="lg"
        mb="xl"
        alignItems="flex-start"
        // Hide grid while initial driver list is loading
        display={loading && !allDrivers.length ? 'none' : 'grid'}
      >
        <DriverSelectionPanel
          title="Driver 1"
          allDrivers={driverOptions}
          selectedDriverData={driver1}
          onDriverSelect={(id) => handleSelectDriver(1, id)}
          isLoading={loading}
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
          onDriverSelect={(id) => handleSelectDriver(2, id)}
          isLoading={loading}
        />
      </Grid>

      {driver1 && driver2 && (
        <ComparisonTable driver1={driver1} driver2={driver2} />
      )}
    </Box>
  );
};

export default CompareDriversPage;
