// frontend/src/pages/CompareDriversPage/CompareDriversPage.tsx
import { useAuth0 } from '@auth0/auth0-react';
import { Box, Heading, Grid, Flex, Text, Button, VStack, HStack, Fade, SlideFade, Image, Badge, Skeleton, SkeletonText, ScaleFade } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Trophy, Zap, Star, Target, Flag, Clock, Award } from 'lucide-react';
import { Download } from 'lucide-react';
import { useDriverComparison } from '../../hooks/useDriverComparison';
import type { SelectOption } from '../../components/DropDownSearch/SearchableSelect';
import { DriverSelectionPanel } from './components/DriverSelectionPanel';
import PageHeader from '../../components/layout/PageHeader';
import LayoutContainer from '../../components/layout/LayoutContainer';
import CompareTabs from '../../components/compare/CompareTabs';
import { DriverPdfComparisonCard } from '../../components/compare/DriverPdfComparisonCard';
import { getTeamColor } from '../../lib/teamColors';
import { getTeamLogo } from '../../lib/teamAssets';
import { TEAM_META } from '../../theme/teamTokens';
import { driverHeadshots } from '../../lib/driverHeadshots';
import { driverTeamMapping } from '../../lib/driverTeamMapping';

// Function to get team gradient by team name
const getTeamGradient = (teamName: string): string => {
  const teamEntry = Object.entries(TEAM_META).find(([_, meta]) => 
    meta.name.toLowerCase() === teamName.toLowerCase()
  );
  return teamEntry ? teamEntry[1].gradient : 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)';
};

// Function to get team name for a driver
const getDriverTeam = (driver: any): string => {
  if (!driver) return 'Default';
  
  // Try using driver.teamName first (if available)
  if (driver.teamName) {
    return driver.teamName;
  }
  
  // Fallback to driverTeamMapping using driver fullName
  if (driver.fullName && driverTeamMapping[driver.fullName]) {
    return driverTeamMapping[driver.fullName];
  }
  
  // Final fallback
  return 'Default';
};

// Step types for progressive disclosure
type ComparisonStep = 'parameters' | 'results';
type ParameterPhase = 'drivers' | 'time' | 'stats';

// A new, reusable component for a single stat card with winner highlighting
const StatCard = ({ 
  label, 
  value, 
  icon, 
  teamColor, 
  isWinner = false,
  metric 
}: { 
  label: string; 
  value: number; 
  icon: any; 
  teamColor: string;
  isWinner?: boolean;
  metric?: string;
}) => (
  <Flex
    justify="space-between"
    align="center"
    p={4}
    bg="bg-glassmorphism"
    borderRadius="md"
    border="2px solid"
    borderColor={isWinner ? `#${teamColor}` : "border-subtle"}
    w="100%"
    transition="all 0.3s ease"
    position="relative"
    _hover={{
      transform: 'translateY(-2px)',
      boxShadow: isWinner ? `0 8px 25px #${teamColor}30` : '0 8px 25px rgba(0,0,0,0.1)',
      borderColor: isWinner ? `#${teamColor}` : "border-primary"
    }}
    _before={isWinner ? {
      content: '""',
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: '4px',
      background: `#${teamColor}`,
      borderRadius: 'md 0 0 md',
    } : undefined}
  >
    <HStack>
      <Box as={icon} color={isWinner ? `#${teamColor}` : "white"} w="16px" h="16px" />
      <Text fontSize="sm" color="text-muted">{label}</Text>
    </HStack>
    <HStack spacing={2}>
      <Heading 
        size="md" 
        fontFamily="heading" 
        color={isWinner ? `#${teamColor}` : "white"}
        fontWeight={isWinner ? "bold" : "normal"}
        textShadow={isWinner ? `0 0 8px #${teamColor}40` : "none"}
        transition="all 0.3s ease"
      >
        {value}
      </Heading>
      {isWinner && (
        <Box as={Trophy} color={`#${teamColor}`} w="16px" h="16px" />
      )}
    </HStack>
  </Flex>
);

// Helper function to determine winner for each metric
const determineWinner = (value1: number, value2: number, metric: string): boolean => {
  // For DNFs, lower is better (fewer DNFs)
  if (metric === 'dnf' || metric === 'dnfs') {
    return value1 < value2;
  }
  
  // For all other metrics, higher is better
  return value1 > value2;
};

// A new, reusable component for an entire driver's column
const DriverStatsColumn = ({ 
  driver, 
  stats, 
  headshot, 
  teamColor, 
  enabledMetrics, 
  availableMetrics,
  opponentStats,
  isDriver1
}: {
  driver: any;
  stats: any;
  headshot: string | null;
  teamColor: string;
  enabledMetrics: string[];
  availableMetrics: any;
  opponentStats: any;
  isDriver1: boolean;
}) => {
  if (!driver || !stats) return null;

  // Map metric keys to icons
  const metricIconMap: Record<string, any> = {
    'wins': Trophy,
    'podiums': Star,
    'poles': Flag,
    'fastest_laps': Zap,
    'points': Target,
    'races': Clock,
    'dnf': Award,
    'avg_finish': Target,
  };

  const useYearStats = stats.yearStats !== null;
  const useOpponentYearStats = opponentStats?.yearStats !== null;
  const statData = useYearStats ? stats.yearStats : stats.career;
  const opponentStatData = useOpponentYearStats ? opponentStats.yearStats : opponentStats?.career;
  
  return (
    <VStack spacing="md" align="stretch">
      {/* Driver Headshot and Info */}
      <VStack spacing="md">
        <Box position="relative">
          <Box
            w="160px"
            h="160px"
            borderRadius="full"
            bgGradient={getTeamGradient(getDriverTeam(driver))}
            display="flex"
            alignItems="center"
            justifyContent="center"
            border="4px solid"
            borderColor={`#${teamColor}`}
            boxShadow="lg"
            overflow="hidden"
            position="relative"
            _before={{
              content: '""',
              position: 'absolute',
              inset: 0,
              borderRadius: 'full',
              background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
              pointerEvents: 'none',
            }}
          >
            <Image
              src={headshot || '/default-driver.png'}
              alt={driver.fullName}
              w="160px"
              h="160px"
              borderRadius="full"
              objectFit="cover"
              position="relative"
              zIndex={1}
            />
          </Box>
          <Badge
            position="absolute"
            top="-8px"
            right="-8px"
            bg={`#${teamColor}`}
            color="white"
            borderRadius="full"
            w="32px"
            h="32px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="sm"
            fontWeight="bold"
          >
            {driver.id}
          </Badge>
        </Box>
        <VStack spacing="xs" textAlign="center">
          <Text fontFamily="heading" fontWeight="bold" fontSize="lg" color="text-primary">
            {driver.fullName}
          </Text>
          <Text fontSize="sm" color="text-muted">
            {driver.teamName}
          </Text>
        </VStack>
      </VStack>

      {/* List of Stat Cards */}
      <VStack spacing={3} align="stretch" w="100%">
        {enabledMetrics.map(metric => {
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
          const value = (statData as any)[statKey] ?? 0;
          const opponentValue = (opponentStatData as any)?.[statKey] ?? 0;
          const label = availableMetrics[metric as keyof typeof availableMetrics];
          const icon = metricIconMap[metric] || Star; // Default to Star icon
          
          // Determine if this driver wins this metric
          const isWinner = determineWinner(value, opponentValue, metric);
          
          return (
            <StatCard 
              key={metric} 
              label={label} 
              value={value} 
              icon={icon} 
              teamColor={teamColor}
              isWinner={isWinner}
              metric={metric}
            />
          );
        })}
      </VStack>
    </VStack>
  );
};

const CompareDriversPage = () => {
  const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0();
  
  // Progressive disclosure state
  const [currentStep, setCurrentStep] = useState<ComparisonStep>('parameters');
  const [currentPhase, setCurrentPhase] = useState<ParameterPhase>('drivers');

  // Enhanced hook with new comparison features
  const { 
    allDrivers, 
    driver1, 
    driver2, 
    loading, 
    error, 
    handleSelectDriver,
    // NEW: Comparison features
    years,
    stats1,
    stats2,
    enabledMetrics,
    score,
    selectDriver,
    selectDriverForYears,
    toggleMetric,
  } = useDriverComparison();
  
  // Year selection state - allow multiple years per driver
  const [selectedYears1, setSelectedYears1] = useState<string[]>([]);
  const [selectedYears2, setSelectedYears2] = useState<string[]>([]);
  
  // Driver career info for filtering years
  const [driver1CareerInfo, setDriver1CareerInfo] = useState<{ firstRaceYear: number } | null>(null);
  const [driver2CareerInfo, setDriver2CareerInfo] = useState<{ firstRaceYear: number } | null>(null);

  // Function to fetch driver career info
  const fetchDriverCareerInfo = async (driverId: string) => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`/api/drivers/${driverId}/career-stats`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        const firstRaceYear = data.careerStats?.firstRace?.year;
        if (firstRaceYear) {
          return { firstRaceYear: parseInt(firstRaceYear, 10) };
        }
      }
    } catch (error) {
      console.error('Failed to fetch driver career info:', error);
    }
    return null;
  };

  // Filter years based on driver's first race year
  const getFilteredYears = (driverCareerInfo: { firstRaceYear: number } | null) => {
    if (!driverCareerInfo) return years;
    return years.filter(year => year >= driverCareerInfo.firstRaceYear);
  };

  // Fetch career info when drivers are selected
  useEffect(() => {
    if (driver1?.id) {
      fetchDriverCareerInfo(driver1.id.toString()).then(info => {
        setDriver1CareerInfo(info);
        // Clear selected years if they're now invalid
        if (info) {
          setSelectedYears1(prev => prev.filter(year => parseInt(year, 10) >= info.firstRaceYear));
        }
      });
    } else {
      setDriver1CareerInfo(null);
      setSelectedYears1([]);
    }
  }, [driver1?.id]);

  useEffect(() => {
    if (driver2?.id) {
      fetchDriverCareerInfo(driver2.id.toString()).then(info => {
        setDriver2CareerInfo(info);
        // Clear selected years if they're now invalid
        if (info) {
          setSelectedYears2(prev => prev.filter(year => parseInt(year, 10) >= info.firstRaceYear));
        }
      });
    } else {
      setDriver2CareerInfo(null);
      setSelectedYears2([]);
    }
  }, [driver2?.id]);

  // Step navigation helpers
  const canProceedToTime = driver1 && driver2;
  const enabledMetricsArray = Object.keys(enabledMetrics).filter(key => enabledMetrics[key as keyof typeof enabledMetrics]);
  const canProceedToStats = canProceedToTime && selectedYears1.length > 0 && selectedYears2.length > 0;
  const canProceedToResults = canProceedToStats && enabledMetricsArray.length > 0;

  // Auto-progress through phases (matching constructors behavior)
  useEffect(() => {
    if (canProceedToTime && currentPhase === 'drivers') {
      const timer = setTimeout(() => {
        setCurrentPhase('time');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [canProceedToTime, currentPhase]);

  useEffect(() => {
    if (canProceedToStats && currentPhase === 'time') {
      const timer = setTimeout(() => {
        setCurrentPhase('stats');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [canProceedToStats, currentPhase]);

  
  const nextStep = () => {
    if (currentStep === 'parameters' && currentPhase === 'stats' && canProceedToResults) {
      // Aggregate data for selected years before showing results
      if (driver1 && driver2 && selectedYears1.length > 0 && selectedYears2.length > 0) {
        const years1 = selectedYears1.map(y => parseInt(y, 10));
        const years2 = selectedYears2.map(y => parseInt(y, 10));
        
        // Fetch aggregated stats for both drivers
        selectDriverForYears(1, driver1.id.toString(), years1);
        selectDriverForYears(2, driver2.id.toString(), years2);
      }
      setCurrentStep('results');
    }
  };
  
  const prevStep = () => {
    if (currentStep === 'results') {
      setCurrentStep('parameters');
      setCurrentPhase('drivers');
    }
  };

  // Build dropdown options with proper name fallbacks
  const driverOptions: SelectOption[] = allDrivers.map((d) => {
    // Create a proper display name with fallbacks
    const displayName = d.full_name || 
                       (d.given_name && d.family_name ? `${d.given_name} ${d.family_name}` : '') ||
                       d.code ||
                       `Driver ${d.id}`;
    
    return {
      value: d.id,
      label: displayName,
    };
  });

  // PDF export functionality
  const handleExportPDF = async () => {
    if (!driver1 || !driver2 || !stats1 || !stats2) {
      alert('Please select both drivers and complete the comparison before exporting.');
      return;
    }

    try {
      const teamColor1 = getTeamColor(driver1.teamName || 'Default');
      const teamColor2 = getTeamColor(driver2.teamName || 'Default');

      await DriverPdfComparisonCard({
        driver1: {
          ...driver1,
          teamColorHex: teamColor1,
        },
        driver2: {
          ...driver2,
          teamColorHex: teamColor2,
        },
        stats1: stats1.yearStats || stats1.career,
        stats2: stats2.yearStats || stats2.career,
        enabledMetrics,
        score,
      });
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export PDF. Check console for details or try using different drivers.');
    }
  };

  if (!isAuthenticated) {
    return (
      <Flex direction="column" align="center" justify="center" minH="60vh" gap={4} p="xl">
        <Heading size="md" fontFamily="heading">Login to Compare Drivers</Heading>
        <Text color="text-secondary">Please sign in to access the comparison tool.</Text>
        <Button
          bg="border-accent"
          _hover={{ bg: 'border-accentDark' }}
          color="white"
          onClick={() => loginWithRedirect()}
        >
          Login
        </Button>
      </Flex>
    );
  }

  // Step 1: Driver Selection Component
  // Phase 1: Driver Selection
  const Phase1DriverSelection = () => (
    <VStack spacing="xl" align="stretch">
      <VStack spacing="md" textAlign="center">
        <Heading size="lg" fontFamily="heading">Choose Your Drivers</Heading>
        <Text color="text-muted" fontSize="lg">
          {driver1?.id && driver2?.id 
            ? "Both drivers selected - ready to proceed" 
            : driver1?.id 
            ? "Select the second driver to compare" 
            : "Select two drivers to compare their performance"
          }
        </Text>
      </VStack>
      
      <Grid
        templateColumns={{ base: '1fr', lg: '1fr auto 1fr' }}
        gap="lg"
        alignItems="flex-start"
        maxW="1000px"
        mx="auto"
      >
        <DriverSelectionPanel
          title="Driver 1"
          allDrivers={driverOptions}
          selectedDriverData={driver1}
          onDriverSelect={(id) => {
            const driverId = String(id);
            // Use the new selectDriver function for live stats
            selectDriver(1, driverId, 'career');
            // Also update legacy data for backward compatibility
            handleSelectDriver(1, driverId);
          }}
          isLoading={loading}
          extraControl={null}
        />

        <Flex
          align="center"
          justify="center"
          h={{ base: '60px', lg: '150px' }}
        >
          <Heading size={{ base: 'xl', lg: '3xl' }} color="border-accent" fontFamily="heading">
            VS
          </Heading>
        </Flex>

        <DriverSelectionPanel
          title="Driver 2"
          allDrivers={driverOptions}
          selectedDriverData={driver2}
          onDriverSelect={(id) => {
            const driverId = String(id);
            // Use the new selectDriver function for live stats
            selectDriver(2, driverId, 'career');
            // Also update legacy data for backward compatibility
            handleSelectDriver(2, driverId);
          }}
          isLoading={loading}
          extraControl={null}
        />
      </Grid>
      
    </VStack>
  );

  // Phase 2: Time Period Selection
  const Phase2TimeSelection = () => {
    const driver1Years = getFilteredYears(driver1CareerInfo);
    const driver2Years = getFilteredYears(driver2CareerInfo);

    return (
      <VStack spacing="xl" align="stretch">
        <VStack spacing="md" textAlign="center">
          <Heading size="lg" fontFamily="heading">Select Time Period</Heading>
          <Text color="text-muted" fontSize="lg">
            Choose the years for each driver's comparison data
          </Text>
        </VStack>
        
        {/* Year Selection */}
        <Box p="lg" bg="bg-surface" borderRadius="lg" border="1px solid" borderColor="border-primary">
          <VStack spacing="md" align="stretch">
            <Heading size="md" fontFamily="heading" color="text-primary">Time Period Selection</Heading>
            <Text fontSize="sm" color="text-muted">Select one or more years for each driver's comparison data</Text>
            
            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap="lg" w="full">
              {/* Driver 1 Year Selection */}
              <VStack spacing="sm" align="stretch">
                <HStack justify="space-between" align="center">
                  <Text fontSize="sm" fontFamily="heading" color="text-primary">
                    {driver1?.fullName || 'Driver 1'} - Years
                  </Text>
                  <Button
                    size="xs"
                    variant="ghost"
                    color="border-accent"
                    _hover={{ bg: "border-accent", color: "white" }}
                    onClick={() => {
                      if (selectedYears1.length === driver1Years.length) {
                        setSelectedYears1([]);
                      } else {
                        setSelectedYears1(driver1Years.map(y => y.toString()));
                      }
                    }}
                    fontFamily="heading"
                    fontSize="xs"
                  >
                    {selectedYears1.length === driver1Years.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </HStack>
                <Flex gap="sm" flexWrap="wrap" justify="center">
                  {driver1Years.length > 0 ? (
                    driver1Years.map((year) => {
                      const isSelected = selectedYears1.includes(year.toString());
                      return (
                        <Button
                          key={`driver1-${year}`}
                          size="sm"
                          variant={isSelected ? "solid" : "outline"}
                          colorScheme={isSelected ? "red" : "gray"}
                          bg={isSelected ? "border-accent" : "transparent"}
                          color={isSelected ? "white" : "text-primary"}
                          borderColor="border-accent"
                          _hover={{
                            bg: isSelected ? "border-accentDark" : "border-accent",
                            color: "white",
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                          }}
                          _active={{}}
                          onClick={() => {
                            const yearStr = year.toString();
                            if (isSelected) {
                              setSelectedYears1(prev => prev.filter(y => y !== yearStr));
                            } else {
                              setSelectedYears1(prev => [...prev, yearStr]);
                              if (driver1) {
                                selectDriver(1, driver1.id.toString(), year);
                              }
                            }
                          }}
                          fontFamily="heading"
                        >
                          {year}
                        </Button>
                      );
                    })
                  ) : (
                    <Text fontSize="sm" color="text-muted">No years available</Text>
                  )}
                </Flex>
                {selectedYears1.length > 0 && (
                  <Text fontSize="xs" color="border-accent" textAlign="center">
                    Selected: {selectedYears1.join(', ')}
                  </Text>
                )}
              </VStack>

              {/* Driver 2 Year Selection */}
              <VStack spacing="sm" align="stretch">
                <HStack justify="space-between" align="center">
                  <Text fontSize="sm" fontFamily="heading" color="text-primary">
                    {driver2?.fullName || 'Driver 2'} - Years
                  </Text>
                  <Button
                    size="xs"
                    variant="ghost"
                    color="border-accent"
                    _hover={{ bg: "border-accent", color: "white" }}
                    onClick={() => {
                      if (selectedYears2.length === driver2Years.length) {
                        setSelectedYears2([]);
                      } else {
                        setSelectedYears2(driver2Years.map(y => y.toString()));
                      }
                    }}
                    fontFamily="heading"
                    fontSize="xs"
                  >
                    {selectedYears2.length === driver2Years.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </HStack>
                <Flex gap="sm" flexWrap="wrap" justify="center">
                  {driver2Years.length > 0 ? (
                    driver2Years.map((year) => {
                      const isSelected = selectedYears2.includes(year.toString());
                      return (
                        <Button
                          key={`driver2-${year}`}
                          size="sm"
                          variant={isSelected ? "solid" : "outline"}
                          colorScheme={isSelected ? "red" : "gray"}
                          bg={isSelected ? "border-accent" : "transparent"}
                          color={isSelected ? "white" : "text-primary"}
                          borderColor="border-accent"
                          _hover={{
                            bg: isSelected ? "border-accentDark" : "border-accent",
                            color: "white",
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                          }}
                          _active={{}}
                          onClick={() => {
                            const yearStr = year.toString();
                            if (isSelected) {
                              setSelectedYears2(prev => prev.filter(y => y !== yearStr));
                            } else {
                              setSelectedYears2(prev => [...prev, yearStr]);
                              if (driver2) {
                                selectDriver(2, driver2.id.toString(), year);
                              }
                            }
                          }}
                          fontFamily="heading"
                        >
                          {year}
                        </Button>
                      );
                    })
                  ) : (
                    <Text fontSize="sm" color="text-muted">No years available</Text>
                  )}
                </Flex>
                {selectedYears2.length > 0 && (
                  <Text fontSize="xs" color="border-accent" textAlign="center">
                    Selected: {selectedYears2.join(', ')}
                  </Text>
                )}
              </VStack>
            </Grid>

            {/* Year Selection Status */}
            {(selectedYears1.length > 0 || selectedYears2.length > 0) && (
              <Box p="sm" bg="bg-glassmorphism" borderRadius="md" textAlign="center">
                <Text fontSize="xs" color="text-muted">
                  {selectedYears1.length > 0 && selectedYears2.length > 0 ? (
                    `Comparing ${driver1?.fullName} (${selectedYears1.join(', ')}) vs ${driver2?.fullName} (${selectedYears2.join(', ')})`
                  ) : selectedYears1.length > 0 ? (
                    `${driver1?.fullName} years selected: ${selectedYears1.join(', ')}. Select years for ${driver2?.fullName}.`
                  ) : selectedYears2.length > 0 ? (
                    `${driver2?.fullName} years selected: ${selectedYears2.join(', ')}. Select years for ${driver1?.fullName}.`
                  ) : (
                    'Select years for both drivers to proceed'
                  )}
                </Text>
              </Box>
            )}
          </VStack>
        </Box>

      </VStack>
    );
  };

  // Phase 3: Statistics Selection
  const Phase3StatisticsSelection = () => {
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

    return (
      <VStack spacing="xl" align="stretch">
        <VStack spacing="md" textAlign="center">
          <Heading size="lg" fontFamily="heading">Select Statistics</Heading>
          <Text color="text-muted" fontSize="lg">
            Choose the metrics you want to compare
          </Text>
        </VStack>
        
        {/* Statistics Selection */}
        <Box p="lg" bg="bg-surface" borderRadius="lg" border="1px solid" borderColor="border-primary">
          <VStack spacing="md" align="stretch">
            <HStack justify="space-between" align="center">
              <Heading size="md" fontFamily="heading" color="text-primary">Statistics to Compare</Heading>
              <Button
                size="sm"
                variant="ghost"
                color="border-accent"
                _hover={{ bg: "border-accent", color: "white" }}
                onClick={() => {
                  const allMetricKeys = Object.keys(availableMetrics);
                  const allSelected = allMetricKeys.every(key => enabledMetricsArray.includes(key));
                  
                  if (allSelected) {
                    allMetricKeys.forEach(key => toggleMetric(key as any));
                  } else {
                    allMetricKeys.forEach(key => {
                      if (!enabledMetricsArray.includes(key)) {
                        toggleMetric(key as any);
                      }
                    });
                  }
                }}
                fontFamily="heading"
                fontSize="sm"
              >
                {Object.keys(availableMetrics).every(key => enabledMetricsArray.includes(key)) ? 'Deselect All' : 'Select All'}
              </Button>
            </HStack>
            <Text fontSize="sm" color="text-muted">
              Select the metrics you want to compare. Choose at least one statistic.
            </Text>
            <Flex gap="sm" flexWrap="wrap" justify="center">
              {Object.entries(availableMetrics).map(([key, label]) => (
                <Button
                  key={key}
                  size="sm"
                  variant={enabledMetricsArray.includes(key) ? "solid" : "outline"}
                  colorScheme={enabledMetricsArray.includes(key) ? "red" : "gray"}
                  bg={enabledMetricsArray.includes(key) ? "border-accent" : "transparent"}
                  color={enabledMetricsArray.includes(key) ? "white" : "text-primary"}
                  borderColor="border-accent"
                  borderWidth={enabledMetricsArray.includes(key) ? "2px" : "1px"}
                  boxShadow={enabledMetricsArray.includes(key) ? "0 0 10px rgba(225, 6, 0, 0.3)" : "none"}
                  _hover={{
                    bg: enabledMetricsArray.includes(key) ? "border-accentDark" : "border-accent",
                    color: "white",
                    transform: 'scale(1.05)',
                    boxShadow: enabledMetricsArray.includes(key) ? "0 0 15px rgba(225, 6, 0, 0.5)" : "0 4px 15px rgba(0,0,0,0.1)"
                  }}
                  _active={{ transform: 'scale(0.95)' }}
                  onClick={() => toggleMetric(key as any)}
                  fontFamily="heading"
                  transition="all 0.2s ease"
                  position="relative"
                >
                  {enabledMetricsArray.includes(key) && (
                    <Box
                      position="absolute"
                      top="-2px"
                      right="-2px"
                      w="16px"
                      h="16px"
                      bg="green.500"
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="10px"
                      color="white"
                      fontWeight="bold"
                    >
                      ✓
                    </Box>
                  )}
                  {label}
                </Button>
              ))}
            </Flex>
            {enabledMetricsArray.length === 0 && (
              <Text fontSize="xs" color="border-accent" textAlign="center" mt="sm">
                Please select at least one statistic to compare
              </Text>
            )}
          </VStack>
        </Box>

        {canProceedToResults && (
          <ScaleFade in={canProceedToResults} initialScale={0.9}>
            <Flex justify="flex-end" mt="xl">
              <Button
                rightIcon={<ChevronRight size={20} />}
                onClick={nextStep}
                size="lg"
                bg="border-accent"
                _hover={{ 
                  bg: 'border-accentDark',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                }}
                _active={{
                  transform: 'translateY(0px)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                }}
                color="white"
                fontFamily="heading"
                transition="all 0.2s ease"
                boxShadow="0 4px 15px rgba(0,0,0,0.1)"
              >
                View Comparison
              </Button>
            </Flex>
          </ScaleFade>
        )}
      </VStack>
    );
  };

  // New Step 1: Progressive Parameters Selection
  const Step1Parameters = () => (
    <VStack spacing="xl" align="stretch">
      {/* Phase 1: Driver Selection - Always visible */}
      <Phase1DriverSelection />
      
      {/* Phase 2: Time Period Selection - Appears after drivers selected */}
      {(currentPhase === 'time' || currentPhase === 'stats') && (
        <SlideFade in={currentPhase === 'time' || currentPhase === 'stats'} offsetY="20px">
          <Phase2TimeSelection />
        </SlideFade>
      )}
      
      {/* Phase 3: Statistics Selection - Appears after time period selected */}
      {currentPhase === 'stats' && (
        <SlideFade in={currentPhase === 'stats'} offsetY="20px">
          <Phase3StatisticsSelection />
        </SlideFade>
      )}
    </VStack>
  );


  // Step 3: Results Display Component
  const Step3Results = () => {
    // Get driver headshots - use stats data if available, fallback to legacy
    const driver1Headshot = (stats1 ? driverHeadshots[driver1?.fullName || ''] : driver1 ? driverHeadshots[driver1.fullName] : null);
    const driver2Headshot = (stats2 ? driverHeadshots[driver2?.fullName || ''] : driver2 ? driverHeadshots[driver2.fullName] : null);
    
    // Get team colors using proper driver-team mapping
    const driver1TeamColor = getTeamColor(getDriverTeam(driver1));
    const driver2TeamColor = getTeamColor(getDriverTeam(driver2));

    // Available metrics for comparison
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

    // Calculate composite score percentage for visualization
    const totalScore = score ? (score.d1 || 0) + (score.d2 || 0) : 0;
    const driver1Percentage = totalScore > 0 ? ((score.d1 || 0) / totalScore) * 100 : 50;
    const driver2Percentage = totalScore > 0 ? ((score.d2 || 0) / totalScore) * 100 : 50;

    return (
      <VStack spacing="xl" align="stretch">
        <VStack spacing="md" textAlign="center">
          <Heading size="lg" fontFamily="heading">Head-to-Head Comparison</Heading>
          <Text color="text-muted" fontSize="lg">
            See how your selected drivers stack up against each other
          </Text>
          {selectedYears1.length > 0 && selectedYears2.length > 0 && (
            <Text color="border-accent" fontSize="md" fontFamily="heading" fontWeight="bold">
              {driver1?.fullName} ({selectedYears1.join(', ')}) vs {driver2?.fullName} ({selectedYears2.join(', ')})
            </Text>
          )}
        </VStack>

        {/* Composite Score moved to bottom */}

        {/* Central-Axis Results Display */}
        <Box p="lg" bg="bg-surface" borderRadius="lg" border="1px solid" borderColor="border-primary">
          <VStack spacing="lg">
            <Heading size="md" fontFamily="heading" color="text-primary">Statistics Comparison</Heading>
            
            {/* Loading State */}
            {loading && (
              <VStack spacing="md" w="full">
                <Skeleton height="120px" width="120px" borderRadius="full" />
                <SkeletonText noOfLines={2} spacing="2" skeletonHeight="4" />
                <VStack spacing="sm" w="full">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} height="60px" width="full" borderRadius="md" />
                  ))}
                </VStack>
              </VStack>
            )}
            
            {/* Two-Column Layout */}
            {!loading && stats1 && stats2 && (
              <Box
                w="full"
                maxW="1400px"
                mx="auto"
                p={{ base: 4, md: 8 }}
              >
                <Grid
                  templateColumns={{ base: '1fr', md: '1fr auto 1fr' }}
                  gap={{ base: 6, md: 8 }}
                  alignItems="start"
                >
                  {/* Driver 1 Column */}
                  <DriverStatsColumn
                    driver={driver1}
                    stats={stats1}
                    headshot={driver1Headshot}
                    teamColor={driver1TeamColor}
                    enabledMetrics={enabledMetricsArray}
                    availableMetrics={availableMetrics}
                    opponentStats={stats2}
                    isDriver1={true}
                  />

                  {/* VS Divider */}
                  <VStack spacing="sm" h="100%" justify="center" pt="120px">
                    <Text fontSize="2xl" color="border-accent" fontFamily="heading" fontWeight="bold">
                      VS
                    </Text>
                    <Box w="2px" h="full" bg="border-accent" borderRadius="full" minH="200px" />
                  </VStack>

                  {/* Driver 2 Column */}
                  <DriverStatsColumn
                    driver={driver2}
                    stats={stats2}
                    headshot={driver2Headshot}
                    teamColor={driver2TeamColor}
                    enabledMetrics={enabledMetricsArray}
                    availableMetrics={availableMetrics}
                    opponentStats={stats1}
                    isDriver1={false}
                  />
                </Grid>
              </Box>
            )}
          </VStack>
        </Box>

        {/* Results Summary & Insights */}
        {score && enabledMetricsArray.length > 0 && (
          <Box p="lg" bg="bg-surface" borderRadius="lg" border="1px solid" borderColor="border-primary">
            <VStack spacing="md">
              <Heading size="md" fontFamily="heading" color="text-primary">Comparison Summary</Heading>
              
              <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap="md" w="full">
                {/* Overall Winner */}
                <Box p="md" bg="bg-glassmorphism" borderRadius="md" textAlign="center">
                  <Text fontSize="sm" color="text-muted" mb="xs">Overall Winner</Text>
                  <Text 
                    fontSize="lg" 
                    fontFamily="heading" 
                    fontWeight="bold" 
                    color={score.d1 > score.d2 ? driver1TeamColor : driver2TeamColor}
                  >
                    {score.d1 > score.d2 ? driver1?.fullName : driver2?.fullName}
                  </Text>
                  <Text fontSize="xs" color="text-muted">
                    {Math.abs(score.d1 - score.d2).toFixed(1)} point difference
                  </Text>
                </Box>

                {/* Dominant Areas */}
                <Box p="md" bg="bg-glassmorphism" borderRadius="md" textAlign="center">
                  <Text fontSize="sm" color="text-muted" mb="xs">Most Dominant</Text>
                  <Text fontSize="lg" fontFamily="heading" fontWeight="bold" color="text-primary">
                    {(() => {
                      const driver1Wins = enabledMetricsArray.filter(metric => {
                        const val1 = stats1?.[metric] || 0;
                        const val2 = stats2?.[metric] || 0;
                        return val1 > val2;
                      }).length;
                      
                      const driver2Wins = enabledMetricsArray.filter(metric => {
                        const val1 = stats1?.[metric] || 0;
                        const val2 = stats2?.[metric] || 0;
                        return val2 > val1;
                      }).length;

                      if (driver1Wins > driver2Wins) return `${driver1?.fullName} (${driver1Wins}/${enabledMetricsArray.length})`;
                      if (driver2Wins > driver1Wins) return `${driver2?.fullName} (${driver2Wins}/${enabledMetricsArray.length})`;
                      return "Evenly Matched";
                    })()}
                  </Text>
                  <Text fontSize="xs" color="text-muted">
                    categories won
                  </Text>
                </Box>
              </Grid>

              {/* Key Insights */}
              <Box w="full" p="md" bg="bg-glassmorphism" borderRadius="md">
                <Text fontSize="sm" color="text-muted" mb="sm" fontFamily="heading">Key Insights</Text>
                <VStack spacing="xs" align="stretch">
                  {(() => {
                    const insights = [];
                    
                    // Find biggest difference
                    let biggestDiff = 0;
                    let biggestDiffMetric = '';
                    enabledMetricsArray.forEach(metric => {
                      const val1 = stats1?.[metric] || 0;
                      const val2 = stats2?.[metric] || 0;
                      const diff = Math.abs(val1 - val2);
                      if (diff > biggestDiff) {
                        biggestDiff = diff;
                        biggestDiffMetric = availableMetrics[metric as keyof typeof availableMetrics];
                      }
                    });

                    if (biggestDiffMetric) {
                      const metricKey = enabledMetricsArray.find(m => availableMetrics[m as keyof typeof availableMetrics] === biggestDiffMetric);
                      const val1 = metricKey ? (stats1 as any)?.[metricKey] || 0 : 0;
                      const val2 = metricKey ? (stats2 as any)?.[metricKey] || 0 : 0;
                      const winner = val1 > val2 ? driver1?.fullName : driver2?.fullName;
                      insights.push(`🏆 ${winner} dominates in ${biggestDiffMetric} with ${Math.max(val1, val2)} vs ${Math.min(val1, val2)}`);
                    }

                    // Check for ties
                    const ties = enabledMetricsArray
                      .filter(metric => {
                        const v1 = (stats1 as any)?.[metric] || 0;
                        const v2 = (stats2 as any)?.[metric] || 0;
                        return v1 === v2;
                      })
                      .map(t => availableMetrics[t as keyof typeof availableMetrics])
                      .filter(Boolean);

                    if (ties.length > 0) {
                      insights.push(`⚖️ Tied in ${ties.length} ${ties.length > 1 ? 'categories' : 'category'}: ${ties.join(', ')}`);
                    }

                    return insights.map((insight, index) => (
                      <Text key={index} fontSize="sm" color="text-primary">
                        {insight}
                      </Text>
                    ));
                  })()}
                </VStack>
              </Box>
            </VStack>
          </Box>
        )}

        {/* Composite Score Visualization - moved to bottom with explanation */}
        {score && (
          <Box p="lg" bg="bg-surface" borderRadius="lg" border="1px solid" borderColor="border-primary">
            <VStack spacing="md">
              <Heading size="md" fontFamily="heading" color="text-primary">Composite Score</Heading>
              
              {/* Tug-of-War Style Bar */}
              <Box w="full" maxW="800px" mx="auto">
                <Flex align="center" justify="space-between" mb="sm">
                  <Text fontSize="sm" color="text-muted" fontFamily="heading">
                    {driver1?.fullName}
                  </Text>
                  <Text fontSize="sm" color="text-muted" fontFamily="heading">
                    {driver2?.fullName}
                  </Text>
                </Flex>
                
                <Box position="relative" h="8px" bg="border-subtle" borderRadius="full" overflow="hidden">
                  <Flex h="full">
                    <Box
                      h="full"
                      bg={driver1TeamColor}
                      w={`${driver1Percentage}%`}
                      transition="width 0.8s ease"
                    />
                    <Box
                      h="full"
                      bg={driver2TeamColor}
                      w={`${driver2Percentage}%`}
                      transition="width 0.8s ease"
                    />
                  </Flex>
                </Box>
                
                <Flex align="center" justify="space-between" mt="sm">
                  <Text fontSize="lg" fontFamily="heading" fontWeight="bold" color={driver1TeamColor}>
                    {score.d1?.toFixed(1) || '0.0'}
                  </Text>
                  <Text fontSize="lg" fontFamily="heading" fontWeight="bold" color={driver2TeamColor}>
                    {score.d2?.toFixed(1) || '0.0'}
                  </Text>
                </Flex>
              </Box>

              <VStack spacing="2" align="center" maxW="900px">
                <Text fontSize="sm" color="text-primary" fontWeight="bold">How this score works</Text>
                <Text fontSize="xs" color="text-muted" textAlign="center">
                  We compare drivers on each enabled metric, normalize to 0–1, then average and scale to 0–100.
                </Text>
                <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={2} w="full">
                  <HStack spacing="2" justify="center">
                    <Box w="8px" h="8px" borderRadius="full" bg="border-accent" />
                    <Text fontSize="xs" color="text-muted">Higher is better for most stats (Wins, Points, Podiums, Poles)</Text>
                  </HStack>
                  <HStack spacing="2" justify="center">
                    <Box w="8px" h="8px" borderRadius="full" bg="border-accent" />
                    <Text fontSize="xs" color="text-muted">Lower is better for DNFs (we invert the value)</Text>
                  </HStack>
                  <HStack spacing="2" justify="center">
                    <Box w="8px" h="8px" borderRadius="full" bg="border-accent" />
                    <Text fontSize="xs" color="text-muted">Multiple years selected? We aggregate first, then normalize</Text>
                  </HStack>
                  <HStack spacing="2" justify="center">
                    <Box w="8px" h="8px" borderRadius="full" bg="border-accent" />
                    <Text fontSize="xs" color="text-muted">Final score averages only the metrics you enabled</Text>
                  </HStack>
                </Grid>
              </VStack>
            </VStack>
          </Box>
        )}

        {/* Action Buttons */}
        <Flex justify="space-between" mt="xl">
          <Button
            leftIcon={<ChevronLeft size={20} />}
            onClick={prevStep}
            variant="outline"
            fontFamily="heading"
            _hover={{
              transform: 'translateX(-2px)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}
            transition="all 0.2s ease"
          >
            Back to Parameters
          </Button>
          
          <Button
            leftIcon={<Download size={20} />}
            onClick={handleExportPDF}
            bg="border-accent"
            _hover={{ 
              bg: 'border-accentDark',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
            }}
            _active={{
              transform: 'translateY(0px)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}
            color="white"
            fontFamily="heading"
            transition="all 0.2s ease"
            boxShadow="0 4px 15px rgba(0,0,0,0.1)"
          >
            Export Results
          </Button>
        </Flex>
      </VStack>
    );
  };

  return (
    <Box>
      <PageHeader 
        title="Driver Comparison" 
        subtitle="Compare F1 drivers head-to-head"
      />
      <LayoutContainer>
        <CompareTabs active="drivers" />
        <Box p={{ base: 'md', md: 'xl' }}>
        {error && <Text color="border-accent" textAlign="center" fontSize="lg" p="xl">{error}</Text>}

        {/* Progress Indicator */}
        <Box mb="xl" maxW="400px" mx="auto">
          <HStack spacing="sm" justify="center">
            {['parameters', 'results'].map((step, index) => (
              <HStack key={step} spacing="sm">
                <Box
                  w="8px"
                  h="8px"
                  borderRadius="full"
                  bg={currentStep === step ? 'border-accent' : 'border-subtle'}
                  transition="all 0.3s ease"
                />
                {index < 1 && (
                  <Box
                    w="20px"
                    h="2px"
                    bg={currentStep === 'results' ? 'border-accent' : 'border-subtle'}
                    transition="all 0.3s ease"
                  />
                )}
              </HStack>
            ))}
          </HStack>
          <Text fontSize="xs" color="text-muted" textAlign="center" mt="sm">
            {currentStep === 'parameters' ? (
              currentPhase === 'drivers' ? 'Step 1 of 2 - Select Drivers' :
              currentPhase === 'time' ? 'Step 1 of 2 - Select Time Period' :
              'Step 1 of 2 - Select Statistics'
            ) : 'Step 2 of 2 - View Results'}
          </Text>
        </Box>

        {/* Progressive Disclosure: Render current step with animations */}
        <Fade in={currentStep === 'parameters'} unmountOnExit>
          {currentStep === 'parameters' && <Step1Parameters />}
        </Fade>
        
        <SlideFade in={currentStep === 'results'} offsetY="20px" unmountOnExit>
          {currentStep === 'results' && <Step3Results />}
        </SlideFade>
        </Box>
      </LayoutContainer>
    </Box>
  );
};

export default CompareDriversPage;