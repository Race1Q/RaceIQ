import React from 'react';
import { VStack, Heading, Text, Badge, HStack, Icon, Grid, GridItem, Box } from '@chakra-ui/react';
import ReactCountryFlag from 'react-country-flag';
import { countryCodeMap, getCountryFlagUrl } from '../../lib/countryCodeUtils';
import { Trophy } from 'lucide-react';
import type { RaceWithPodium } from '../../hooks/useHomePageData';
import type { RaceStatus } from './RaceSlider';

interface RaceCardProps {
  race: RaceWithPodium;
  isActive: boolean;
  status: RaceStatus;
}

// Helper to format date to DD/MM/YYYY
const formatDate = (date: Date): string => {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export const RaceCard: React.FC<RaceCardProps> = ({ race, isActive, status }) => {
  const titleMap: { [key in RaceStatus]: string } = {
    past: 'Completed',
    previous: 'Previous Race',
    live: 'Live Now',
    'next-upcoming': 'Up Next',
    future: 'Upcoming',
  };

  const getPodiumColor = (position: number) => {
    if (position === 1) return '#FFD700';
    if (position === 2) return '#C0C0C0';
    if (position === 3) return '#CD7F32';
    return 'text.primary';
  };


  return (
    <VStack
      p={4}
      bg="bg-surface-raised"
      borderRadius="xl"
      transition="all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
      transform={isActive ? 'scale(1.1)' : 'scale(0.9)'}
      opacity={isActive ? 1 : 0.6}
      w="100%"
      h="200px"
      textAlign="center"
      spacing={2}
      display="flex"
      flexDirection="column"
      justifyContent={(status === 'past' || status === 'previous') ? 'space-between' : 'center'}
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '80%',
        height: '2px',
        bg: 'brand.red',
        opacity: isActive ? 1 : 0,
        transition: 'opacity 0.3s',
      }}
      _after={{
        content: '""',
        position: 'absolute',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '80%',
        height: '2px',
        bg: 'brand.red',
        opacity: isActive ? 1 : 0,
        transition: 'opacity 0.3s',
      }}
    >
      {/* ===== HEADER ===== */}
      <VStack spacing={1}>
        <Box h="22px">
          {status === 'previous' ? (
            <HStack justify="center">
              <Badge colorScheme="gray" variant="subtle">Previous Race</Badge>
              <Badge colorScheme="gray" variant="subtle">Completed</Badge>
            </HStack>
          ) : (
            <Badge
              colorScheme={status === 'live' || status === 'next-upcoming' ? 'red' : 'gray'}
              variant="subtle"
            >
              {titleMap[status]}
            </Badge>
          )}
        </Box>
        <Heading size="md" color={isActive ? 'brand.red' : 'text-primary'}>{race.name}</Heading>
      </VStack>

      {/* ===== FLEXIBLE BODY ===== */}
      {(status === 'past' || status === 'previous') && (
        <Box flex={1} w="100%" overflow="hidden" py={1} display="flex" alignItems="center" justifyContent="center">
          {race.podium && (
            <Grid templateColumns="max-content auto" columnGap={4} rowGap={1}>
              {race.podium.map((p) => {
                const threeLetter = p.countryCode?.toUpperCase() ?? '';
                const twoLetterCode = threeLetter ? countryCodeMap[threeLetter] : '';
                const flagUrl = getCountryFlagUrl(threeLetter);
                return (
                  <React.Fragment key={p.position}>
                    <GridItem>
                      <HStack>
                        <Icon as={Trophy} color={getPodiumColor(p.position)} boxSize={4} />
                        <Text fontSize="sm" fontWeight="bold">{p.position}</Text>
                      </HStack>
                    </GridItem>
                  <GridItem>
                    <HStack spacing={2} justify="flex-start">
                      {flagUrl ? (
                        <img
                          src={flagUrl}
                          alt={`${threeLetter} flag`}
                          style={{ width: '32px', height: '24px', borderRadius: '3px' }}
                          loading="lazy"
                        />
                      ) : (
                        twoLetterCode ? (
                          <ReactCountryFlag
                            countryCode={twoLetterCode.toLowerCase()}
                            svg
                            style={{ width: '32px', height: '24px', borderRadius: '3px' }}
                            title={p.countryCode}
                          />
                        ) : null
                      )}
                      <Text fontSize="sm" noOfLines={1} textAlign="left">
                        {p.driverName}
                      </Text>
                    </HStack>
                  </GridItem>
                  </React.Fragment>
                );
              })}
            </Grid>
          )}
        </Box>
      )}

      {/* ===== FOOTER ===== */}
      <Text fontSize="sm" color="text-secondary">
        {formatDate(new Date(race.date))}
      </Text>
    </VStack>
  );
};


