// frontend/src/pages/Dashboard/DashboardPage.tsx

import { useState, useEffect, useRef } from 'react';
import { Box, useDisclosure, Text, Alert, AlertIcon, AlertTitle } from '@chakra-ui/react';
import { Responsive as RGL, WidthProvider } from 'react-grid-layout';
import type { Layouts } from 'react-grid-layout';
import { useDashboardData } from '../../hooks/useDashboardData';
import { useThemeColor } from '../../context/ThemeColorContext';
import PageLoadingOverlay from '../../components/loaders/PageLoadingOverlay';
import DashboardHeader from './components/DashboardHeader';
import CustomizeDashboardModal from './components/CustomizeDashboardModal';
import NextRaceWidget from './widgets/NextRaceWidget';
import ChampionshipStandingsWidget from '@/pages/Dashboard/widgets/ChampionshipStandingsWidget';
import LastPodiumWidget from './widgets/LastPodiumWidget';
import FastestLapWidget from './widgets/FastestLapWidget';
import FavoriteDriverSnapshotWidget from './widgets/FavoriteDriverSnapshotWidget';
import FavoriteTeamSnapshotWidget from './widgets/FavoriteTeamSnapshotWidget';
import HeadToHeadQuickCompareWidget from './widgets/HeadToHeadQuickCompareWidget';
import LatestF1NewsWidget from './widgets/LatestF1NewsWidget';
import ConstructorStandingsWidget from './widgets/ConstructorStandingsWidget';
import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom'; 

// Apply WidthProvider to ResponsiveGridLayout
const ResponsiveGridLayout = WidthProvider(RGL);

// Fallback banner component
const FallbackBanner = ({ accentColor }: { accentColor: string }) => (
  <Alert status="warning" variant="solid" bg={`#${accentColor}`} color="white" borderRadius="md" mb="lg">
    <AlertIcon as={AlertTriangle} color="white" />
    <AlertTitle fontFamily="heading" fontSize="md">Live Data Unavailable. Showing cached data.</AlertTitle>
  </Alert>
);

// Define initial layout configuration with standardized sizes (moved outside component)
const initialLayouts = {
  lg: [
    // Row 1: Two horizontal rectangles
    { i: 'nextRace', x: 0, y: 0, w: 2, h: 2, isResizable: false },
    { i: 'standings', x: 2, y: 0, w: 1, h: 2, isResizable: false },
    { i: 'constructorStandings', x: 3, y: 0, w: 1, h: 2, isResizable: false },

    // Row 2: Four squares
    { i: 'lastPodium', x: 0, y: 2, w: 1, h: 2, isResizable: false },
    { i: 'fastestLap', x: 1, y: 2, w: 1, h: 2, isResizable: false },
    { i: 'favoriteDriver', x: 2, y: 2, w: 1, h: 2, isResizable: false },
    { i: 'favoriteTeam', x: 3, y: 2, w: 1, h: 2, isResizable: false },

    // Row 3: Two horizontal rectangles
    { i: 'headToHead', x: 0, y: 4, w: 2, h: 2, isResizable: false },
    { i: 'f1News', x: 2, y: 4, w: 2, h: 2, isResizable: false },
  ]
};

interface WidgetVisibility {
  nextRace: boolean;
  standings: boolean;
  constructorStandings: boolean;
  lastPodium: boolean;
  fastestLap: boolean;
  favoriteDriver: boolean;
  favoriteTeam: boolean;
  headToHead: boolean;
  f1News: boolean;
}

function DashboardPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: dashboardData, loading, error, isFallback } = useDashboardData();
  const { accentColor, accentColorWithHash } = useThemeColor();

  // TODO: Sync this state with user preferences in Supabase
  const [widgetVisibility, setWidgetVisibility] = useState<WidgetVisibility>({
    nextRace: true,
    standings: true,
    constructorStandings: true,
    lastPodium: true,
    fastestLap: true,
    favoriteDriver: true,
    favoriteTeam: true,
    headToHead: true,
    f1News: true,
  });

  // Layout state management - always maintain full layout configuration
  const [layouts, setLayouts] = useState<Layouts>(initialLayouts);
  
  // Track previous visibility state to detect when widgets are re-added
  const prevVisibilityRef = useRef<WidgetVisibility>(widgetVisibility);

  // Only show a full-page error if the API fails AND we have no fallback data
  if (error && !dashboardData) {
    return (
      <Box>
        <DashboardHeader onCustomizeClick={onOpen} />
        <Box p="lg">
          <Text color={accentColorWithHash}>Error loading dashboard: {error}</Text>
        </Box>
      </Box>
    );
  }

  // Widget components map
  const widgetComponents: { [key: string]: React.ReactNode } = {
    nextRace: <NextRaceWidget data={dashboardData?.nextRace} />,
    standings: (
      <Link to="/standings/drivers">
        <ChampionshipStandingsWidget data={dashboardData?.championshipStandings || []} year={dashboardData?.standingsYear as number} />
      </Link>
    ),
    constructorStandings: (
      <Link to="/standings/constructors">
        <ConstructorStandingsWidget data={dashboardData?.constructorStandings} year={dashboardData?.standingsYear} />
      </Link>
    ),
    lastPodium: <LastPodiumWidget data={dashboardData?.lastRacePodium} />,
    fastestLap: <FastestLapWidget data={dashboardData?.lastRaceFastestLap} />,
    favoriteDriver: <FavoriteDriverSnapshotWidget />,
    favoriteTeam: <FavoriteTeamSnapshotWidget />,
    headToHead: <HeadToHeadQuickCompareWidget data={dashboardData?.headToHead} />,
    f1News: <LatestF1NewsWidget />,
  };

  // Effect to handle widget re-addition - reset to original layout
  useEffect(() => {
    const prevVisibility = prevVisibilityRef.current;
    const reAddedWidgets: string[] = [];
    
    // Find widgets that were just re-added (false -> true)
    Object.keys(widgetVisibility).forEach(key => {
      if (widgetVisibility[key as keyof WidgetVisibility] && !prevVisibility[key as keyof WidgetVisibility]) {
        reAddedWidgets.push(key);
      }
    });
    
    if (reAddedWidgets.length > 0) {
      // Reset to original layout to ensure proper positioning
      setLayouts(initialLayouts);
    }
    
    // Update the ref for next comparison
    prevVisibilityRef.current = { ...widgetVisibility };
  }, [widgetVisibility]);

  // Refined layout change handler that preserves hidden widget layouts
  const handleLayoutChange = (_layout: any, allLayouts: Layouts) => {
    // Simply update the layouts with the new positions
    // The layouts state should always contain all widgets, visible and hidden
    setLayouts(allLayouts);
  };

  return (
    <Box>
      <DashboardHeader onCustomizeClick={onOpen} />
      <Box p={{ base: 'md', md: 'lg' }}>
        {isFallback && <FallbackBanner accentColor={accentColor} />} {/* Render banner when using fallback data */}
        
        {loading ? (
          <PageLoadingOverlay text="Loading your personalized dashboard..." />
        ) : (
          <ResponsiveGridLayout
            layouts={(() => {
              // Filter layouts to only include visible widgets
              const filteredLayouts: Layouts = {};
              Object.keys(layouts).forEach(breakpoint => {
                filteredLayouts[breakpoint] = layouts[breakpoint].filter((item: any) => 
                  widgetVisibility[item.i as keyof WidgetVisibility]
                );
              });
              return filteredLayouts;
            })()}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 4, md: 3, sm: 2, xs: 1, xxs: 1 }}
            rowHeight={120}
            onLayoutChange={handleLayoutChange}
            isDraggable={true}
            isResizable={false}
            preventCollision={false}
            isBounded={true}
            compactType="vertical"
            margin={[8, 8]}
            containerPadding={[4, 4]}
            draggableCancel={"button, a, .chakra-button, .no-drag, input, select, textarea"}
            useCSSTransforms={true}
            transformScale={1}
            isDroppable={true}
            allowOverlap={false}
          >
            {Object.keys(widgetVisibility)
              .filter(key => widgetVisibility[key as keyof WidgetVisibility])
              .map(widgetKey => (
                <Box key={widgetKey}>
                  {widgetComponents[widgetKey]}
                </Box>
              ))
            }
          </ResponsiveGridLayout>
        )}
      </Box>
      
      <CustomizeDashboardModal
        isOpen={isOpen}
        onClose={onClose}
        widgetVisibility={widgetVisibility}
        setWidgetVisibility={setWidgetVisibility}
      />
    </Box>
  );
}

export default DashboardPage;
