import { Heading, Text, VStack, HStack, Icon } from '@chakra-ui/react';
import { MapPin, Clock } from 'lucide-react';
import WidgetCard from './WidgetCard';

function NextRaceWidget() {
  return (
    <WidgetCard>
      <VStack align="start" spacing="md">
        <Heading color="brand.red" size="md" fontFamily="heading">
          Next Race: Italian Grand Prix
        </Heading>
        
        <HStack spacing="sm" align="center">
          <Icon as={MapPin} boxSize={4} color="brand.red" />
          <Text color="text-secondary" fontSize="sm" fontFamily="body">
            Monza Circuit
          </Text>
        </HStack>
        
        <VStack align="start" spacing="xs">
          <HStack spacing="sm" align="center">
            <Icon as={Clock} boxSize={4} color="brand.red" />
            <Text color="text-muted" fontSize="xs" fontFamily="body" textTransform="uppercase" letterSpacing="wide">
              Time Until Race
            </Text>
          </HStack>
          <Text 
            color="brand.red" 
            fontSize="2xl" 
            fontWeight="bold" 
            fontFamily="mono"
            letterSpacing="wide"
          >
            2 Days : 10 Hours : 45 Mins
          </Text>
        </VStack>
      </VStack>
    </WidgetCard>
  );
}

export default NextRaceWidget;
