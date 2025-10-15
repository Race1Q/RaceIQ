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
      bg="bg-surface"
      backdropFilter="blur(8px)"
      p={{ base: 'sm', md: 'md' }}
      borderRadius="lg"
      border="1px solid"
      borderColor="border-primary"
      position="relative"
      overflow="hidden"
      h="100%"
      display="flex"
      flexDirection="column"
      boxShadow="0 1px 3px var(--chakra-colors-shadow-color)"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        bgGradient: `linear(to-r, ${accentColorWithHash}, transparent)`,
        zIndex: 1,
      }}
      _hover={{
        bg: 'bg-surface-raised',
        borderColor: 'border-accent',
        transform: 'translateY(-2px)',
        boxShadow: `0 4px 12px var(--chakra-colors-shadow-color), 0 0 0 1px ${accentColorWithHash}40`,
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
