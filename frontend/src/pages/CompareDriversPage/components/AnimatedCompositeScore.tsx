// frontend/src/pages/CompareDriversPage/components/AnimatedCompositeScore.tsx
import { Box, Text, VStack, Flex } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import type { CompositeScore } from '../../../hooks/useDriverComparison';

interface Props {
  score: CompositeScore;
  driver1TeamColor: string;
  driver2TeamColor: string;
  driver1Name?: string;
  driver2Name?: string;
}

// Animated number component for composite score
const AnimatedScoreNumber = ({ value, color }: { value: number; color: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 1.0, 
        ease: "easeOut",
        delay: 0.5
      }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        style={{ 
          fontSize: '24px',
          color: color,
          fontWeight: 'bold',
          fontFamily: 'heading'
        }}
      >
        {value?.toFixed(1) || '0.0'}
      </motion.span>
    </motion.div>
  );
};

// Animated progress bar for tug-of-war effect
const AnimatedProgressBar = ({ 
  driver1Percentage, 
  driver2Percentage, 
  driver1Color, 
  driver2Color 
}: { 
  driver1Percentage: number; 
  driver2Percentage: number; 
  driver1Color: string; 
  driver2Color: string; 
}) => {
  return (
    <Box position="relative" h="8px" bg="border-subtle" borderRadius="full" overflow="hidden">
      <Flex h="full">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${driver1Percentage}%` }}
          transition={{ 
            duration: 1.5, 
            ease: "easeOut",
            delay: 0.3
          }}
          style={{
            height: '100%',
            backgroundColor: driver1Color,
            transition: 'width 0.8s ease'
          }}
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${driver2Percentage}%` }}
          transition={{ 
            duration: 1.5, 
            ease: "easeOut",
            delay: 0.3
          }}
          style={{
            height: '100%',
            backgroundColor: driver2Color,
            transition: 'width 0.8s ease'
          }}
        />
      </Flex>
    </Box>
  );
};

export const AnimatedCompositeScore: React.FC<Props> = ({
  score,
  driver1TeamColor,
  driver2TeamColor,
  driver1Name = 'Driver 1',
  driver2Name = 'Driver 2'
}) => {
  if (!score || score.d1 === null || score.d2 === null) return null;

  // Calculate composite score percentage for visualization
  const totalScore = (score.d1 || 0) + (score.d2 || 0);
  const driver1Percentage = totalScore > 0 ? ((score.d1 || 0) / totalScore) * 100 : 50;
  const driver2Percentage = totalScore > 0 ? ((score.d2 || 0) / totalScore) * 100 : 50;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{ width: '100%' }}
    >
      <Box p="lg" bg="bg-surface" borderRadius="lg" border="1px solid" borderColor="border-primary">
        <VStack spacing="md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Text fontSize="lg" fontFamily="heading" color="text-primary" textAlign="center">
              Composite Score
            </Text>
          </motion.div>
          
          {/* Tug-of-War Style Bar */}
          <Box w="full" maxW="600px" mx="auto">
            <Flex align="center" justify="space-between" mb="sm">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <Text fontSize="sm" color="text-muted" fontFamily="heading">
                  {driver1Name}
                </Text>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <Text fontSize="sm" color="text-muted" fontFamily="heading">
                  {driver2Name}
                </Text>
              </motion.div>
            </Flex>
            
            <AnimatedProgressBar
              driver1Percentage={driver1Percentage}
              driver2Percentage={driver2Percentage}
              driver1Color={driver1TeamColor}
              driver2Color={driver2TeamColor}
            />
            
            <Flex align="center" justify="space-between" mt="sm">
              <AnimatedScoreNumber value={score.d1 || 0} color={driver1TeamColor} />
              <AnimatedScoreNumber value={score.d2 || 0} color={driver2TeamColor} />
            </Flex>
          </Box>
        </VStack>
      </Box>
    </motion.div>
  );
};
