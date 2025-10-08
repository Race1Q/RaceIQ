// frontend/src/pages/CompareDriversPage/components/AnimatedStatistics.tsx
import { Box, Text, VStack, Flex, Badge, Tooltip, Grid } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DriverDetails, DriverComparisonStats, EnabledMetrics } from '../../../hooks/useDriverComparison';

interface Props {
  driver1: DriverDetails | null;
  driver2: DriverDetails | null;
  stats1: DriverComparisonStats | null;
  stats2: DriverComparisonStats | null;
  enabledMetrics: EnabledMetrics;
  driver1TeamColor: string;
  driver2TeamColor: string;
}

// Animated number component with count-up effect
const AnimatedNumber = ({ value, color, fontWeight = "normal" }: { 
  value: number; 
  color: string; 
  fontWeight?: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.8, 
        ease: "easeOut",
        delay: 0.2 
      }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{ 
          fontSize: '14px',
          color: color,
          fontWeight: fontWeight,
          fontFamily: 'heading'
        }}
      >
        {value}
      </motion.span>
    </motion.div>
  );
};

// Animated bar component
const AnimatedBar = ({ 
  width, 
  color, 
  isWinner, 
  delay = 0 
}: { 
  width: number; 
  color: string; 
  isWinner: boolean;
  delay?: number;
}) => {
  return (
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${width}%` }}
      transition={{ 
        duration: 1.2, 
        ease: "easeOut",
        delay: delay + 0.5
      }}
      style={{
        height: '6px',
        backgroundColor: color,
        borderRadius: '3px',
        boxShadow: isWinner ? `0 0 8px ${color}60` : 'none',
        transition: 'box-shadow 0.3s ease'
      }}
    />
  );
};

export const AnimatedStatistics: React.FC<Props> = ({
  driver1,
  driver2,
  stats1,
  stats2,
  enabledMetrics,
  driver1TeamColor,
  driver2TeamColor,
}) => {
  if (!stats1 || !stats2) return null;

  const availableMetrics = {
    wins: 'Wins',
    podiums: 'Podiums',
    poles: 'Pole Positions',
    fastest_laps: 'Fastest Laps',
    points: 'Points',
    races: 'Races',
    dnf: 'DNFs',
    avg_finish: 'Average Finish',
  };

  const enabledMetricsArray = Object.keys(enabledMetrics).filter(key => enabledMetrics[key as keyof typeof enabledMetrics]);

  return (
    <VStack spacing="md" w="full" maxW="600px" mx="auto">
      <AnimatePresence>
        {enabledMetricsArray.map((metric, index) => {
          const metricLabel = availableMetrics[metric as keyof typeof availableMetrics];
          
          // Get the correct stats object (year stats if available, otherwise career stats)
          const useYearStats = stats1.yearStats !== null && stats2.yearStats !== null;
          const s1 = useYearStats ? stats1.yearStats! : stats1.career;
          const s2 = useYearStats ? stats2.yearStats! : stats2.career;
          
          // Map metric names to the correct property names
          const metricMap: Record<string, string> = {
            'wins': 'wins',
            'podiums': 'podiums', 
            'poles': 'poles',
            'fastest_laps': 'fastestLaps',
            'points': 'points',
            'races': 'races',
            'dnf': 'dnfs',
            'avg_finish': 'avgFinish'
          };
          
          const statKey = metricMap[metric] || metric;
          const driver1Value = (s1 as any)[statKey] || 0;
          const driver2Value = (s2 as any)[statKey] || 0;
          const maxValue = Math.max(driver1Value, driver2Value, 1);
          
          const driver1Wins = driver1Value > driver2Value;
          const driver2Wins = driver2Value > driver1Value;
          const isTie = driver1Value === driver2Value;

          return (
            <motion.div
              key={metric}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.6, 
                ease: "easeOut",
                delay: index * 0.15 // Staggered animation
              }}
              style={{ width: '100%' }}
            >
              <Box 
                w="full" 
                p="md" 
                bg="bg-glassmorphism" 
                borderRadius="md"
                border="1px solid"
                borderColor={
                  driver1Wins ? `${driver1TeamColor}40` : 
                  driver2Wins ? `${driver2TeamColor}40` : 
                  'border-subtle'
                }
                boxShadow={
                  driver1Wins ? `0 0 20px ${driver1TeamColor}20` :
                  driver2Wins ? `0 0 20px ${driver2TeamColor}20` :
                  'none'
                }
                transition="all 0.3s ease"
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: driver1Wins ? `0 8px 25px ${driver1TeamColor}30` :
                             driver2Wins ? `0 8px 25px ${driver2TeamColor}30` :
                             '0 8px 25px rgba(0,0,0,0.1)'
                }}
              >
                <VStack spacing="sm">
                  <Flex align="center" justify="center" w="full">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.15 + 0.2 }}
                    >
                      <Text fontFamily="heading" fontWeight="bold" color="text-primary" fontSize="sm">
                        {metricLabel}
                      </Text>
                    </motion.div>
                    {driver1Wins && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.15 + 0.4 }}
                      >
                        <Tooltip label={`${driver1?.fullName} leads`} placement="top">
                          <Badge ml="sm" bg={driver1TeamColor} color="white" borderRadius="full" fontSize="xs">
                            🏆
                          </Badge>
                        </Tooltip>
                      </motion.div>
                    )}
                    {driver2Wins && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.15 + 0.4 }}
                      >
                        <Tooltip label={`${driver2?.fullName} leads`} placement="top">
                          <Badge ml="sm" bg={driver2TeamColor} color="white" borderRadius="full" fontSize="xs">
                            🏆
                          </Badge>
                        </Tooltip>
                      </motion.div>
                    )}
                    {isTie && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.15 + 0.4 }}
                      >
                        <Tooltip label="Tied" placement="top">
                          <Badge ml="sm" bg="border-accent" color="white" borderRadius="full" fontSize="xs">
                            ⚖️
                          </Badge>
                        </Tooltip>
                      </motion.div>
                    )}
                  </Flex>
                  
                  {/* Opposing Bars */}
                  <Grid templateColumns="1fr auto 1fr" gap="md" w="full" alignItems="center">
                    {/* Driver 1 Bar */}
                    <VStack spacing="xs" align="flex-end">
                      <AnimatedNumber 
                        value={driver1Value}
                        color={driver1Wins ? driver1TeamColor : "text-muted"}
                        fontWeight={driver1Wins ? "bold" : "normal"}
                      />
                      <Box w="full" h="6px" bg="border-subtle" borderRadius="full" overflow="hidden">
                        <AnimatedBar
                          width={(driver1Value / maxValue) * 100}
                          color={driver1TeamColor}
                          isWinner={driver1Wins}
                          delay={index * 0.15}
                        />
                      </Box>
                    </VStack>

                    {/* Center Label */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.15 + 0.3 }}
                    >
                      <Text fontSize="xs" color="text-muted" fontFamily="heading" minW="60px" textAlign="center">
                        {metricLabel}
                      </Text>
                    </motion.div>

                    {/* Driver 2 Bar */}
                    <VStack spacing="xs" align="flex-start">
                      <AnimatedNumber 
                        value={driver2Value}
                        color={driver2Wins ? driver2TeamColor : "text-muted"}
                        fontWeight={driver2Wins ? "bold" : "normal"}
                      />
                      <Box w="full" h="6px" bg="border-subtle" borderRadius="full" overflow="hidden">
                        <AnimatedBar
                          width={(driver2Value / maxValue) * 100}
                          color={driver2TeamColor}
                          isWinner={driver2Wins}
                          delay={index * 0.15}
                        />
                      </Box>
                    </VStack>
                  </Grid>
                </VStack>
              </Box>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </VStack>
  );
};
