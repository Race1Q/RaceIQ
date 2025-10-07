// frontend/src/pages/Dashboard/components/DashboardHeader.tsx

import { Box, Heading, Text, HStack, Button, Icon } from '@chakra-ui/react';
import { Settings } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import { useThemeColor } from '../../../context/ThemeColorContext';

interface DashboardHeaderProps {
  onCustomizeClick: () => void;
}

function DashboardHeader({ onCustomizeClick }: DashboardHeaderProps) {
  const { user } = useAuth0();
  const { accentColorWithHash } = useThemeColor();

  return (
    <Box bg="bg-surface-raised" p={{ base: 'md', md: 'lg' }}>
      <HStack justify="space-between" align="start" flexWrap={{ base: 'wrap', md: 'nowrap' }} spacing={{ base: 4, md: 0 }}>
        <Box flex="1" minW="0">
          <Heading 
            color="text-primary" 
            size={{ base: 'md', md: 'lg' }} 
            mb="sm"
            noOfLines={2}
          >
            Welcome back, {user?.name || 'User'}!
          </Heading>
          <Text 
            color="text-secondary"
            fontSize={{ base: 'sm', md: 'md' }}
            noOfLines={2}
          >
            Here's what's happening in the world of F1.
          </Text>
        </Box>
        
        <Button
          leftIcon={<Icon as={Settings} boxSize={4} />}
          variant="outline"
          borderColor={accentColorWithHash}
          color={accentColorWithHash}
          _hover={{ bg: accentColorWithHash, color: 'white' }}
          onClick={onCustomizeClick}
          size={{ base: 'xs', sm: 'sm' }}
          flexShrink={0}
          minW={{ base: 'auto', sm: '100px' }}
        >
          <Text display={{ base: 'none', sm: 'inline' }}>Customize</Text>
          <Text display={{ base: 'inline', sm: 'none' }}>Customize</Text>
        </Button>
      </HStack>
    </Box>
  );
}

export default DashboardHeader;
