import React from 'react';
import { Box, HStack, Skeleton } from '@chakra-ui/react';

const RecentRacesSkeleton: React.FC = () => {
  return (
    <Box w="100%" overflow="hidden">
      <HStack spacing={{ base: 4, md: 6 }} w="100%" justify="center">
        {Array.from({ length: 3 }).map((_, idx) => (
          <Box key={idx} w={{ base: '85%', sm: '45%', md: '30%' }}>
            <Skeleton height="200px" borderRadius="xl" />
          </Box>
        ))}
      </HStack>
    </Box>
  );
};

export default RecentRacesSkeleton;


