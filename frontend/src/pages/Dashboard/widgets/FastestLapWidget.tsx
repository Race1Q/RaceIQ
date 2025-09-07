import { Heading, Text, VStack, HStack, Icon } from '@chakra-ui/react';
import { Zap } from 'lucide-react';
import WidgetCard from './WidgetCard';

function FastestLapWidget() {
  return (
    <WidgetCard>
      <VStack align="start" spacing="md">
        <HStack spacing="sm" align="center">
          <Icon as={Zap} boxSize={5} color="brand.red" />
          <Heading color="brand.red" size="md" fontFamily="heading">
            Last Race: Fastest Lap
          </Heading>
        </HStack>
        
        <VStack align="start" spacing="xs">
          <Text 
            color="brand.red" 
            fontSize="4xl" 
            fontWeight="bold" 
            fontFamily="mono"
            letterSpacing="wide"
            lineHeight="1"
          >
            1:27.097
          </Text>
          <Text color="text-muted" fontSize="xs" textTransform="uppercase" letterSpacing="wide">
            Lap Time
          </Text>
        </VStack>
        
        <VStack align="start" spacing="xs">
          <Text color="text-primary" fontSize="lg" fontWeight="600">
            Lewis Hamilton
          </Text>
          <Text color="text-secondary" fontSize="sm">
            Mercedes
          </Text>
        </VStack>
      </VStack>
    </WidgetCard>
  );
}

export default FastestLapWidget;
