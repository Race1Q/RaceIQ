import { Heading, Text, VStack, HStack, Box, Image } from '@chakra-ui/react';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import SearchableSelect from '../../../components/DropDownSearch/SearchableSelect';
import type { SelectOption } from '../../../components/DropDownSearch/SearchableSelect';
import { buildApiUrl } from '../../../lib/api';
import type { HeadToHead } from '../../../types';
import { teamColors } from '../../../lib/teamColors';
import { getTeamLogo } from '../../../lib/teamAssets';
import { driverHeadshots } from '../../../lib/driverHeadshots';
import WidgetCard from './WidgetCard';

interface HeadToHeadQuickCompareWidgetProps {
  data?: HeadToHead;
}

function HeadToHeadQuickCompareWidget({ data }: HeadToHeadQuickCompareWidgetProps) {
  const { getAccessTokenSilently } = useAuth0();
  const currentSeason = new Date().getFullYear();

  type DriverRow = {
    id: number;
    fullName: string;
    teamName: string;
    wins: number;
    podiums: number;
    points: number;
    headshotUrl?: string | null;
  };

  const [drivers, setDrivers] = useState<DriverRow[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selected1, setSelected1] = useState<number | null>(null);
  const [selected2, setSelected2] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStandings = useCallback(async () => {
    try {
      setLoadingList(true);
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
      setDrivers(rows);

      // Preselect initial values: from dashboard data if provided, else top two
      if (data) {
        const id1 = Number((data as any).driver1?.id ?? 0) || rows[0]?.id || null;
        const id2 = Number((data as any).driver2?.id ?? 0) || rows[1]?.id || null;
        setSelected1(id1);
        setSelected2(id2);
      } else {
        setSelected1(rows[0]?.id ?? null);
        setSelected2(rows[1]?.id ?? null);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load drivers');
    } finally {
      setLoadingList(false);
    }
  }, [getAccessTokenSilently, currentSeason, data]);

  useEffect(() => {
    fetchStandings();
  }, [fetchStandings]);

  const options: SelectOption[] = useMemo(() => drivers.map(d => ({ value: d.id, label: d.fullName })), [drivers]);

  const d1 = useMemo(() => drivers.find(d => d.id === selected1) || null, [drivers, selected1]);
  const d2 = useMemo(() => drivers.find(d => d.id === selected2) || null, [drivers, selected2]);

  if (loadingList) {
    return (
      <WidgetCard>
        <VStack align="start" spacing="md">
          <Heading color="brand.red" size="md" fontFamily="heading">Head to Head</Heading>
          <Text color="text-muted">Loading...</Text>
        </VStack>
      </WidgetCard>
    );
  }

  if (error || !d1 || !d2) {
    return (
      <WidgetCard>
        <VStack align="start" spacing="md">
          <Heading color="brand.red" size="md" fontFamily="heading">Head to Head</Heading>
          <Text color="text-muted">{error || 'Unable to load drivers'}</Text>
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
      <VStack align="start" spacing="md">
        <Heading color="brand.red" size="md" fontFamily="heading">
          Head to Head
        </Heading>
        
        {/* Mobile Layout */}
        <VStack spacing="md" align="stretch" w="full" display={{ base: 'flex', md: 'none' }}>
          <VStack spacing="sm" align="center">
            <SearchableSelect
              label=""
              options={options}
              value={selected1 ? { value: selected1, label: driver1.name } : null}
              onChange={(opt) => setSelected1(opt ? Number((opt as SelectOption).value) : null)}
              placeholder="Select driver"
            />
            <Box
              w="80px"
              h="80px"
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
            
            <VStack spacing="xs" align="center">
              <Text color="text-primary" fontSize="sm" fontWeight="bold" textAlign="center">
                {driver1.name}
              </Text>
              <HStack spacing="xs" align="center">
                <Box w="12px" h="12px" borderRadius="sm" overflow="hidden" bg="whiteAlpha.100">
                  <Image
                    src={driver1.teamLogo}
                    alt={`${driver1.team} Logo`}
                    w="full"
                    h="full"
                    objectFit="contain"
                    p="1px"
                  />
                </Box>
                <Text color="text-secondary" fontSize="xs" textAlign="center">
                  {driver1.team}
                </Text>
              </HStack>
            </VStack>
            
            <VStack spacing="xs" align="center">
              <Text color="brand.red" fontSize="sm" fontWeight="bold">
                Wins: {driver1.wins}
              </Text>
              <Text color="text-muted" fontSize="xs">
                Podiums: {driver1.podiums}
              </Text>
              <Text color="text-secondary" fontSize="xs">
                Points: {driver1.points}
              </Text>
            </VStack>
          </VStack>

          {/* VS Divider for Mobile */}
          <HStack spacing="md" align="center" justify="center">
            <Box w="full" h="1px" bg="brand.red" />
            <Text color="brand.red" fontSize="lg" fontWeight="bold" fontFamily="heading">
              VS
            </Text>
            <Box w="full" h="1px" bg="brand.red" />
          </HStack>

          <VStack spacing="sm" align="center">
            <SearchableSelect
              label=""
              options={options}
              value={selected2 ? { value: selected2, label: driver2.name } : null}
              onChange={(opt) => setSelected2(opt ? Number((opt as SelectOption).value) : null)}
              placeholder="Select driver"
            />
            <Box
              w="80px"
              h="80px"
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
            
            <VStack spacing="xs" align="center">
              <Text color="text-primary" fontSize="sm" fontWeight="bold" textAlign="center">
                {driver2.name}
              </Text>
              <HStack spacing="xs" align="center">
                <Box w="12px" h="12px" borderRadius="sm" overflow="hidden" bg="whiteAlpha.100">
                  <Image
                    src={driver2.teamLogo}
                    alt={`${driver2.team} Logo`}
                    w="full"
                    h="full"
                    objectFit="contain"
                    p="1px"
                  />
                </Box>
                <Text color="text-secondary" fontSize="xs" textAlign="center">
                  {driver2.team}
                </Text>
              </HStack>
            </VStack>
            
            <VStack spacing="xs" align="center">
              <Text color="brand.red" fontSize="sm" fontWeight="bold">
                Wins: {driver2.wins}
              </Text>
              <Text color="text-muted" fontSize="xs">
                Podiums: {driver2.podiums}
              </Text>
              <Text color="text-secondary" fontSize="xs">
                Points: {driver2.points}
              </Text>
            </VStack>
          </VStack>
        </VStack>

        {/* Desktop Layout */}
        <HStack spacing="lg" align="center" w="full" justify="space-between" display={{ base: 'none', md: 'flex' }}>
          {/* Driver 1 */}
          <VStack spacing="sm" align="center" flex="1">
            <SearchableSelect
              label=""
              options={options}
              value={selected1 ? { value: selected1, label: driver1.name } : null}
              onChange={(opt) => setSelected1(opt ? Number((opt as SelectOption).value) : null)}
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
            
            <VStack spacing="xs" align="center">
              <Text color="text-primary" fontSize="sm" fontWeight="bold" textAlign="center">
                {driver1.name}
              </Text>
              <HStack spacing="xs" align="center">
                <Box w="12px" h="12px" borderRadius="sm" overflow="hidden" bg="whiteAlpha.100">
                  <Image
                    src={driver1.teamLogo}
                    alt={`${driver1.team} Logo`}
                    w="full"
                    h="full"
                    objectFit="contain"
                    p="1px"
                  />
                </Box>
                <Text color="text-secondary" fontSize="xs" textAlign="center">
                  {driver1.team}
                </Text>
              </HStack>
            </VStack>
            
            <VStack spacing="xs" align="center">
              <Text color="brand.red" fontSize="sm" fontWeight="bold">
                Wins: {driver1.wins}
              </Text>
              <Text color="text-muted" fontSize="xs">
                Podiums: {driver1.podiums}
              </Text>
              <Text color="text-secondary" fontSize="xs">
                Points: {driver1.points}
              </Text>
            </VStack>
          </VStack>
          
          {/* VS */}
          <VStack spacing="xs" align="center">
            <Text color="brand.red" fontSize="2xl" fontWeight="bold" fontFamily="heading">
              VS
            </Text>
            <Box
              w="2px"
              h="40px"
              bg="brand.red"
              borderRadius="full"
            />
          </VStack>
          
          {/* Driver 2 */}
          <VStack spacing="sm" align="center" flex="1">
            <SearchableSelect
              label=""
              options={options}
              value={selected2 ? { value: selected2, label: driver2.name } : null}
              onChange={(opt) => setSelected2(opt ? Number((opt as SelectOption).value) : null)}
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
            
            <VStack spacing="xs" align="center">
              <Text color="text-primary" fontSize="sm" fontWeight="bold" textAlign="center">
                {driver2.name}
              </Text>
              <HStack spacing="xs" align="center">
                <Box w="12px" h="12px" borderRadius="sm" overflow="hidden" bg="whiteAlpha.100">
                  <Image
                    src={driver2.teamLogo}
                    alt={`${driver2.team} Logo`}
                    w="full"
                    h="full"
                    objectFit="contain"
                    p="1px"
                  />
                </Box>
                <Text color="text-secondary" fontSize="xs" textAlign="center">
                  {driver2.team}
                </Text>
              </HStack>
            </VStack>
            
            <VStack spacing="xs" align="center">
              <Text color="brand.red" fontSize="sm" fontWeight="bold">
                Wins: {driver2.wins}
              </Text>
              <Text color="text-muted" fontSize="xs">
                Podiums: {driver2.podiums}
              </Text>
              <Text color="text-secondary" fontSize="xs">
                Points: {driver2.points}
              </Text>
            </VStack>
          </VStack>
        </HStack>
      </VStack>
    </WidgetCard>
  );
}

export default HeadToHeadQuickCompareWidget;