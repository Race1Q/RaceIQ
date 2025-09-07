// frontend/src/pages/Dashboard/components/DashboardHeader.tsx

import { Box, Heading, Text, HStack, Button, Icon } from '@chakra-ui/react';
import { Settings } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';

interface DashboardHeaderProps {
  onCustomizeClick: () => void;
}

function DashboardHeader({ onCustomizeClick }: DashboardHeaderProps) {
  const { user } = useAuth0();

  return (
    <Box bg="bg-surface-raised" p="lg">
      <HStack justify="space-between" align="start">
        <Box>
          <Heading color="text-primary" size="lg" mb="sm">
            Welcome back, {user?.name || 'User'}!
          </Heading>
          <Text color="text-secondary">
            Here's what's happening in the world of F1.
          </Text>
        </Box>
        
        <Button
          leftIcon={<Icon as={Settings} boxSize={4} />}
          variant="outline"
          borderColor="brand.red"
          color="brand.red"
          _hover={{ bg: 'brand.red', color: 'white' }}
          onClick={onCustomizeClick}
          size="sm"
        >
          Customize
        </Button>
      </HStack>
    </Box>
  );
}

export default DashboardHeader;
