// frontend/src/components/RaceDetails/FastestLapWidget.tsx
import { Box, Heading, Text, VStack, Image, Flex, Icon } from '@chakra-ui/react';
import { Zap } from 'lucide-react';
import { driverHeadshots } from '../../lib/driverHeadshots';
import userIcon from '../../assets/UserIcon.png';

interface FastestLap {
  driver_id?: string | number;
  driver_code?: string;
  driver_name?: string;
  constructor_id?: string | number;
  constructor_name?: string;
  lap_number?: number;
  time_ms?: number | null;
}

const FastestLapWidget = ({ data }: { data: FastestLap | null | undefined }) => {
  if (!data) {
    return <Box p={4} border="1px solid" borderColor="border-subtle" borderRadius="lg" bg="bg-elevated"><Text>Fastest Lap data unavailable.</Text></Box>;
  }

  const driverName = data.driver_name || data.driver_code || String(data.driver_id || 'Unknown');
  const headshot = driverHeadshots[driverName] || userIcon;

  const formatLapTime = (ms: number | null | undefined) => {
    if (!ms || ms <= 0) return '--:--.---';
    const date = new Date(ms);
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');
    const milliseconds = date.getUTCMilliseconds().toString().padStart(3, '0');
    return `${minutes}:${seconds}.${milliseconds}`;
  };

  return (
    <Box
      p={4}
      border="2px solid"
      borderColor="#8B5CF6"
      borderRadius="lg"
      bg="bg-elevated"
      position="relative"
      overflow="hidden"
      h="100%"
      boxShadow="0 4px 20px rgba(139, 92, 246, 0.2)"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.8), transparent)',
        animation: 'shimmer 8s infinite',
        borderRadius: 'inherit',
        zIndex: 1,
      }}
      sx={{
        '@keyframes shimmer': {
          '0%': {
            left: '-100%',
          },
          '100%': {
            left: '100%',
          },
        },
      }}
    >
      <Image
        src={headshot}
        alt={driverName}
        position="absolute"
        right="-5%"
        bottom="-10%"
        h="120%"
        objectFit="contain"
        opacity={0.8}
        filter="contrast(1.1) brightness(1.1)"
        transform="scaleX(-1)"
        zIndex={3}
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = userIcon; }}
      />
      <VStack align="flex-start" w="100%" h="100%" zIndex={2} position="relative" justify="space-between">
        <Flex align="center" gap={2}>
          <Icon as={Zap} color="#8B5CF6" />
          <Heading size="sm" textTransform="uppercase" color="#8B5CF6">Fastest Lap</Heading>
        </Flex>
        
        <VStack align="flex-start" spacing={0} w="100%">
          <Text 
            color="#8B5CF6" 
            fontSize={{ base: '4xl', md: '5xl' }}
            fontWeight="bold" 
            fontFamily="mono"
            letterSpacing="wide"
            lineHeight="1"
          >
            {formatLapTime(data.time_ms)}
          </Text>
          <Heading size="md" mt={2} color="text-primary">{driverName}</Heading>
        </VStack>
      </VStack>
    </Box>
  );
};

export default FastestLapWidget;
