import { useState, useEffect } from 'react';
import { Heading, Text, VStack, HStack, Icon, Avatar, SimpleGrid, Box } from '@chakra-ui/react';
import { MapPin, Clock } from 'lucide-react';
import type { NextRace } from '../../../types';
import { useThemeColor } from '../../../context/ThemeColorContext';
import WidgetCard from './WidgetCard';
import { computePredictions } from '../../../lib/predictions';

interface NextRaceWidgetProps {
  data?: NextRace;
}

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
}

function NextRaceWidget({ data }: NextRaceWidgetProps) {
  const { accentColorWithHash } = useThemeColor();
  const [countdown, setCountdown] = useState<Countdown | null>(null);
  const [podium, setPodium] = useState<Array<{ driverFullName: string; headshotUrl: string | null; team: string }>>([]);

  useEffect(() => {
    if (!data) return;

    const interval = setInterval(() => {
      const raceDate = new Date(data.raceDate);
      const now = new Date();
      const difference = raceDate.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        setCountdown({ days, hours, minutes });
      } else {
        setCountdown(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [data]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const season = new Date(data?.raceDate ?? Date.now()).getFullYear();
        const preds = await computePredictions(season);
        if (!alive) return;
        setPodium(preds.slice(0, 3).map(p => ({ driverFullName: p.driverFullName, headshotUrl: p.headshotUrl, team: p.team })));
      } catch {
        if (!alive) return;
        setPodium([]);
      }
    })();
    return () => { alive = false; };
  }, [data?.raceDate]);

  if (!data) {
    return (
      <WidgetCard>
        <VStack align="start" spacing="md">
          <Heading color={accentColorWithHash} size="md" fontFamily="heading">
            Next Race
          </Heading>
          <Text color="text-muted">Loading...</Text>
        </VStack>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard>
      <VStack align="start" spacing="md">
        <Heading color={accentColorWithHash} size="md" fontFamily="heading">
          Next Race: {data.raceName}
        </Heading>
        
        <HStack spacing="sm" align="center">
          <Icon as={MapPin} boxSize={4} color={accentColorWithHash} />
          <Text color="text-secondary" fontSize="sm" fontFamily="body">
            {data.circuitName}
          </Text>
        </HStack>
        
        <VStack align="start" spacing="xs">
          <HStack spacing="sm" align="center">
            <Icon as={Clock} boxSize={4} color={accentColorWithHash} />
            <Text color="text-muted" fontSize="xs" fontFamily="body" textTransform="uppercase" letterSpacing="wide">
              Time Until Race
            </Text>
          </HStack>
          {countdown ? (
            <Text 
              color={accentColorWithHash} 
              fontSize="2xl" 
              fontWeight="bold" 
              fontFamily="mono"
              letterSpacing="wide"
            >
              {countdown.days} Days : {countdown.hours} Hours : {countdown.minutes} Mins
            </Text>
          ) : (
            <Text color={accentColorWithHash} fontSize="lg" fontWeight="bold">
              Race has started!
            </Text>
          )}
        </VStack>

        {podium.length > 0 && (
          <VStack align="start" spacing="xs" mt="sm" w="full">
            <Text color="text-muted" fontSize="xs" textTransform="uppercase" letterSpacing="wide">Predicted Podium</Text>
            <SimpleGrid columns={{ base: 3 }} spacing={2} w="full">
              {podium.map((p, idx) => {
                const label = idx === 0 ? 'P1' : idx === 1 ? 'P2' : 'P3';
                const medalHex = idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : '#CD7F32';
                return (
                  <HStack key={idx} spacing={2} p={2} border="1px solid" borderColor="border-subtle" borderRadius="md" bg={`${medalHex}1A`}>
                    <Avatar size="sm" name={p.driverFullName} src={p.headshotUrl || undefined} />
                    <Box>
                      <Text fontSize="sm" fontWeight="semibold">{label}</Text>
                      <Text fontSize="xs" color="text-secondary" noOfLines={1}>{p.driverFullName}</Text>
                    </Box>
                  </HStack>
                );
              })}
            </SimpleGrid>
          </VStack>
        )}
      </VStack>
    </WidgetCard>
  );
}

export default NextRaceWidget;
