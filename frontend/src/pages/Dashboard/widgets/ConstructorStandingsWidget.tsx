import React from 'react';
import { Box, Flex, Heading, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import type { ConstructorStandingsItem } from '../../../types';
import WidgetCard from './WidgetCard';
import { teamColors } from '../../../lib/teamColors';
import { Trophy } from 'lucide-react';
import TeamLogo from '../../../components/TeamLogo/TeamLogo';
import { useThemeColor } from '../../../context/ThemeColorContext';

const ConstructorStandingsWidget = ({ data, year }: { data: ConstructorStandingsItem[] | undefined; year?: number }) => {
  const { accentColorWithHash } = useThemeColor();
  
  return (
    <WidgetCard>
      <VStack align="start" spacing="xs">
        <HStack justify="space-between" align="center" w="full">
          <Heading color={accentColorWithHash} size="sm" fontFamily="heading">
            Constructor Standings
          </Heading>
          {year !== undefined && (
            <Text color="text-muted" fontSize="2xs">{year}</Text>
          )}
        </HStack>
        <VStack align="stretch" w="100%" spacing="xs">
        {data && data.length > 0 ? (
          data.slice(0, 3).map((item) => {
            const isLeader = item.position === 1;
            const teamColor = teamColors[item.constructorName] || teamColors['Default'];

            return (
              <Flex
                key={item.position}
                align="center"
                bg={isLeader ? teamColor : 'transparent'}
                py={isLeader ? 2 : 1}
                px={isLeader ? 3 : 2}
                borderRadius="md"
                transition="all 0.2s ease-in-out"
              >
                <Flex align="center" flex={1}>
                  <Text w="1.5em" color={isLeader ? 'white' : '{accentColorWithHash}'} fontWeight="bold" fontSize="xs">{item.position}.</Text>
                  <Box
                    mr={2}
                    w="24px"
                    h="24px"
                    borderRadius="full"
                    bg="transparent"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    overflow="hidden"
                    sx={{ 'svg': { width: '16px', height: '16px' } }}
                  >
                    <TeamLogo teamName={item.constructorName} />
                  </Box>
                  <Text fontWeight="bold" color={isLeader ? 'white' : 'text-primary'} fontSize="xs" noOfLines={1}>{item.constructorName}</Text>
                </Flex>
                {isLeader && <Icon as={Trophy} color="white" mr={2} boxSize="14px" />}
                <Text fontWeight="bold" color={isLeader ? 'white' : '{accentColorWithHash}'} fontSize="2xs">{item.points} pts</Text>
              </Flex>
            );
          })
        ) : (
          <Text color="text-muted" fontSize="xs">Loading standings...</Text>
        )}
        </VStack>
      </VStack>
    </WidgetCard>
  );
};

export default ConstructorStandingsWidget;


