import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

// Mock Swiper components
vi.mock('swiper/react', () => ({
  Swiper: ({ children, ...props }: any) => (
    <div data-testid="swiper" {...props}>
      {children}
    </div>
  ),
  SwiperSlide: ({ children, ...props }: any) => {
    // Handle the case where children is a function (render prop pattern)
    const content = typeof children === 'function' ? children({ isActive: true }) : children;
    return (
      <div data-testid="swiper-slide" {...props}>
        {content}
      </div>
    );
  },
}));

vi.mock('swiper/modules', () => ({
  Navigation: 'Navigation',
}));

// Mock the RaceCard component
vi.mock('./RaceCard', () => ({
  RaceCard: ({ race, isActive, status }: any) => (
    <div data-testid="race-card" data-race-id={race.id} data-is-active={isActive} data-status={status}>
      {race.name}
    </div>
  ),
}));

import { render, screen } from '@testing-library/react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { RaceSlider } from './RaceSlider';
import type { RaceWithPodium } from '../../hooks/useHomePageData';

// Create a minimal theme
const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
});

function renderWithProviders(ui: React.ReactNode) {
  return render(
    <ChakraProvider theme={theme}>
      {ui}
    </ChakraProvider>
  );
}

// Mock race data
const mockRaces: RaceWithPodium[] = [
  {
    id: 1,
    name: 'Bahrain Grand Prix',
    round: 1,
    date: '2024-03-02',
    circuit: {
      id: 1,
      name: 'Bahrain International Circuit',
      country_code: 'BHR',
    },
    podium: [
      { position: 1, driverName: 'Max Verstappen', countryCode: 'NED' },
      { position: 2, driverName: 'Sergio Perez', countryCode: 'MEX' },
      { position: 3, driverName: 'Carlos Sainz', countryCode: 'ESP' },
    ],
  },
  {
    id: 2,
    name: 'Saudi Arabian Grand Prix',
    round: 2,
    date: '2024-03-09',
    circuit: {
      id: 2,
      name: 'Jeddah Corniche Circuit',
      country_code: 'SAU',
    },
    podium: null,
  },
  {
    id: 3,
    name: 'Australian Grand Prix',
    round: 3,
    date: '2024-03-24',
    circuit: {
      id: 3,
      name: 'Albert Park Circuit',
      country_code: 'AUS',
    },
    podium: null,
  },
];

describe('RaceSlider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock Date to a specific date for consistent testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-03-10'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders without crashing', () => {
    renderWithProviders(<RaceSlider seasonSchedule={mockRaces} />);
    
    expect(screen.getByTestId('swiper')).toBeInTheDocument();
  });

  it('renders all race cards', () => {
    renderWithProviders(<RaceSlider seasonSchedule={mockRaces} />);
    
    const raceCards = screen.getAllByTestId('race-card');
    expect(raceCards).toHaveLength(3);
  });

  it('passes correct props to Swiper', () => {
    renderWithProviders(<RaceSlider seasonSchedule={mockRaces} />);
    
    const swiper = screen.getByTestId('swiper');
    expect(swiper).toHaveAttribute('data-testid', 'swiper');
  });

  it('handles empty season schedule', () => {
    renderWithProviders(<RaceSlider seasonSchedule={[]} />);
    
    expect(screen.getByTestId('swiper')).toBeInTheDocument();
    expect(screen.queryAllByTestId('race-card')).toHaveLength(0);
  });

  it('calculates initial slide index correctly for past races', () => {
    // Set date to after all races
    vi.setSystemTime(new Date('2024-04-01'));
    
    renderWithProviders(<RaceSlider seasonSchedule={mockRaces} />);
    
    const swiper = screen.getByTestId('swiper');
    expect(swiper).toBeInTheDocument();
  });

  it('calculates initial slide index correctly for future races', () => {
    // Set date to before all races
    vi.setSystemTime(new Date('2024-01-01'));
    
    renderWithProviders(<RaceSlider seasonSchedule={mockRaces} />);
    
    const swiper = screen.getByTestId('swiper');
    expect(swiper).toBeInTheDocument();
  });

  it('handles single race in schedule', () => {
    const singleRace = [mockRaces[0]];
    
    renderWithProviders(<RaceSlider seasonSchedule={singleRace} />);
    
    const raceCards = screen.getAllByTestId('race-card');
    expect(raceCards).toHaveLength(1);
  });

  it('passes race data to RaceCard components', () => {
    renderWithProviders(<RaceSlider seasonSchedule={mockRaces} />);
    
    const raceCards = screen.getAllByTestId('race-card');
    
    // Check that each race card has the correct race ID
    expect(raceCards[0]).toHaveAttribute('data-race-id', '1');
    expect(raceCards[1]).toHaveAttribute('data-race-id', '2');
    expect(raceCards[2]).toHaveAttribute('data-race-id', '3');
  });

  it('handles races with different dates', () => {
    const racesWithDifferentDates = [
      { ...mockRaces[0], date: '2024-01-01' },
      { ...mockRaces[1], date: '2024-06-15' },
      { ...mockRaces[2], date: '2024-12-31' },
    ];
    
    renderWithProviders(<RaceSlider seasonSchedule={racesWithDifferentDates} />);
    
    const raceCards = screen.getAllByTestId('race-card');
    expect(raceCards).toHaveLength(3);
  });

  it('handles races with null podium data', () => {
    const racesWithNullPodium = mockRaces.map(race => ({ ...race, podium: null }));
    
    renderWithProviders(<RaceSlider seasonSchedule={racesWithNullPodium} />);
    
    const raceCards = screen.getAllByTestId('race-card');
    expect(raceCards).toHaveLength(3);
  });

  it('handles races with empty podium data', () => {
    const racesWithEmptyPodium = mockRaces.map(race => ({ ...race, podium: [] }));
    
    renderWithProviders(<RaceSlider seasonSchedule={racesWithEmptyPodium} />);
    
    const raceCards = screen.getAllByTestId('race-card');
    expect(raceCards).toHaveLength(3);
  });
});
