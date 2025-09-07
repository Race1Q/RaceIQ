// frontend/src/pages/Dashboard/components/CustomizeDashboardModal.tsx

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Switch,
  Box,
  Divider,
} from '@chakra-ui/react';

interface WidgetVisibility {
  nextRace: boolean;
  standings: boolean;
  lastPodium: boolean;
  fastestLap: boolean;
  favoriteDriver: boolean;
  favoriteTeam: boolean;
  headToHead: boolean;
  f1News: boolean;
}

interface CustomizeDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  widgetVisibility: WidgetVisibility;
  setWidgetVisibility: (visibility: WidgetVisibility) => void;
}

function CustomizeDashboardModal({
  isOpen,
  onClose,
  widgetVisibility,
  setWidgetVisibility,
}: CustomizeDashboardModalProps) {
  const widgets = [
    { key: 'nextRace' as keyof WidgetVisibility, label: 'Next Race', description: 'Upcoming race information and countdown' },
    { key: 'standings' as keyof WidgetVisibility, label: 'Championship Standings', description: 'Current driver championship positions' },
    { key: 'lastPodium' as keyof WidgetVisibility, label: 'Last Race Podium', description: 'Previous race podium finishers' },
    { key: 'fastestLap' as keyof WidgetVisibility, label: 'Fastest Lap', description: 'Fastest lap time from last race' },
    { key: 'favoriteDriver' as keyof WidgetVisibility, label: 'Favorite Driver', description: 'Snapshot of your favorite driver\'s stats' },
    { key: 'favoriteTeam' as keyof WidgetVisibility, label: 'Favorite Team', description: 'Constructor championship standings for your team' },
    { key: 'headToHead' as keyof WidgetVisibility, label: 'Head to Head', description: 'Quick comparison between two drivers' },
    { key: 'f1News' as keyof WidgetVisibility, label: 'Latest F1 News', description: 'Recent Formula 1 news and updates' },
  ];

  const handleToggle = (key: keyof WidgetVisibility) => {
    setWidgetVisibility({
      ...widgetVisibility,
      [key]: !widgetVisibility[key],
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent bg="blackAlpha.800" border="1px solid" borderColor="whiteAlpha.200" backdropFilter="blur(10px)">
        <ModalHeader color="text-primary" fontFamily="heading">
          Customize Dashboard
        </ModalHeader>
        <ModalCloseButton color="text-primary" />
        
        <ModalBody pb="lg">
          <VStack spacing="md" align="stretch">
            <Text color="text-secondary" fontSize="sm" mb="sm">
              Choose which widgets to display on your dashboard
            </Text>
            
            <Divider borderColor="whiteAlpha.200" />
            
            {widgets.map((widget, index) => (
              <Box key={widget.key}>
                <HStack justify="space-between" align="center" p="sm" borderRadius="md" _hover={{ bg: 'whiteAlpha.50' }}>
                  <VStack align="start" spacing="xs" flex="1">
                    <Text color="text-primary" fontWeight="600" fontSize="sm">
                      {widget.label}
                    </Text>
                    <Text color="text-muted" fontSize="xs">
                      {widget.description}
                    </Text>
                  </VStack>
                  
                  <Switch
                    isChecked={widgetVisibility[widget.key]}
                    onChange={() => handleToggle(widget.key)}
                    colorScheme="red"
                    size="md"
                  />
                </HStack>
                
                {index < widgets.length - 1 && (
                  <Divider borderColor="whiteAlpha.100" />
                )}
              </Box>
            ))}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default CustomizeDashboardModal;
