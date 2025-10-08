import React from 'react';
import { Box, Flex, Heading, HStack, Icon, Text, VStack, useColorModeValue } from '@chakra-ui/react';
import type { ConstructorStandingsItem } from '../../../types';
import WidgetCard from './WidgetCard';
import { teamColors } from '../../../lib/teamColors';
import { Trophy } from 'lucide-react';
import TeamLogo from '../../../components/TeamLogo/TeamLogo';

const ConstructorStandingsWidget = ({ data, year }: { data: ConstructorStandingsItem[] | undefined; year?: number }) => {
  // Fix: Use dark text for 1st position in light mode
  const firstPlaceTextColor = useColorModeValue('#1a1a1a', 'white');
  return (
    <WidgetCard>
      <VStack align="start" spacing="md">
        <HStack justify="space-between" align="center" w="full">
          <Heading color="brand.red" size="md" fontFamily="heading">
            Constructor Standings
          </Heading>
          {year !== undefined && (
            <Text color="text-muted" fontSize="sm">{year}</Text>
          )}
        </HStack>
        <VStack align="stretch" w="100%" spacing={2}>
        {data && data.length > 0 ? (
          data.slice(0, 3).map((item) => {
            const isLeader = item.position === 1;
            const teamColor = teamColors[item.constructorName] || teamColors['Default'];

            return (
              <Flex
                key={item.position}
                align="center"
                bg={isLeader ? teamColor : 'transparent'}
                p={isLeader ? 4 : 2}
                borderRadius="md"
                transition="all 0.2s ease-in-out"
              >
                <Flex align="center" flex={1}>
                  <Text w="2em" color={isLeader ? firstPlaceTextColor : 'brand.red'} fontWeight="bold">{item.position}.</Text>
                  <Box
                    mr={3}
                    w="32px"
                    h="32px"
                    borderRadius="full"
                    bg="transparent"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    overflow="hidden"
                    sx={{ 'svg': { width: '20px', height: '20px' } }}
                  >
                    <TeamLogo teamName={item.constructorName} />
                  </Box>
                  <Text fontWeight="bold" color={isLeader ? firstPlaceTextColor : 'text-primary'}>{item.constructorName}</Text>
                </Flex>
                {isLeader && <Icon as={Trophy} color="white" mr={3} />}
                <Text fontWeight="bold" color={isLeader ? firstPlaceTextColor : 'brand.red'}>{item.points} pts</Text>
              </Flex>
            );
          })
        ) : (
          <Text color="text-muted">Loading standings...</Text>
        )}
        </VStack>
      </VStack>
    </WidgetCard>
  );
};

export default ConstructorStandingsWidget;


