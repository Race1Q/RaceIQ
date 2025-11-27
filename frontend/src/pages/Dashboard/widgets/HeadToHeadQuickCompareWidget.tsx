import { Heading, Text, VStack, HStack, Box, Image } from '@chakra-ui/react';
import { useMemo, useEffect } from 'react';
import SearchableSelect from '../../../components/DropDownSearch/SearchableSelect';
import type { SelectOption } from '../../../components/DropDownSearch/SearchableSelect';
import { teamColors } from '../../../lib/teamColors';
import { getTeamLogo } from '../../../lib/teamAssets';
import { getDriverHeadshot } from '../../../lib/driverHeadshotUtils';
import { useThemeColor } from '../../../context/ThemeColorContext';
import { useDashboardSharedData } from '../../../context/DashboardDataContext';
import WidgetCard from './WidgetCard';

interface HeadToHeadQuickCompareWidgetProps {
  preference?: {
    driver1Id?: number;
    driver2Id?: number;
  };
  onPreferenceChange: (preference: { driver1Id?: number; driver2Id?: number }) => void;
  allDrivers: Array<{ id: number; name: string; teamName: string; headshotUrl?: string | null }>;
}

function HeadToHeadQuickCompareWidget({ 
  preference, 
  onPreferenceChange, 
  allDrivers: _allDrivers 
}: HeadToHeadQuickCompareWidgetProps) {
  const { accentColorWithHash } = useThemeColor();
  const { driverStandings, loadingDriverStandings, errorDriverStandings } = useDashboardSharedData();

  const { driver1Id, driver2Id } = preference || {};

  // Set default selections if none are provided
  useEffect(() => {
    if (!driver1Id && !driver2Id && driverStandings.length >= 2) {
      onPreferenceChange({ 
        driver1Id: driverStandings[0].id, 
        driver2Id: driverStandings[1].id 
      });
    }
  }, [driver1Id, driver2Id, driverStandings, onPreferenceChange]);

  const options: SelectOption[] = useMemo(() => driverStandings.map(d => ({ value: d.id, label: d.fullName })), [driverStandings]);

  const d1 = useMemo(() => driverStandings.find(d => d.id === driver1Id) || null, [driverStandings, driver1Id]);
  const d2 = useMemo(() => driverStandings.find(d => d.id === driver2Id) || null, [driverStandings, driver2Id]);

  const handleDriver1Change = (opt: SelectOption | null) => {
    const newDriver1Id = opt ? Number(opt.value) : undefined;
    onPreferenceChange({ 
      driver1Id: newDriver1Id, 
      driver2Id 
    });
  };

  const handleDriver2Change = (opt: SelectOption | null) => {
    const newDriver2Id = opt ? Number(opt.value) : undefined;
    onPreferenceChange({ 
      driver1Id, 
      driver2Id: newDriver2Id 
    });
  };

  if (loadingDriverStandings) {
    return (
      <WidgetCard>
        <VStack align="start" spacing="md">
          <Heading color={accentColorWithHash} size="md" fontFamily="heading">Head to Head</Heading>
          <Text color="text-muted">Loading...</Text>
        </VStack>
      </WidgetCard>
    );
  }

  if (errorDriverStandings || !d1 || !d2) {
    return (
      <WidgetCard>
        <VStack align="start" spacing="md">
          <Heading color={accentColorWithHash} size="md" fontFamily="heading">Head to Head</Heading>
          <Text color="text-muted">{errorDriverStandings || 'Please select two drivers to compare'}</Text>
        </VStack>
      </WidgetCard>
    );
  }

  const driver1 = {
    name: d1.fullName,
    team: d1.teamName,
    teamColor: teamColors[d1.teamName] || teamColors['Default'],
    teamLogo: getTeamLogo(d1.teamName),
    image: getDriverHeadshot(d1.headshotUrl, d1.fullName),
    wins: d1.wins,
    podiums: d1.podiums,
    points: d1.points,
  };

  const driver2 = {
    name: d2.fullName,
    team: d2.teamName,
    teamColor: teamColors[d2.teamName] || teamColors['Default'],
    teamLogo: getTeamLogo(d2.teamName),
    image: getDriverHeadshot(d2.headshotUrl, d2.fullName),
    wins: d2.wins,
    podiums: d2.podiums,
    points: d2.points,
  };

  return (
    <WidgetCard>
      <VStack align="start" spacing="xs" className="widget-content">
        <Heading color={accentColorWithHash} size="sm" fontFamily="heading" mb="xs">
          Head to Head
        </Heading>
        
        {/* Mobile Layout */}
        <VStack spacing="xs" align="stretch" w="full" display={{ base: 'flex', md: 'none' }} className="scrollable-content">
          <VStack spacing="xs" align="center">
            <SearchableSelect
              label=""
              options={options}
              value={driver1Id ? { value: driver1Id, label: driver1.name } : null}
              onChange={handleDriver1Change}
              placeholder="Select driver"
            />
            <Box
              w="60px"
              h="60px"
              minW="60px"
              minH="60px"
              borderRadius="full"
              overflow="hidden"
              border="2px solid"
              borderColor={`#${driver1.teamColor}`}
            >
              <Image
                src={driver1.image}
                alt={driver1.name}
                width="60px"
                height="60px"
                w="full"
                h="full"
                objectFit="cover"
                loading="eager"
                decoding="async"
                fallbackSrc="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
              />
            </Box>
            
            <VStack spacing="0" align="center">
              <Text color="text-primary" fontSize="xs" fontWeight="bold" textAlign="center" noOfLines={1}>
                {driver1.name}
              </Text>
              <HStack spacing="xs" align="center">
                <Box w="10px" h="10px" borderRadius="sm" overflow="hidden" bg="whiteAlpha.100">
                  <Image
                    src={driver1.teamLogo}
                    alt={`${driver1.team} Logo`}
                    w="full"
                    h="full"
                    objectFit="contain"
                    p="1px"
                  />
                </Box>
                <Text color="text-secondary" fontSize="2xs" textAlign="center" noOfLines={1}>
                  {driver1.team}
                </Text>
              </HStack>
            </VStack>
            
            <HStack spacing="sm" align="center" justify="center">
              <Text color="{accentColorWithHash}" fontSize="2xs" fontWeight="semibold">
                W: {driver1.wins}
              </Text>
              <Text color="text-muted" fontSize="2xs">
                P: {driver1.podiums}
              </Text>
              <Text color="text-secondary" fontSize="2xs">
                Pts: {driver1.points}
              </Text>
            </HStack>
          </VStack>

          {/* VS Divider for Mobile */}
          <HStack spacing="sm" align="center" justify="center" py="xs">
            <Box w="full" h="1px" bg="{accentColorWithHash}" />
            <Text color="{accentColorWithHash}" fontSize="sm" fontWeight="bold" fontFamily="heading">
              VS
            </Text>
            <Box w="full" h="1px" bg="{accentColorWithHash}" />
          </HStack>

          <VStack spacing="xs" align="center">
            <SearchableSelect
              label=""
              options={options}
              value={driver2Id ? { value: driver2Id, label: driver2.name } : null}
              onChange={handleDriver2Change}
              placeholder="Select driver"
            />
            <Box
              w="60px"
              h="60px"
              minW="60px"
              minH="60px"
              borderRadius="full"
              overflow="hidden"
              border="2px solid"
              borderColor={`#${driver2.teamColor}`}
            >
              <Image
                src={driver2.image}
                alt={driver2.name}
                width="60px"
                height="60px"
                w="full"
                h="full"
                objectFit="cover"
                loading="eager"
                decoding="async"
                fallbackSrc="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
              />
            </Box>
            
            <VStack spacing="0" align="center">
              <Text color="text-primary" fontSize="xs" fontWeight="bold" textAlign="center" noOfLines={1}>
                {driver2.name}
              </Text>
              <HStack spacing="xs" align="center">
                <Box w="10px" h="10px" borderRadius="sm" overflow="hidden" bg="whiteAlpha.100">
                  <Image
                    src={driver2.teamLogo}
                    alt={`${driver2.team} Logo`}
                    w="full"
                    h="full"
                    objectFit="contain"
                    p="1px"
                  />
                </Box>
                <Text color="text-secondary" fontSize="2xs" textAlign="center" noOfLines={1}>
                  {driver2.team}
                </Text>
              </HStack>
            </VStack>
            
            <HStack spacing="sm" align="center" justify="center">
              <Text color="{accentColorWithHash}" fontSize="2xs" fontWeight="semibold">
                W: {driver2.wins}
              </Text>
              <Text color="text-muted" fontSize="2xs">
                P: {driver2.podiums}
              </Text>
              <Text color="text-secondary" fontSize="2xs">
                Pts: {driver2.points}
              </Text>
            </HStack>
          </VStack>
        </VStack>

        {/* Desktop Layout */}
        <HStack spacing="sm" align="center" w="full" justify="space-between" display={{ base: 'none', md: 'flex' }} className="scrollable-content">
          {/* Driver 1 */}
          <VStack spacing="xs" align="center" flex="1">
            <SearchableSelect
              label=""
              options={options}
              value={driver1Id ? { value: driver1Id, label: driver1.name } : null}
              onChange={handleDriver1Change}
              placeholder="Select driver"
            />
            <Box
              w="50px"
              h="50px"
              minW="50px"
              minH="50px"
              borderRadius="full"
              overflow="hidden"
              border="2px solid"
              borderColor={`#${driver1.teamColor}`}
            >
              <Image
                src={driver1.image}
                alt={driver1.name}
                width="50px"
                height="50px"
                w="full"
                h="full"
                objectFit="cover"
                loading="eager"
                decoding="async"
                fallbackSrc="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
              />
            </Box>
            
            <VStack spacing="0" align="center">
              <Text color="text-primary" fontSize="xs" fontWeight="bold" textAlign="center" noOfLines={1}>
                {driver1.name}
              </Text>
              <HStack spacing="xs" align="center">
                <Box w="10px" h="10px" borderRadius="sm" overflow="hidden" bg="whiteAlpha.100">
                  <Image
                    src={driver1.teamLogo}
                    alt={`${driver1.team} Logo`}
                    w="full"
                    h="full"
                    objectFit="contain"
                    p="1px"
                  />
                </Box>
                <Text color="text-secondary" fontSize="2xs" textAlign="center" noOfLines={1}>
                  {driver1.team}
                </Text>
              </HStack>
            </VStack>
            
            <HStack spacing="xs" align="center" justify="center">
              <Text color="{accentColorWithHash}" fontSize="2xs" fontWeight="semibold">
                W: {driver1.wins}
              </Text>
              <Text color="text-muted" fontSize="2xs">
                P: {driver1.podiums}
              </Text>
              <Text color="text-secondary" fontSize="2xs">
                Pts: {driver1.points}
              </Text>
            </HStack>
          </VStack>
          
          {/* VS */}
          <VStack spacing="0" align="center" px="xs">
            <Text color="{accentColorWithHash}" fontSize="lg" fontWeight="bold" fontFamily="heading">
              VS
            </Text>
            <Box
              w="1px"
              h="20px"
              bg="{accentColorWithHash}"
              borderRadius="full"
            />
          </VStack>
          
          {/* Driver 2 */}
          <VStack spacing="xs" align="center" flex="1">
            <SearchableSelect
              label=""
              options={options}
              value={driver2Id ? { value: driver2Id, label: driver2.name } : null}
              onChange={handleDriver2Change}
              placeholder="Select driver"
            />
            <Box
              w="50px"
              h="50px"
              minW="50px"
              minH="50px"
              borderRadius="full"
              overflow="hidden"
              border="2px solid"
              borderColor={`#${driver2.teamColor}`}
            >
              <Image
                src={driver2.image}
                alt={driver2.name}
                width="50px"
                height="50px"
                w="full"
                h="full"
                objectFit="cover"
                loading="eager"
                decoding="async"
                fallbackSrc="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
              />
            </Box>
            
            <VStack spacing="0" align="center">
              <Text color="text-primary" fontSize="xs" fontWeight="bold" textAlign="center" noOfLines={1}>
                {driver2.name}
              </Text>
              <HStack spacing="xs" align="center">
                <Box w="10px" h="10px" borderRadius="sm" overflow="hidden" bg="whiteAlpha.100">
                  <Image
                    src={driver2.teamLogo}
                    alt={`${driver2.team} Logo`}
                    w="full"
                    h="full"
                    objectFit="contain"
                    p="1px"
                  />
                </Box>
                <Text color="text-secondary" fontSize="2xs" textAlign="center" noOfLines={1}>
                  {driver2.team}
                </Text>
              </HStack>
            </VStack>
            
            <HStack spacing="xs" align="center" justify="center">
              <Text color="{accentColorWithHash}" fontSize="2xs" fontWeight="semibold">
                W: {driver2.wins}
              </Text>
              <Text color="text-muted" fontSize="2xs">
                P: {driver2.podiums}
              </Text>
              <Text color="text-secondary" fontSize="2xs">
                Pts: {driver2.points}
              </Text>
            </HStack>
          </VStack>
        </HStack>
      </VStack>
    </WidgetCard>
  );
}

export default HeadToHeadQuickCompareWidget;