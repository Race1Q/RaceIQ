// frontend/src/pages/Dashboard/DashboardPage.tsx

import { useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import { Box, useDisclosure, Text, Alert, AlertIcon, AlertTitle, HStack, Icon, Spinner } from '@chakra-ui/react';
import { Responsive as RGL, WidthProvider } from 'react-grid-layout';
import type { Layouts } from 'react-grid-layout';
import { useDashboardData } from '../../hooks/useDashboardData';
import { useThemeColor } from '../../context/ThemeColorContext';
import { useDashboardPreferences, type WidgetVisibility, type WidgetSettings } from '../../hooks/useDashboardPreferences';
import { DashboardSharedDataProvider, useDashboardSharedData } from '../../context/DashboardDataContext';
import { CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardSkeleton from './DashboardSkeleton';
import DashboardHeader from './components/DashboardHeader';
import CustomizeDashboardModal from './components/CustomizeDashboardModal';

// Lazy load all widgets for better code splitting
// Priority 1: Above-fold widgets (load immediately)
const NextRaceWidget = lazy(() => import(/* webpackChunkName: "widget-next-race" */ './widgets/NextRaceWidget'));
const ChampionshipStandingsWidget = lazy(() => import(/* webpackChunkName: "widget-standings" */ './widgets/ChampionshipStandingsWidget'));
const ConstructorStandingsWidget = lazy(() => import(/* webpackChunkName: "widget-constructor-standings" */ './widgets/ConstructorStandingsWidget'));

// Priority 2: Mid-fold widgets (slight delay for initial render)
const LastPodiumWidget = lazy(() => import(/* webpackChunkName: "widget-podium" */ './widgets/LastPodiumWidget'));
const FastestLapWidget = lazy(() => import(/* webpackChunkName: "widget-fastest-lap" */ './widgets/FastestLapWidget'));
const FavoriteDriverSnapshotWidget = lazy(() => import(/* webpackChunkName: "widget-fav-driver" */ './widgets/FavoriteDriverSnapshotWidget'));
const FavoriteTeamSnapshotWidget = lazy(() => import(/* webpackChunkName: "widget-fav-team" */ './widgets/FavoriteTeamSnapshotWidget'));

// Priority 3: Below-fold widgets (load after initial render)
const HeadToHeadQuickCompareWidget = lazy(() => import(/* webpackChunkName: "widget-head-to-head" */ './widgets/HeadToHeadQuickCompareWidget'));
const LatestF1NewsWidget = lazy(() => import(/* webpackChunkName: "widget-news" */ './widgets/LatestF1NewsWidget')); 

// Apply WidthProvider to ResponsiveGridLayout
const ResponsiveGridLayout = WidthProvider(RGL);

// Fallback banner component
const FallbackBanner = ({ accentColor }: { accentColor: string }) => (
  <Alert status="warning" variant="solid" bg={`#${accentColor}`} color="text-on-accent" borderRadius="md" mb="lg">
    <AlertIcon as={AlertTriangle} color="text-on-accent" />
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

function DashboardPageContent() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: dashboardData, loading, error, isFallback } = useDashboardData();
  const { accentColor, accentColorWithHash } = useThemeColor();
  
  // Use the persistent dashboard preferences hook
  const {
    widgetVisibility,
    setWidgetVisibility,
    layouts,
    setLayouts,
    widgetSettings,
    setWidgetSettings,
    isLoading: preferencesLoading,
    saveStatus,
    hasLoadedFromServer,
    savePreferences,
  } = useDashboardPreferences();

  // Get shared dashboard data (driver standings, seasons)
  const { driverStandings } = useDashboardSharedData();
  
  // Track previous visibility state to detect when widgets are re-added
  const prevVisibilityRef = useRef<WidgetVisibility>(widgetVisibility);

  // Handle head-to-head widget preference changes
  const handleHeadToHeadChange = useCallback((newPref: { driver1Id?: number; driver2Id?: number }) => {
    setWidgetSettings((prevSettings: WidgetSettings) => ({
      ...prevSettings,
      headToHead: newPref,
    }));
  }, [setWidgetSettings]);

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

  // Widget loading fallback
  const WidgetLoadingFallback = () => (
    <Box display="flex" alignItems="center" justifyContent="center" h="100%" minH="200px">
      <Spinner size="sm" color={accentColorWithHash} />
    </Box>
  );

  // Render widget based on key - only creates visible widgets
  const renderWidget = useCallback((widgetKey: string) => {
    switch (widgetKey) {
      case 'nextRace':
        return (
          <Suspense fallback={<WidgetLoadingFallback />}>
            <NextRaceWidget data={dashboardData?.nextRace} />
          </Suspense>
        );
      case 'standings':
        return (
          <Suspense fallback={<WidgetLoadingFallback />}>
            <Link to="/standings">
              <ChampionshipStandingsWidget data={dashboardData?.championshipStandings || []} year={dashboardData?.standingsYear as number} />
            </Link>
          </Suspense>
        );
      case 'constructorStandings':
        return (
          <Suspense fallback={<WidgetLoadingFallback />}>
            <Link to="/standings/constructors">
              <ConstructorStandingsWidget data={dashboardData?.constructorStandings} year={dashboardData?.standingsYear} />
            </Link>
          </Suspense>
        );
      case 'lastPodium':
        return (
          <Suspense fallback={<WidgetLoadingFallback />}>
            <LastPodiumWidget data={dashboardData?.lastRacePodium} />
          </Suspense>
        );
      case 'fastestLap':
        return (
          <Suspense fallback={<WidgetLoadingFallback />}>
            <FastestLapWidget data={dashboardData?.lastRaceFastestLap} />
          </Suspense>
        );
      case 'favoriteDriver':
        return (
          <Suspense fallback={<WidgetLoadingFallback />}>
            <FavoriteDriverSnapshotWidget />
          </Suspense>
        );
      case 'favoriteTeam':
        return (
          <Suspense fallback={<WidgetLoadingFallback />}>
            <FavoriteTeamSnapshotWidget />
          </Suspense>
        );
      case 'headToHead':
        return (
          <Suspense fallback={<WidgetLoadingFallback />}>
            <HeadToHeadQuickCompareWidget
              preference={widgetSettings.headToHead}
              onPreferenceChange={handleHeadToHeadChange}
              allDrivers={driverStandings.map(driver => ({
                id: driver.id,
                name: driver.fullName,
                teamName: driver.teamName,
                headshotUrl: driver.headshotUrl,
              }))}
            />
          </Suspense>
        );
      case 'f1News':
        return (
          <Suspense fallback={<WidgetLoadingFallback />}>
            <LatestF1NewsWidget />
          </Suspense>
        );
      default:
        return null;
    }
  }, [dashboardData, widgetSettings, handleHeadToHeadChange, driverStandings, accentColorWithHash]);

  // Effect to handle widget re-addition - reset to original layout
  useEffect(() => {
    // Only reset layout if we've loaded from server and user is adding widgets
    if (!hasLoadedFromServer) return;
    
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
  }, [widgetVisibility, hasLoadedFromServer, setLayouts]);

  // Refined layout change handler that preserves hidden widget layouts
  const handleLayoutChange = useCallback((_layout: any, allLayouts: Layouts) => {
    // Simply update the layouts with the new positions
    // The layouts state should always contain all widgets, visible and hidden
    setLayouts(allLayouts);
  }, [setLayouts]);

  // Memoize filtered layouts to avoid recalculating on every render
  const filteredLayouts = useMemo(() => {
    const filtered: Layouts = {};
    Object.keys(layouts).forEach(breakpoint => {
      filtered[breakpoint] = layouts[breakpoint].filter((item: any) => 
        widgetVisibility[item.i as keyof WidgetVisibility]
      );
    });
    return filtered;
  }, [layouts, widgetVisibility]);

  // Save status indicator component
  const SaveStatusIndicator = () => {
    if (saveStatus === 'idle') return null;
    
    return (
      <HStack spacing={2} fontSize="xs" color="text-muted">
        {saveStatus === 'saving' && (
          <>
            <Spinner size="xs" />
            <Text>Saving...</Text>
          </>
        )}
        {saveStatus === 'saved' && (
          <>
            <Icon as={CheckCircle} color="green.400" />
            <Text>Saved</Text>
          </>
        )}
        {saveStatus === 'error' && (
          <>
            <Icon as={AlertCircle} color="red.400" />
            <Text>Save failed</Text>
          </>
        )}
      </HStack>
    );
  };

  return (
    <Box bg="bg-primary" minH="100vh">
      <DashboardHeader onCustomizeClick={onOpen} />
      <Box 
        p={{ base: 'md', md: 'lg' }}
        css={{
          // Mobile-specific scrolling improvements without constraining height
          '@media (max-width: 768px)': {
            paddingBottom: '40px', // Extra padding to ensure footer is visible
            // Ensure scrollbar is visible
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '3px',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.4)',
              },
            },
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
          },
        }}
      >
        {isFallback && <FallbackBanner accentColor={accentColor} />} {/* Render banner when using fallback data */}
        
        {/* Save status indicator */}
        <Box mb={4} display="flex" justifyContent="flex-end">
          <SaveStatusIndicator />
        </Box>
        
        {loading || preferencesLoading ? (
          <DashboardSkeleton />
        ) : (
          <ResponsiveGridLayout
            layouts={filteredLayouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 4, md: 3, sm: 2, xs: 1, xxs: 1 }}
            rowHeight={120}
            onLayoutChange={handleLayoutChange}
            isResizable={false}
            preventCollision={false}
            isBounded={true}
            compactType="vertical"
            margin={[8, 8]}
            containerPadding={[4, 4]}
            draggableCancel={"button, a, .chakra-button, .no-drag, input, select, textarea, .scrollable-content, [data-scrollable], .widget-content, .chakra-scroll, .chakra-scroll__view, .chakra-vstack, .chakra-hstack, .chakra-box"}
            useCSSTransforms={true}
            transformScale={1}
            isDroppable={true}
            allowOverlap={false}
            // Disable dragging on mobile to prevent conflicts with scrolling
            isDraggable={typeof window !== 'undefined' && window.innerWidth >= 768}
          >
            {Object.keys(widgetVisibility)
              .filter(key => widgetVisibility[key as keyof WidgetVisibility])
              .map(widgetKey => (
                <Box key={widgetKey}>
                  {renderWidget(widgetKey)}
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
        saveStatus={saveStatus}
        onSave={savePreferences}
      />
    </Box>
  );
}

// Wrap with shared data provider
function DashboardPage() {
  return (
    <DashboardSharedDataProvider>
      <DashboardPageContent />
    </DashboardSharedDataProvider>
  );
}

export default DashboardPage;
