import React from 'react';
import { Container, Box, Text, VStack, Button, Alert, AlertIcon, AlertTitle, Heading, Flex } from '@chakra-ui/react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useDriverDetails } from '../../hooks/useDriverDetails';
import DashboardGrid from '../../components/DashboardGrid/DashboardGrid';
import KeyInfoBar from '../../components/KeyInfoBar/KeyInfoBar';
import F1LoadingSpinner from '../../components/F1LoadingSpinner/F1LoadingSpinner';
import ReactCountryFlag from 'react-country-flag';
import { countryCodeMap } from '../../lib/countryCodeUtils';
import { teamCarImages } from '../../lib/teamCars';

const FallbackBanner = () => (
  <Container maxW="1400px" pt={4}>
    <Alert status="warning" variant="solid" bg="brand.red" color="white" borderRadius="md">
      <AlertIcon as={AlertTriangle} color="white" />
      <AlertTitle fontFamily="heading" fontSize="md">Live Data Unavailable. Showing cached data.</AlertTitle>
    </Alert>
  </Container>
);

const DriverDetailPage: React.FC = () => {
  const { driverId } = useParams<{ driverId: string }>();
  const { driverDetails, loading, error, isFallback } = useDriverDetails(driverId);

  if (loading) return <F1LoadingSpinner text="Loading Driver Details..." />;
  
  if (error && !driverDetails) {
    return (
      <Container centerContent>
        <VStack spacing={4} mt={10}>
          <Text fontSize="2xl" color="text-primary">{error}</Text>
          <Link to="/drivers">
            <Button leftIcon={<ArrowLeft />} colorScheme="red" variant="outline">Back to Drivers</Button>
          </Link>
        </VStack>
      </Container>
    );
  }
  
  if (!driverDetails) return <Text p="lg">Driver not found.</Text>;

  const twoLetterCountryCode = countryCodeMap[driverDetails.countryCode?.toUpperCase()] || driverDetails.countryCode;

  return (
    <Box>
      {isFallback && <FallbackBanner />}
      <Box
        position="relative"
        minH="40vh"
        bgImage={`url(${teamCarImages[driverDetails.teamName] || "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13"})`}
        bgSize="cover"
        bgPosition="center 80%"
        _before={{
          content: '""', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          bgGradient: 'linear(to-t, blackAlpha.800 10%, blackAlpha.600 50%, blackAlpha.400 100%)',
          zIndex: 1,
        }}
      >
        <Container maxW="1400px" h="40vh" position="relative" zIndex={2} display="flex" alignItems="flex-end">
          <Flex justify="space-between" align="flex-end" w="100%" pb="xl">
            <VStack align="flex-start" spacing={0}>
              <Heading as="h1" lineHeight={1} color="white" textShadow="0 2px 10px rgba(0,0,0,0.5)">
                <Text fontFamily="signature" fontSize={{ base: '5xl', md: '7xl' }} fontWeight="normal" mb={{ base: -4, md: -8 }}>
                  {driverDetails.firstName}
                </Text>
                <Text fontFamily="heading" fontSize={{ base: '4xl', md: '6xl' }} fontWeight="bold" textTransform="uppercase">
                  {driverDetails.lastName}
                </Text>
              </Heading>
            </VStack>
            <Flex
              align="center"
              gap="md"
              color="whiteAlpha.800"
              bg="blackAlpha.400"
              p="sm"
              borderRadius="md"
              backdropFilter="blur(5px)"
            >
              <ReactCountryFlag countryCode={twoLetterCountryCode.toLowerCase()} svg style={{ width: '40px', height: '30px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }} title={driverDetails.countryCode} />
              <Text fontSize="sm">Born: {new Date(driverDetails.dateOfBirth).toLocaleDateString()}</Text>
            </Flex>
          </Flex>
        </Container>
      </Box>

      <KeyInfoBar driver={driverDetails} />

      <Container maxW="1400px" py="xl">
        <Link to="/drivers">
          <Button leftIcon={<ArrowLeft />} variant="outline" mb="lg">
            Back to Drivers
          </Button>
        </Link>
        <DashboardGrid driver={driverDetails} />
        <Box mt={8} p="lg" border="1px solid" borderColor="border-primary" borderRadius="lg" bg="bg-surface">
          <Heading size="md" mb={2}>Fastest Lap (Latest Race)</Heading>
          <Text color="text-muted">Feature coming soon. API endpoint required.</Text>
        </Box>
      </Container>
    </Box>
  );
};

export default DriverDetailPage;