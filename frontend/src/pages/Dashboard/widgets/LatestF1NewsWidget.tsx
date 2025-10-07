import { Heading, Text, VStack, HStack, Icon } from '@chakra-ui/react';
import { Newspaper, AlertTriangle, Settings } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { useThemeColor } from '../../../context/ThemeColorContext';

function LatestF1NewsWidget() {
  const { accentColorWithHash } = useThemeColor();
  
  const newsItems = [
    {
      icon: Newspaper,
      title: "Hamilton signs multi-year extension with Ferrari",
      time: "2 hours ago"
    },
    {
      icon: AlertTriangle,
      title: "Safety Car Deployed - Lap 26 (British GP)",
      time: "1 day ago"
    },
    {
      icon: Settings,
      title: "FIA announces new engine regulations for 2026",
      time: "3 days ago"
    }
  ];

  return (
    <WidgetCard>
      <VStack align="start" spacing="md">
        <Heading color={accentColorWithHash} size="md" fontFamily="heading">
          Latest F1 News
        </Heading>
        
        <VStack align="stretch" spacing="sm" w="full">
          {newsItems.map((item, index) => (
            <HStack
              key={index}
              spacing="md"
              align="start"
              p="sm"
              borderRadius="md"
              bg="whiteAlpha.50"
              _hover={{ bg: 'whiteAlpha.100' }}
              transition="background-color 0.2s ease"
            >
              <Icon as={item.icon} boxSize={4} color={accentColorWithHash} flexShrink={0} mt="1px" />
              
              <VStack align="start" spacing="xs" flex="1">
                <Text color="text-primary" fontSize="sm" fontWeight="500" lineHeight="1.4">
                  {item.title}
                </Text>
                <Text color="text-muted" fontSize="xs">
                  {item.time}
                </Text>
              </VStack>
            </HStack>
          ))}
        </VStack>
      </VStack>
    </WidgetCard>
  );
}

export default LatestF1NewsWidget;
