// frontend/src/pages/Dashboard/DashboardPage.tsx

import { useState } from 'react';
import { Box, useDisclosure } from '@chakra-ui/react';
import { Responsive as RGL, WidthProvider } from 'react-grid-layout';
import type { Layouts } from 'react-grid-layout';
import DashboardHeader from './components/DashboardHeader';
import CustomizeDashboardModal from './components/CustomizeDashboardModal';
import NextRaceWidget from './widgets/NextRaceWidget';
import StandingsWidget from './widgets/StandingsWidget';
import LastPodiumWidget from './widgets/LastPodiumWidget';
import FastestLapWidget from './widgets/FastestLapWidget';
import FavoriteDriverSnapshotWidget from './widgets/FavoriteDriverSnapshotWidget';
import FavoriteTeamSnapshotWidget from './widgets/FavoriteTeamSnapshotWidget';
import HeadToHeadQuickCompareWidget from './widgets/HeadToHeadQuickCompareWidget';
import LatestF1NewsWidget from './widgets/LatestF1NewsWidget';

// Apply WidthProvider to ResponsiveGridLayout
const ResponsiveGridLayout = WidthProvider(RGL);

// Define initial layout configuration with standardized sizes (moved outside component)
const initialLayouts = {
  lg: [
    // Row 1: Two horizontal rectangles
    { i: 'nextRace', x: 0, y: 0, w: 2, h: 2, isResizable: false },
    { i: 'standings', x: 2, y: 0, w: 2, h: 2, isResizable: false },

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
  lastPodium: boolean;
  fastestLap: boolean;
  favoriteDriver: boolean;
  favoriteTeam: boolean;
  headToHead: boolean;
  f1News: boolean;
}

function DashboardPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  // TODO: Sync this state with user preferences in Supabase
  const [widgetVisibility, setWidgetVisibility] = useState<WidgetVisibility>({
    nextRace: true,
    standings: true,
    lastPodium: true,
    fastestLap: true,
    favoriteDriver: true,
    favoriteTeam: true,
    headToHead: true,
    f1News: true,
  });

  // Layout state management
  const [layouts, setLayouts] = useState<Layouts>(initialLayouts);

  // Widget components map
  const widgetComponents: { [key: string]: React.ReactNode } = {
    nextRace: <NextRaceWidget />,
    standings: <StandingsWidget />,
    lastPodium: <LastPodiumWidget />,
    fastestLap: <FastestLapWidget />,
    favoriteDriver: <FavoriteDriverSnapshotWidget />,
    favoriteTeam: <FavoriteTeamSnapshotWidget />,
    headToHead: <HeadToHeadQuickCompareWidget />,
    f1News: <LatestF1NewsWidget />,
  };

  // Refined layout change handler for proper state management
  const handleLayoutChange = (_layout: any, allLayouts: Layouts) => {
    // console.log("Layout changed:", allLayouts); // Useful for debugging
    setLayouts(allLayouts);
  };

  return (
    <Box>
      <DashboardHeader onCustomizeClick={onOpen} />
      <Box p="lg">
        <ResponsiveGridLayout
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 4, md: 4, sm: 2, xs: 2, xxs: 1 }}
          rowHeight={120}
          onLayoutChange={handleLayoutChange}
          isDraggable={true}
          isResizable={false}
          preventCollision={false}
          isBounded={true}
          compactType={null}
          margin={[16, 16]}
          containerPadding={[0, 0]}
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
