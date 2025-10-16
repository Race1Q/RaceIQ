import { useState, useEffect } from 'react';
import { Heading, Text, VStack, HStack, Icon } from '@chakra-ui/react';
import { MapPin, Clock } from 'lucide-react';
import type { NextRace } from '../../../types';
import { useThemeColor } from '../../../context/ThemeColorContext';
import WidgetCard from './WidgetCard';
import PodiumPredictionWidget from './PodiumPredictionWidget';

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
        <PodiumPredictionWidget />
      </VStack>
    </WidgetCard>
  );
}

export default NextRaceWidget;
