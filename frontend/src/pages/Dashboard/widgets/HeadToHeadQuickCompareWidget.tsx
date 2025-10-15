import { Heading, Text, VStack, HStack, Box, Image } from '@chakra-ui/react';
import { useMemo, useEffect, useState, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import SearchableSelect from '../../../components/DropDownSearch/SearchableSelect';
import type { SelectOption } from '../../../components/DropDownSearch/SearchableSelect';
import { buildApiUrl } from '../../../lib/api';
import { teamColors } from '../../../lib/teamColors';
import { getTeamLogo } from '../../../lib/teamAssets';
import { driverHeadshots } from '../../../lib/driverHeadshots';
import { useThemeColor } from '../../../context/ThemeColorContext';
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
  const { getAccessTokenSilently } = useAuth0();
  const { accentColorWithHash } = useThemeColor();
  const currentSeason = new Date().getFullYear();

  const { driver1Id, driver2Id } = preference || {};

  type DriverRow = {
    id: number;
    fullName: string;
    teamName: string;
    wins: number;
    podiums: number;
    points: number;
    headshotUrl?: string | null;
  };

  const [driversWithStats, setDriversWithStats] = useState<DriverRow[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDriverStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      setError(null);
      const token = await getAccessTokenSilently();
      const res = await fetch(buildApiUrl(`/api/drivers/standings/${currentSeason}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to fetch standings: ${res.status}`);
      const payload = await res.json();
      const rows: DriverRow[] = (payload as any[]).map((d: any) => ({
        id: Number(d.id ?? d.driverId),
        fullName: d.fullname || d.fullName || `${d.firstName ?? ''} ${d.lastName ?? ''}`.trim(),
        teamName: d.constructor || d.teamName || 'Unknown',
        wins: Number(d.wins ?? 0),
        podiums: Number(d.podiums ?? 0),
        points: Number(d.points ?? 0),
        headshotUrl: d.profileimageurl || d.profileImageUrl || d.headshotUrl || undefined,
      })).filter(r => !!r.id && !!r.fullName);
      setDriversWithStats(rows);

      // Set default selections if none are provided
      if (!driver1Id && !driver2Id && rows.length >= 2) {
        onPreferenceChange({ 
          driver1Id: rows[0].id, 
          driver2Id: rows[1].id 
        });
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load driver stats');
    } finally {
      setLoadingStats(false);
    }
  }, [getAccessTokenSilently, currentSeason, driver1Id, driver2Id, onPreferenceChange]);

  useEffect(() => {
    fetchDriverStats();
  }, [fetchDriverStats]);

  const options: SelectOption[] = useMemo(() => driversWithStats.map(d => ({ value: d.id, label: d.fullName })), [driversWithStats]);

  const d1 = useMemo(() => driversWithStats.find(d => d.id === driver1Id) || null, [driversWithStats, driver1Id]);
  const d2 = useMemo(() => driversWithStats.find(d => d.id === driver2Id) || null, [driversWithStats, driver2Id]);

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

  if (loadingStats) {
    return (
      <WidgetCard>
        <VStack align="start" spacing="md">
          <Heading color={accentColorWithHash} size="md" fontFamily="heading">Head to Head</Heading>
          <Text color="text-muted">Loading...</Text>
        </VStack>
      </WidgetCard>
    );
  }

  if (error || !d1 || !d2) {
    return (
      <WidgetCard>
        <VStack align="start" spacing="md">
          <Heading color={accentColorWithHash} size="md" fontFamily="heading">Head to Head</Heading>
          <Text color="text-muted">{error || 'Please select two drivers to compare'}</Text>
        </VStack>
      </WidgetCard>
    );
  }

  const driver1 = {
    name: d1.fullName,
    team: d1.teamName,
    teamColor: teamColors[d1.teamName] || teamColors['Default'],
    teamLogo: getTeamLogo(d1.teamName),
    image: driverHeadshots[d1.fullName] || d1.headshotUrl || 'https://media.formula1.com/content/dam/fom-website/drivers/placeholder.png.transform/2col-retina/image.png',
    wins: d1.wins,
    podiums: d1.podiums,
    points: d1.points,
  };

  const driver2 = {
    name: d2.fullName,
    team: d2.teamName,
    teamColor: teamColors[d2.teamName] || teamColors['Default'],
    teamLogo: getTeamLogo(d2.teamName),
    image: driverHeadshots[d2.fullName] || d2.headshotUrl || 'https://media.formula1.com/content/dam/fom-website/drivers/placeholder.png.transform/2col-retina/image.png',
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
              borderRadius="full"
              overflow="hidden"
              border="2px solid"
              borderColor={`#${driver1.teamColor}`}
            >
              <Image
                src={driver1.image}
                alt={driver1.name}
                w="full"
                h="full"
                objectFit="cover"
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
              borderRadius="full"
              overflow="hidden"
              border="2px solid"
              borderColor={`#${driver2.teamColor}`}
            >
              <Image
                src={driver2.image}
                alt={driver2.name}
                w="full"
                h="full"
                objectFit="cover"
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
              borderRadius="full"
              overflow="hidden"
              border="2px solid"
              borderColor={`#${driver1.teamColor}`}
            >
              <Image
                src={driver1.image}
                alt={driver1.name}
                w="full"
                h="full"
                objectFit="cover"
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
              borderRadius="full"
              overflow="hidden"
              border="2px solid"
              borderColor={`#${driver2.teamColor}`}
            >
              <Image
                src={driver2.image}
                alt={driver2.name}
                w="full"
                h="full"
                objectFit="cover"
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