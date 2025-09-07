import type { ReactNode } from 'react';
import { Box } from '@chakra-ui/react';

interface WidgetCardProps {
  children: ReactNode;
}

function WidgetCard({ children }: WidgetCardProps) {
  return (
    <Box
      bg="blackAlpha.600"
      backdropFilter="blur(8px)"
      p="md"
      borderRadius="lg"
      border="1px solid"
      borderColor="whiteAlpha.200"
      position="relative"
      overflow="hidden"
      h="100%"
      display="flex"
      flexDirection="column"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '1px',
        bgGradient: 'linear(to-r, brand.red, transparent)',
        zIndex: 1,
      }}
      _hover={{
        bg: 'blackAlpha.700',
        borderColor: 'brand.red',
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 25px rgba(220, 38, 38, 0.15)',
      }}
      transition="all 0.3s ease"
    >
      <Box position="relative" zIndex={2} h="100%" display="flex" flexDirection="column">
        {children}
      </Box>
    </Box>
  );
}

export default WidgetCard;
