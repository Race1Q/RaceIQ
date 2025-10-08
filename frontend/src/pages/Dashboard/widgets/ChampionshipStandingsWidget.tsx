import React from 'react';
import { Avatar, Flex, Heading, HStack, Icon, Text, VStack, useColorModeValue } from '@chakra-ui/react';
import type { StandingsItem } from '../../../types';
import WidgetCard from './WidgetCard';
import { teamColors } from '../../../lib/teamColors';
import { Trophy } from 'lucide-react';
import { driverHeadshots } from '../../../lib/driverHeadshots';

const ChampionshipStandingsWidget = ({ data, year }: { data: StandingsItem[]; year?: number }) => {
  // Fix: Use dark text for 1st position in light mode
  const firstPlaceTextColor = useColorModeValue('#1a1a1a', 'white');
  return (
    <WidgetCard>
      <VStack align="start" spacing="md">
        <HStack justify="space-between" align="center" w="full">
          <Heading color="brand.red" size="md" fontFamily="heading">
            Driver Standings
          </Heading>
          {year !== undefined && (
            <Text color="text-muted" fontSize="sm">{year}</Text>
          )}
        </HStack>
      <VStack align="stretch" w="100%" spacing={2}>
        {data && data.length > 0 ? (
          data.map((item) => {
            const isLeader = item.position === 1;
            const teamColor = teamColors[item.constructorName] || teamColors['Default'];
            const headshot = driverHeadshots[item.driverFullName] || item.driverHeadshotUrl || '';

            return (
              <Flex
                key={item.position}
                align="center"
                bg={isLeader ? teamColor : 'transparent'}
                p={isLeader ? 4 : 2}
                borderRadius="md"
                transition="all 0.2s ease-in-out"
              >
                <Flex align="center" flex={1} minW="0">
                  <Text w="2em" color={isLeader ? firstPlaceTextColor : 'brand.red'} fontWeight="bold" flexShrink={0}>{item.position}.</Text>
                  <Avatar size="sm" src={headshot} mr={2} flexShrink={0} />
                  <VStack align="start" spacing={0} flex="1" minW="0">
                    <Text 
                      fontWeight="bold" 
                      color={isLeader ? firstPlaceTextColor : 'text-primary'}
                      fontSize={{ base: 'xs', md: 'sm' }}
                      noOfLines={1}
                    >
                      {item.driverFullName}
                    </Text>
                    <Text 
                      fontSize={{ base: 'xs', md: 'sm' }} 
                      color={isLeader ? 'whiteAlpha.800' : 'text-muted'}
                      noOfLines={1}
                    >
                      {item.constructorName}
                    </Text>
                  </VStack>
                </Flex>
                {isLeader && <Icon as={Trophy} color="white" mr={3} />}
                <Text 
                  fontWeight="bold" 
                  color={isLeader ? firstPlaceTextColor : 'brand.red'}
                  fontSize={{ base: 'xs', md: 'sm' }}
                  flexShrink={0}
                >
                  {item.points} pts
                </Text>
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

export default ChampionshipStandingsWidget;


