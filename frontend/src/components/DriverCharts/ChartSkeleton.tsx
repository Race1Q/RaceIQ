import React from 'react';
import { Box, Skeleton, SkeletonText } from '@chakra-ui/react';

interface ChartSkeletonProps {
  title: string;
  height?: string;
}

const ChartSkeleton: React.FC<ChartSkeletonProps> = ({ 
  title, 
  height = "300px" 
}) => {
  return (
    <Box w="100%" h={height} bg="gray.800" p={4} borderRadius="md">
      <Skeleton height="20px" width="150px" mb={2} />
      <Box h="calc(100% - 40px)" position="relative">
        {/* Simulate chart grid lines */}
        <Box position="absolute" top="0" left="0" right="0" bottom="0">
          {/* Horizontal lines */}
          <Skeleton height="1px" width="100%" mb="20%" />
          <Skeleton height="1px" width="100%" mb="20%" />
          <Skeleton height="1px" width="100%" mb="20%" />
          <Skeleton height="1px" width="100%" mb="20%" />
          <Skeleton height="1px" width="100%" />
        </Box>
        
        {/* Simulate chart line */}
        <Box position="absolute" top="0" left="0" right="0" bottom="0">
          <Skeleton 
            height="3px" 
            width="100%" 
            borderRadius="full"
            bg="gray.600"
            transform="rotate(-5deg)"
            top="30%"
            position="absolute"
          />
        </Box>
        
        {/* Simulate data points */}
        <Box position="absolute" top="25%" left="10%" w="8px" h="8px" bg="gray.500" borderRadius="full" />
        <Box position="absolute" top="35%" left="30%" w="8px" h="8px" bg="gray.500" borderRadius="full" />
        <Box position="absolute" top="20%" left="50%" w="8px" h="8px" bg="gray.500" borderRadius="full" />
        <Box position="absolute" top="40%" left="70%" w="8px" h="8px" bg="gray.500" borderRadius="full" />
        <Box position="absolute" top="15%" left="90%" w="8px" h="8px" bg="gray.500" borderRadius="full" />
      </Box>
    </Box>
  );
};

export default ChartSkeleton;
