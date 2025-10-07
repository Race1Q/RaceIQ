import { Heading, Text, VStack, HStack, Icon } from '@chakra-ui/react';
import { Zap } from 'lucide-react';
import type { FastestLap } from '../../../types';
import WidgetCard from './WidgetCard';
import { useThemeColor } from '../../../context/ThemeColorContext';

interface FastestLapWidgetProps {
  data?: FastestLap;
}

function FastestLapWidget({ data }: FastestLapWidgetProps) {
  const { accentColorWithHash } = useThemeColor();
  
  if (!data) {
    return (
      <WidgetCard>
        <VStack align="start" spacing="md">
          <HStack spacing="sm" align="center">
            <Icon as={Zap} boxSize={5} color={accentColorWithHash} />
            <Heading color={accentColorWithHash} size="md" fontFamily="heading">
              Last Race: Fastest Lap
            </Heading>
          </HStack>
          <Text color="text-muted">Loading...</Text>
        </VStack>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard>
      <VStack align="start" spacing="md">
        <HStack spacing="sm" align="center">
          <Icon as={Zap} boxSize={5} color={accentColorWithHash} />
          <Heading color={accentColorWithHash} size="md" fontFamily="heading">
            Last Race: Fastest Lap
          </Heading>
        </HStack>
        
        <VStack align="start" spacing="xs">
          <Text 
            color={accentColorWithHash} 
            fontSize="4xl" 
            fontWeight="bold" 
            fontFamily="mono"
            letterSpacing="wide"
            lineHeight="1"
          >
            {data.lapTime}
          </Text>
          <Text color="text-muted" fontSize="xs" textTransform="uppercase" letterSpacing="wide">
            Lap Time
          </Text>
        </VStack>
        
        <VStack align="start" spacing="xs">
          <Text color="text-primary" fontSize="lg" fontWeight="600">
            {data.driverFullName}
          </Text>
        </VStack>
      </VStack>
    </WidgetCard>
  );
}

export default FastestLapWidget;
