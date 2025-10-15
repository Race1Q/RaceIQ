// frontend/src/pages/Dashboard/components/CustomizeDashboardModal.tsx

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  VStack,
  HStack,
  Text,
  Switch,
  Box,
  Divider,
  Icon,
  Spinner,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import type { WidgetVisibility } from '../../../hooks/useDashboardPreferences';
import { useThemeColor } from '../../../context/ThemeColorContext';

interface CustomizeDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  widgetVisibility: WidgetVisibility;
  setWidgetVisibility: (visibility: WidgetVisibility) => void;
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error';
  onSave?: () => void;
}

function CustomizeDashboardModal({
  isOpen,
  onClose,
  widgetVisibility,
  setWidgetVisibility,
  saveStatus = 'idle',
  onSave,
}: CustomizeDashboardModalProps) {
  // Theme color for accent elements - same as other components
  const { accentColorWithHash } = useThemeColor();
  
  // Theme-aware colors
  const primaryTextColor = useColorModeValue('gray.800', 'white');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.300');
  const mutedTextColor = useColorModeValue('gray.500', 'gray.400');
  const modalBg = useColorModeValue('white', 'blackAlpha.800');
  const modalBorderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const dividerColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const dividerLightColor = useColorModeValue('gray.100', 'whiteAlpha.100');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');

  const widgets = [
    { key: 'nextRace' as keyof WidgetVisibility, label: 'Next Race', description: 'Upcoming race information and countdown' },
    { key: 'standings' as keyof WidgetVisibility, label: 'Championship Standings', description: 'Current driver championship positions' },
    { key: 'constructorStandings' as keyof WidgetVisibility, label: 'Constructor Standings', description: 'Current constructor championship positions' },
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
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: 'md' }}>
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent bg={modalBg} border="1px solid" borderColor={modalBorderColor} backdropFilter="blur(10px)">
        <ModalHeader color={primaryTextColor} fontFamily="heading">
          Customize Dashboard
        </ModalHeader>
        <ModalCloseButton color={primaryTextColor} />
        
        <ModalBody pb={{ base: 'md', md: 'lg' }}>
          <VStack spacing="md" align="stretch">
            <Text color={secondaryTextColor} fontSize="sm" mb="sm">
              Choose which widgets to display on your dashboard. Click "Save Changes" to apply your preferences.
            </Text>
            
            <Divider borderColor={dividerColor} />
            
            {widgets.map((widget, index) => (
              <Box key={widget.key}>
                <HStack justify="space-between" align="center" p={{ base: 'xs', md: 'sm' }} borderRadius="md" _hover={{ bg: hoverBg }}>
                  <VStack align="start" spacing="xs" flex="1">
                    <Text 
                      color={widget.key === 'favoriteTeam' ? accentColorWithHash : primaryTextColor} 
                      fontWeight="600" 
                      fontSize="sm"
                    >
                      {widget.label}
                    </Text>
                    <Text color={mutedTextColor} fontSize="xs">
                      {widget.description}
                    </Text>
                  </VStack>
                  
                  <Switch
                    isChecked={widgetVisibility[widget.key]}
                    onChange={() => handleToggle(widget.key)}
                    sx={{
                      '& .chakra-switch__track[data-checked]': {
                        bg: `${accentColorWithHash} !important`,
                      }
                    }}
                    size="md"
                  />
                </HStack>
                
                {index < widgets.length - 1 && (
                  <Divider borderColor={dividerLightColor} />
                )}
              </Box>
            ))}
          </VStack>
        </ModalBody>
        
        <ModalFooter>
          <HStack spacing={3} justify="space-between" w="full">
            <Box /> {/* Empty spacer to push content to the right */}
            <HStack spacing={3}>
              <Button
                variant="outline"
                onClick={onClose}
                size="sm"
              >
                Cancel
              </Button>
              <Button
                onClick={onSave}
                isLoading={saveStatus === 'saving'}
                loadingText="Saving..."
                color="white"
                _hover={{ opacity: 0.8 }}
                sx={{
                  bg: `${accentColorWithHash} !important`,
                  _hover: {
                    bg: `${accentColorWithHash} !important`,
                    opacity: 0.8
                  }
                }}
                size="sm"
                isDisabled={!onSave}
              >
                Save Changes
              </Button>
              {(saveStatus === 'saved' || saveStatus === 'error') && (
                <HStack spacing={2} fontSize="xs" color={mutedTextColor}>
                  {saveStatus === 'saved' && (
                    <>
                      <Icon as={CheckCircle} color="green.400" />
                      <Text>Saved</Text>
                    </>
                  )}
                  {saveStatus === 'error' && (
                    <>
                      <Icon as={AlertCircle} color="red.400" />
                      <Text>Save failed</Text>
                    </>
                  )}
                </HStack>
              )}
            </HStack>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default CustomizeDashboardModal;
