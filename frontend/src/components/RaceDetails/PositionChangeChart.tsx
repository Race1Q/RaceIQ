// src/components/RaceDetails/PositionChangeChart.tsx
import React, { useMemo, useState } from 'react';
import {
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { TrendingUp, TrendingDown, Minus, Trophy } from 'lucide-react';
import { getTeamColor as getTeamColorUtil } from '../../lib/teamColors';

type DriverPositionData = {
  driver_id: number | string;
  driver_code?: string;
  driver_name?: string;
  constructor_id?: number | string;
  constructor_name?: string;
  quali_position?: number | null;
  race_position?: number | null;
};

interface PositionChangeChartProps {
  qualiResults: Array<{
    driver_id: number | string;
    driver_code?: string;
    driver_name?: string;
    constructor_id?: number | string;
    constructor_name?: string;
    position?: number | null;
  }>;
  raceResults: Array<{
    driver_id: number | string;
    driver_code?: string;
    driver_name?: string;
    constructor_id?: number | string;
    constructor_name?: string;
    position?: number | null;
  }>;
}

const PositionChangeChart: React.FC<PositionChangeChartProps> = ({
  qualiResults,
  raceResults,
}) => {
  const [hoveredDriver, setHoveredDriver] = useState<string | null>(null);
  
  const primaryTextColor = useColorModeValue('gray.800', 'white');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.300');
  const surfaceBg = useColorModeValue('gray.50', '#0f0f0f');
  const elevatedBg = useColorModeValue('white', '#1a1a1a');
  const borderSubtle = useColorModeValue('gray.100', 'whiteAlpha.100');

  // Merge quali and race results by driver
  const positionData: DriverPositionData[] = useMemo(() => {
    const driverMap = new Map<string | number, DriverPositionData>();

    // Add qualifying positions
    qualiResults.forEach((q) => {
      const key = q.driver_id;
      driverMap.set(key, {
        driver_id: q.driver_id,
        driver_code: q.driver_code,
        driver_name: q.driver_name,
        constructor_id: q.constructor_id,
        constructor_name: q.constructor_name,
        quali_position: q.position,
        race_position: null,
      });
    });

    // Add race positions
    raceResults.forEach((r) => {
      const key = r.driver_id;
      const existing = driverMap.get(key);
      if (existing) {
        existing.race_position = r.position;
      } else {
        driverMap.set(key, {
          driver_id: r.driver_id,
          driver_code: r.driver_code,
          driver_name: r.driver_name,
          constructor_id: r.constructor_id,
          constructor_name: r.constructor_name,
          quali_position: null,
          race_position: r.position,
        });
      }
    });

    return Array.from(driverMap.values())
      .filter(d => d.quali_position != null || d.race_position != null)
      .sort((a, b) => (a.race_position ?? 99) - (b.race_position ?? 99));
  }, [qualiResults, raceResults]);

  const getTeamColor = (constructorName?: string): string => {
    return getTeamColorUtil(constructorName, { hash: true });
  };

  const getPositionChange = (quali?: number | null, race?: number | null) => {
    if (quali == null || race == null) return 0;
    return quali - race; // positive = gained positions, negative = lost positions
  };

  const renderChangeIndicator = (change: number) => {
    if (change > 0) {
      return (
        <HStack spacing={1} color="green.400">
          <TrendingUp size={16} />
          <Text fontWeight="bold" fontSize="sm">+{change}</Text>
        </HStack>
      );
    } else if (change < 0) {
      return (
        <HStack spacing={1} color="red.400">
          <TrendingDown size={16} />
          <Text fontWeight="bold" fontSize="sm">{change}</Text>
        </HStack>
      );
    } else {
      return (
        <HStack spacing={1} color={secondaryTextColor}>
          <Minus size={16} />
          <Text fontWeight="bold" fontSize="sm">0</Text>
        </HStack>
      );
    }
  };

  if (positionData.length === 0) {
    return (
      <Flex justify="center" align="center" minH="300px">
        <Text color={secondaryTextColor}>
          No qualifying or race data available for comparison.
        </Text>
      </Flex>
    );
  }

  return (
    <VStack align="stretch" spacing={6}>
      <Box>
        <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="bold" color={primaryTextColor} mb={2}>
          Qualifying → Race Position Changes
        </Text>
        <Text fontSize="sm" color={secondaryTextColor}>
          Compare starting grid positions with final race results
        </Text>
      </Box>

      {/* Visual Chart */}
      <Box
        bg={elevatedBg}
        border="1px solid"
        borderColor={borderSubtle}
        borderRadius="lg"
        p={{ base: 4, md: 6 }}
        overflowX="auto"
      >
        <Box minW={{ base: '600px', md: 'auto' }}>
          {/* Header */}
          <Flex justify="space-between" mb={4} px={2}>
            <Text fontWeight="bold" fontSize="sm" color={secondaryTextColor} flex="1">
              QUALIFYING
            </Text>
            <Box flex="2" />
            <Text fontWeight="bold" fontSize="sm" color={secondaryTextColor} flex="1" textAlign="right">
              RACE FINISH
            </Text>
          </Flex>

          {/* Driver Rows */}
          <VStack spacing={2} align="stretch">
            {positionData.map((driver) => {
              const driverKey = String(driver.driver_id);
              const isHovered = hoveredDriver === driverKey;
              const change = getPositionChange(driver.quali_position, driver.race_position);
              const teamColor = getTeamColor(driver.constructor_name);

              return (
                <Box
                  key={driverKey}
                  onMouseEnter={() => setHoveredDriver(driverKey)}
                  onMouseLeave={() => setHoveredDriver(null)}
                  transition="all 0.2s"
                  cursor="pointer"
                >
                  <Flex
                    align="center"
                    bg={isHovered ? surfaceBg : 'transparent'}
                    borderRadius="md"
                    p={3}
                    border="2px solid"
                    borderColor={isHovered ? teamColor : 'transparent'}
                    transition="all 0.2s"
                  >
                    {/* Qualifying Position */}
                    <Box flex="1">
                      <Flex align="center" gap={3}>
                        <Box
                          w="32px"
                          h="32px"
                          borderRadius="md"
                          bg={surfaceBg}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          fontWeight="bold"
                          fontSize="sm"
                          border="2px solid"
                          borderColor={borderSubtle}
                        >
                          {driver.quali_position ?? '-'}
                        </Box>
                        <VStack align="flex-start" spacing={0}>
                          <Text fontWeight="bold" fontSize="sm" color={primaryTextColor}>
                            {driver.driver_name || driver.driver_code || `Driver ${driver.driver_id}`}
                          </Text>
                          <Text fontSize="xs" color={secondaryTextColor}>
                            {driver.constructor_name || 'Unknown Team'}
                          </Text>
                        </VStack>
                      </Flex>
                    </Box>

                    {/* Connection Line & Change Indicator */}
                    <Box flex="2" position="relative" px={4}>
                      <Box
                        h="2px"
                        bg={teamColor}
                        opacity={isHovered ? 1 : 0.3}
                        transition="opacity 0.2s"
                        position="relative"
                      >
                        {/* Arrow head */}
                        <Box
                          position="absolute"
                          right="-4px"
                          top="50%"
                          transform="translateY(-50%)"
                          w="0"
                          h="0"
                          borderLeft={`6px solid ${teamColor}`}
                          borderTop="4px solid transparent"
                          borderBottom="4px solid transparent"
                          opacity={isHovered ? 1 : 0.3}
                        />
                      </Box>
                      {/* Change badge */}
                      <Flex
                        position="absolute"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                        bg={elevatedBg}
                        px={2}
                        py={1}
                        borderRadius="full"
                        border="1px solid"
                        borderColor={borderSubtle}
                      >
                        {renderChangeIndicator(change)}
                      </Flex>
                    </Box>

                    {/* Race Position */}
                    <Box flex="1">
                      <Flex align="center" justify="flex-end" gap={3}>
                        <Box
                          w="32px"
                          h="32px"
                          borderRadius="md"
                          bg={driver.race_position === 1 ? 'gold' : 
                              driver.race_position === 2 ? 'silver' :
                              driver.race_position === 3 ? '#CD7F32' : surfaceBg}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          fontWeight="bold"
                          fontSize="sm"
                          border="2px solid"
                          borderColor={driver.race_position && driver.race_position <= 3 ? 'transparent' : borderSubtle}
                          color={driver.race_position && driver.race_position <= 3 ? 'white' : primaryTextColor}
                        >
                          {driver.race_position && driver.race_position <= 3 && (
                            <Trophy size={16} />
                          )}
                          {driver.race_position && driver.race_position > 3 && driver.race_position}
                          {!driver.race_position && '-'}
                        </Box>
                      </Flex>
                    </Box>
                  </Flex>
                </Box>
              );
            })}
          </VStack>
        </Box>
      </Box>

      {/* Statistics Summary */}
      <Box
        bg={elevatedBg}
        border="1px solid"
        borderColor={borderSubtle}
        borderRadius="lg"
        p={{ base: 4, md: 6 }}
      >
        <Text fontWeight="bold" mb={3} color={primaryTextColor}>Key Insights</Text>
        <Flex gap={6} wrap="wrap">
          <Box>
            <Text fontSize="xs" color={secondaryTextColor} mb={1}>Biggest Gainer</Text>
            {(() => {
              const biggestGainer = positionData.reduce((max, d) => {
                const change = getPositionChange(d.quali_position, d.race_position);
                const maxChange = getPositionChange(max.quali_position, max.race_position);
                return change > maxChange ? d : max;
              }, positionData[0]);
              const change = getPositionChange(biggestGainer.quali_position, biggestGainer.race_position);
              return (
                <HStack>
                  <Text fontWeight="bold" color="green.400" fontSize="lg">
                    {biggestGainer.driver_name || biggestGainer.driver_code}
                  </Text>
                  <Text color="green.400" fontSize="sm">(+{change})</Text>
                </HStack>
              );
            })()}
          </Box>
          <Box>
            <Text fontSize="xs" color={secondaryTextColor} mb={1}>Biggest Loser</Text>
            {(() => {
              const biggestLoser = positionData.reduce((min, d) => {
                const change = getPositionChange(d.quali_position, d.race_position);
                const minChange = getPositionChange(min.quali_position, min.race_position);
                return change < minChange ? d : min;
              }, positionData[0]);
              const change = getPositionChange(biggestLoser.quali_position, biggestLoser.race_position);
              return change < 0 ? (
                <HStack>
                  <Text fontWeight="bold" color="red.400" fontSize="lg">
                    {biggestLoser.driver_name || biggestLoser.driver_code}
                  </Text>
                  <Text color="red.400" fontSize="sm">({change})</Text>
                </HStack>
              ) : (
                <Text fontSize="sm" color={secondaryTextColor}>No losses</Text>
              );
            })()}
          </Box>
          <Box>
            <Text fontSize="xs" color={secondaryTextColor} mb={1}>Unchanged Positions</Text>
            <Text fontWeight="bold" fontSize="lg" color={primaryTextColor}>
              {positionData.filter(d => getPositionChange(d.quali_position, d.race_position) === 0).length}
            </Text>
          </Box>
        </Flex>
      </Box>
    </VStack>
  );
};

export default PositionChangeChart;
