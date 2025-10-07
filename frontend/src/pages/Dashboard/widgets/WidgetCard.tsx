import type { ReactNode } from 'react';
import { Box } from '@chakra-ui/react';
import { useThemeColor } from '../../../context/ThemeColorContext';

interface WidgetCardProps {
  children: ReactNode;
}

function WidgetCard({ children }: WidgetCardProps) {
  const { accentColorWithHash } = useThemeColor();
  
  return (
    <Box
      bg="bg-card"
      backdropFilter="blur(8px)"
      p={{ base: 'sm', md: 'md' }}
      borderRadius="lg"
      border="1px solid"
      borderColor="border-subtle"
      position="relative"
      overflow="hidden"
      h="100%"
      display="flex"
      flexDirection="column"
      boxShadow="0 2px 8px var(--chakra-colors-shadow-color)"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '1px',
        bgGradient: `linear(to-r, ${accentColorWithHash}, transparent)`,
        zIndex: 1,
      }}
      _hover={{
        bg: 'bg-card-hover',
        borderColor: 'border-accent',
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 25px var(--chakra-colors-shadow-color-lg)',
      }}
      transition="all 0.3s ease"
    >
      <Box
        position="relative"
        zIndex={2}
        h="100%"
        display="flex"
        flexDirection="column"
        overflowY="auto"
      >
        {children}
      </Box>
    </Box>
  );
}

export default WidgetCard;
