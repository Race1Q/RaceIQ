// frontend/src/components/FeaturedDriverSection/FeaturedDriverSection.tsx

import React from 'react';
import {
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Image,
  SimpleGrid,
  StackDivider,
} from '@chakra-ui/react';
import { Icon } from '@chakra-ui/icons';
import { Trophy, Award, Timer, Star } from 'lucide-react';
import { driverHeadshots } from '../../lib/driverHeadshots';
import { teamColors } from '../../lib/teamColors';
import { countryCodeMap } from '../../lib/countryCodeUtils';
import ReactCountryFlag from 'react-country-flag';

import type { FeaturedDriver } from '../../types';

export interface FeaturedDriverSectionProps {
  featuredDriver: FeaturedDriver | null;
  isError: boolean;
}

const FeaturedDriverSection: React.FC<FeaturedDriverSectionProps> = ({ featuredDriver, isError }) => {
  if (!featuredDriver) {
    return null;
  }

  // Import optimization utility at top of file
  const imageUrl = driverHeadshots[featuredDriver.fullName] || 'https://media.formula1.com/content/dam/fom-website/drivers/placeholder.png.transform/2col/image.png';

  const getTeamColor = (teamName: string): string => {
    const hex = teamColors[teamName] ?? teamColors['Default'];
    return `#${hex}`;
  };


  // Deprecated: inline stat cards now include icons; keeping for reference

  return (
    <Box bg="bg-surface-raised" w="100%">
      <Container maxW="1400px" py={{ base: 6, md: 8 }} px={{ base: 4, md: 6 }} w="100%">
        <Heading
          as="h4"
          size="sm"
          color="brand.red"
          textTransform="uppercase"
          letterSpacing="wider"
          fontWeight="bold"
          mb={6}
          textAlign="left"
        >
          Featured Driver - Best recent form
        </Heading>
        <Grid templateColumns={{ base: '1fr', lg: '0.4fr 0.6fr' }} gap={{ base: 6, lg: 8 }} alignItems="stretch">
          {/* Left: Driver Card */}
          <GridItem
            bg="bg-surface"
            borderRadius="lg"
            p={{ base: 4, md: 6 }}
            height="100%"
            position="relative"
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              bg: getTeamColor(featuredDriver.teamName),
              borderTopLeftRadius: 'lg',
              borderTopRightRadius: 'lg',
            }}
          >
            <VStack spacing={4} align="center" height="100%" >
              {isError && (
                <Badge colorScheme="orange" variant="subtle" fontSize="0.7rem">Live Data Unavailable</Badge>
              )}
              <Box w="100%" display="flex" justifyContent="center" alignItems="center">
                <Image
                  src={imageUrl}
                  alt={featuredDriver.fullName}
                  w="100%"
                  maxW={{ base: '200px', md: '300px' }}
                  maxH={{ base: '180px', md: '320px' }}
                  h={{ base: 'auto', md: '320px' }}
                  objectFit="contain"
                  objectPosition="center"
                  borderRadius="lg"
                  loading="lazy"
                  decoding="async"
                  fallbackSrc="https://media.formula1.com/content/dam/fom-website/drivers/placeholder.png.transform/2col-retina/image.png"
                />
              </Box>
              <VStack align="center" spacing={1} mt={2}>
                <Heading size={{ base: 'xl', md: '2xl' }} fontFamily="heading" color="text-primary" textAlign="center">
                  {featuredDriver.fullName}
                </Heading>
                <HStack
                  divider={<StackDivider borderColor="border-primary" />}
                  spacing={{ base: 2, md: 4 }}
                  fontSize={{ base: 'md', md: 'lg' }}
                  flexWrap="wrap"
                >
                  <Text fontWeight="bold" color={getTeamColor(featuredDriver.teamName)}>
                    {featuredDriver.teamName}{featuredDriver.driverNumber ? ` • #${featuredDriver.driverNumber}` : ''}
                  </Text>
                  <HStack spacing={1.5}>
                    <Heading size={{ base: 'md', md: 'lg' }} color="text-primary">P</Heading>
                    <Heading size={{ base: 'md', md: 'lg' }} color="text-primary">{featuredDriver.position}</Heading>
                  </HStack>
                </HStack>
              </VStack>
            </VStack>
          </GridItem>

          {/* Right: Stats & CTA */}
          <GridItem overflow="hidden">
            <VStack align="flex-start" spacing={{ base: 4, md: 6 }} w="full" overflow="hidden">
              {/* Season Stats */}
              <VStack align="flex-start" spacing={{ base: 2, md: 3 }} w="full">
                <Heading as="h3" size={{ base: 'sm', md: 'md' }} color="text-primary">{new Date().getFullYear()} Season</Heading>
                <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={{ base: 3, md: 4 }} w="full">
                  <VStack
                    role="group"
                    bg="bg-surface"
                    p={{ base: 2, md: 4 }}
                    borderRadius="lg"
                    align="center"
                    spacing={1}
                    borderWidth="1px"
                    borderColor="border-primary"
                    _hover={{
                      transform: 'scale(1.05)',
                      borderColor: 'brand.red',
                      boxShadow: `0 0 14px ${getTeamColor(featuredDriver.teamName)}80`,
                    }}
                    transition="transform 0.2s, border-color 0.2s, box-shadow 0.2s"
                  >
                    <HStack spacing={1}>
                      <Icon as={Star} color="text-muted" boxSize={4} _groupHover={{ color: getTeamColor(featuredDriver.teamName) }} />
                      <Text fontSize={{ base: 'xs', md: 'sm' }} color="text-muted" _groupHover={{ color: getTeamColor(featuredDriver.teamName) }}>Points</Text>
                    </HStack>
                    <Heading size={{ base: 'md', md: 'lg' }} color="text-primary" _groupHover={{ color: getTeamColor(featuredDriver.teamName) }}>{featuredDriver.seasonPoints}</Heading>
                  </VStack>

                  <VStack
                    role="group"
                    bg="bg-surface"
                    p={{ base: 2, md: 4 }}
                    borderRadius="lg"
                    align="center"
                    spacing={1}
                    borderWidth="1px"
                    borderColor="border-primary"
                    _hover={{
                      transform: 'scale(1.05)',
                      borderColor: 'brand.red',
                      boxShadow: `0 0 14px ${getTeamColor(featuredDriver.teamName)}80`,
                    }}
                    transition="transform 0.2s, border-color 0.2s, box-shadow 0.2s"
                  >
                    <HStack spacing={1}>
                      <Icon as={Trophy} color="text-muted" boxSize={4} _groupHover={{ color: getTeamColor(featuredDriver.teamName) }} />
                      <Text fontSize={{ base: 'xs', md: 'sm' }} color="text-muted" _groupHover={{ color: getTeamColor(featuredDriver.teamName) }}>Wins</Text>
                    </HStack>
                    <Heading size={{ base: 'md', md: 'lg' }} color="text-primary" _groupHover={{ color: getTeamColor(featuredDriver.teamName) }}>{featuredDriver.seasonWins}</Heading>
                  </VStack>

                  <VStack
                    role="group"
                    bg="bg-surface"
                    p={{ base: 2, md: 4 }}
                    borderRadius="lg"
                    align="center"
                    spacing={1}
                    borderWidth="1px"
                    borderColor="border-primary"
                    _hover={{
                      transform: 'scale(1.05)',
                      borderColor: 'brand.red',
                      boxShadow: `0 0 14px ${getTeamColor(featuredDriver.teamName)}80`,
                    }}
                    transition="transform 0.2s, border-color 0.2s, box-shadow 0.2s"
                  >
                    <HStack spacing={1}>
                      <Icon as={Timer} color="text-muted" boxSize={4} _groupHover={{ color: getTeamColor(featuredDriver.teamName) }} />
                      <Text fontSize={{ base: 'xs', md: 'sm' }} color="text-muted" _groupHover={{ color: getTeamColor(featuredDriver.teamName) }}>Poles</Text>
                    </HStack>
                    <Heading size={{ base: 'md', md: 'lg' }} color="text-primary" _groupHover={{ color: getTeamColor(featuredDriver.teamName) }}>{featuredDriver.seasonPoles}</Heading>
                  </VStack>
                </SimpleGrid>
              </VStack>

              {/* Career Stats */}
              <VStack align="flex-start" spacing={{ base: 2, md: 3 }} w="full">
                <Heading as="h3" size={{ base: 'sm', md: 'md' }} color="text-primary">Career Stats</Heading>
                <SimpleGrid columns={{ base: 1, sm: 2 }} gap={{ base: 3, md: 4 }} w="full">
                  <VStack
                    role="group"
                    bg="bg-surface"
                    p={{ base: 2, md: 4 }}
                    borderRadius="lg"
                    align="center"
                    spacing={1}
                    borderWidth="1px"
                    borderColor="border-primary"
                    _hover={{
                      transform: 'scale(1.05)',
                      borderColor: 'brand.red',
                      boxShadow: `0 0 14px ${getTeamColor(featuredDriver.teamName)}80`,
                    }}
                    transition="transform 0.2s, border-color 0.2s, box-shadow 0.2s"
                  >
                    <HStack spacing={1}>
                      <Icon as={Trophy} color="text-muted" boxSize={4} _groupHover={{ color: getTeamColor(featuredDriver.teamName) }} />
                      <Text fontSize={{ base: 'xs', md: 'sm' }} color="text-muted" _groupHover={{ color: getTeamColor(featuredDriver.teamName) }}>Wins</Text>
                    </HStack>
                    <Heading size={{ base: 'md', md: 'lg' }} color="text-primary" _groupHover={{ color: getTeamColor(featuredDriver.teamName) }}>{featuredDriver.careerStats.wins}</Heading>
                  </VStack>

                  <VStack
                    role="group"
                    bg="bg-surface"
                    p={{ base: 2, md: 4 }}
                    borderRadius="lg"
                    align="center"
                    spacing={1}
                    borderWidth="1px"
                    borderColor="border-primary"
                    _hover={{
                      transform: 'scale(1.05)',
                      borderColor: 'brand.red',
                      boxShadow: `0 0 14px ${getTeamColor(featuredDriver.teamName)}80`,
                    }}
                    transition="transform 0.2s, border-color 0.2s, box-shadow 0.2s"
                  >
                    <HStack spacing={1}>
                      <Icon as={Award} color="text-muted" boxSize={4} _groupHover={{ color: getTeamColor(featuredDriver.teamName) }} />
                      <Text fontSize={{ base: 'xs', md: 'sm' }} color="text-muted" _groupHover={{ color: getTeamColor(featuredDriver.teamName) }}>Podiums</Text>
                    </HStack>
                    <Heading size={{ base: 'md', md: 'lg' }} color="text-primary" _groupHover={{ color: getTeamColor(featuredDriver.teamName) }}>{featuredDriver.careerStats.podiums}</Heading>
                  </VStack>
                </SimpleGrid>
              </VStack>

              {/* Recent Form (mini cards with flags) */}
              {Array.isArray((featuredDriver as any).recentForm) && (featuredDriver as any).recentForm.length > 0 && (
                <VStack align="flex-start" w="100%" spacing={{ base: 2, md: 3 }} pt={4}>
                  <Heading as="h3" size={{ base: 'sm', md: 'md' }}>Recent Form</Heading>
                  <HStack spacing={{ base: 2, md: 4 }} w="100%" align="stretch" overflowX="auto" pb={2}>
                    {((featuredDriver as any).recentForm as { position: number; raceName: string; countryCode: string }[]).map((result, index) => {
                      const getPodiumColor = () => {
                        if (result.position === 1) return '#FFD700'; // Gold
                        if (result.position === 2) return '#C0C0C0'; // Silver
                        if (result.position === 3) return '#CD7F32'; // Bronze
                        return 'text-primary';
                      };

                      return (
                        <VStack
                          key={index}
                          role="group"
                          flex={1}
                          minW={{ base: '80px', md: '100px' }}
                          bg="bg-surface"
                          p={{ base: 2, md: 4 }}
                          borderRadius="lg"
                          borderWidth="1px"
                          borderColor="border-primary"
                          align="center"
                          justify="space-between"
                          spacing={2}
                          opacity={1 - index * 0.15}
                          transition="all 0.2s"
                          _hover={{
                            transform: 'translateY(-4px)',
                            borderColor: 'brand.red',
                            boxShadow: `0 0 14px ${getTeamColor(featuredDriver.teamName)}80`,
                          }}
                        >
                          {/* Position on top */}
                          <HStack spacing={1} align="center">
                            <Heading size="xl" color={getPodiumColor()} fontWeight="bold">
                              P{result.position}
                            </Heading>
                            {result.position === 1 && (
                              <Icon as={Trophy} boxSize={5} color="#FFD700" aria-label="Winner" />
                            )}
                          </HStack>
                          {/* Race name in the middle */}
                          <Text fontSize="xs" color="white" noOfLines={2} textAlign="center" _groupHover={{ color: getTeamColor(featuredDriver.teamName) }}>
                            {result.raceName.replace('Grand Prix', 'GP')}
                          </Text>
                          {/* Flag at the bottom */}
                          {(() => {
                            const twoLetter = countryCodeMap[result.countryCode?.toUpperCase()] || result.countryCode;
                            return twoLetter ? (
                              <ReactCountryFlag
                                countryCode={twoLetter.toLowerCase()}
                                svg
                                style={{ width: '32px', height: '24px', borderRadius: '4px' }}
                                title={result.raceName}
                              />
                            ) : null;
                          })()}
                        </VStack>
                      );
                    })}
                  </HStack>
                </VStack>
              )}

              {/* CTA removed as requested */}
            </VStack>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
};

export default FeaturedDriverSection;


