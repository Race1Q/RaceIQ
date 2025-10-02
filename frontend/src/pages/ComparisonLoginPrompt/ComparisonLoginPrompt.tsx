import React from 'react';
import {
  Box,
  VStack,
  Text,
  Button,
  Icon,
  useColorModeValue,
  Heading,
  Grid,
  GridItem,
  List,
  ListItem,
  ListIcon,
  Container,
  Image,
} from '@chakra-ui/react';
import { FaUnlock, FaSignInAlt, FaStar, FaChartBar, FaCog, FaUsers, FaTrophy, FaArrowLeft, FaBalanceScale } from 'react-icons/fa';
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';
// Car images are available in public/assets/2025_Cars/
import { driverHeadshots } from '../../lib/driverHeadshots';

const ComparisonLoginPrompt: React.FC = () => {
  const { loginWithRedirect } = useAuth0();
  
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <Box minH="calc(100vh - 80px)" display="flex" alignItems="center" justifyContent="center" p={4}>
      <Container maxW="container.xl">
        <Grid
          templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
          gap={{ base: 8, md: 12 }}
          alignItems="center"
        >
          {/* --- Left Column: The Value Proposition --- */}
          <GridItem>
            <VStack align="flex-start" spacing={6}>
              <Icon as={FaUnlock} boxSize={10} color="brand.red" />
              <Heading as="h1" size="2xl" fontFamily="heading" color="text-primary">
                Unlock Driver & Team Comparisons
              </Heading>
              <Text color={textColor} fontSize="lg" lineHeight="tall">
                Get access to comprehensive comparison tools, head-to-head analytics, and detailed performance insights to analyze drivers and teams like never before.
              </Text>
              <List spacing={3} color="text-primary">
                <ListItem display="flex" alignItems="center">
                  <ListIcon as={FaBalanceScale} color="brand.red" />
                  Compare drivers head-to-head with detailed statistics
                </ListItem>
                <ListItem display="flex" alignItems="center">
                  <ListIcon as={FaChartBar} color="brand.red" />
                  Analyze performance trends and career trajectories
                </ListItem>
                <ListItem display="flex" alignItems="center">
                  <ListIcon as={FaUsers} color="brand.red" />
                  Compare team performance across seasons
                </ListItem>
                <ListItem display="flex" alignItems="center">
                  <ListIcon as={FaTrophy} color="brand.red" />
                  Track championship battles and standings
                </ListItem>
                <ListItem display="flex" alignItems="center">
                  <ListIcon as={FaCog} color="brand.red" />
                  Customize your comparison preferences
                </ListItem>
              </List>
              <VStack spacing={4} w="100%" maxW="400px">
                <Button
                  leftIcon={<FaSignInAlt />}
                  bg="brand.red"
                  color="white"
                  size="lg"
                  onClick={() => loginWithRedirect()}
                  _hover={{
                    bg: 'red.600',
                    transform: 'translateY(-2px)',
                    boxShadow: 'lg',
                  }}
                  transition="all 0.2s"
                  width="100%"
                  py={6}
                  fontSize="md"
                  fontWeight="semibold"
                >
                  Sign In to Compare
                </Button>
                <Link to="/" style={{ width: '100%' }}>
                  <Button
                    leftIcon={<FaArrowLeft />}
                    variant="outline"
                    size="lg"
                    w="100%"
                    borderColor="brand.red"
                    color="brand.red"
                    _hover={{
                      bg: 'brand.red',
                      color: 'white',
                      transform: 'translateY(-2px)',
                      boxShadow: 'lg',
                    }}
                    transition="all 0.2s"
                    py={6}
                    fontSize="md"
                    fontWeight="semibold"
                  >
                    Back to Home
                  </Button>
                </Link>
              </VStack>
            </VStack>
          </GridItem>

          {/* --- Right Column: The Visual Teaser --- */}
          <GridItem display={{ base: 'none', lg: 'block' }}>
            <Box
              position="relative"
              borderRadius="lg"
              overflow="hidden"
              h="400px"
              bg="blackAlpha.50"
              border="1px solid"
              borderColor={borderColor}
            >
              {/* Car Image Layer */}
              <Image
                src="/assets/2025_Cars/2025ferraricarright.png"
                alt="Ferrari F1 Car"
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                w="120%"
                objectFit="contain"
                opacity={0.4}
                filter="grayscale(20%)"
              />
              
              {/* Driver Headshot Layer */}
              <Image
                src={driverHeadshots['Lewis Hamilton']}
                alt="Lewis Hamilton"
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                h="80%"
                objectFit="contain"
                filter="drop-shadow(0 10px 15px rgba(0,0,0,0.5))"
                opacity={0.8}
              />
              
              {/* Overlay with comparison icon */}
              <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                zIndex={2}
                textAlign="center"
              >
                <Icon as={FaBalanceScale} boxSize={12} color="brand.red" />
              </Box>
              
              {/* Text at bottom */}
              <Box
                position="absolute"
                bottom="10px"
                left="50%"
                transform="translateX(-50%)"
                zIndex={2}
                textAlign="center"
              >
                <Text color="text-primary" fontWeight="bold" fontSize="lg">
                  Create your free account now
                </Text>
              </Box>
            </Box>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
};

export default ComparisonLoginPrompt;
