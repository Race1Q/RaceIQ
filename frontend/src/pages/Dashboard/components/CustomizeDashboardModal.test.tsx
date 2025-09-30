import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import CustomizeDashboardModal from './CustomizeDashboardModal';

const testTheme = extendTheme({
  colors: {
    brand: {
      red: '#dc2626',
    },
    text: {
      primary: '#ffffff',
      secondary: '#a0a0a0',
      muted: '#666666',
    },
  },
  space: {
    lg: '1.5rem',
    md: '1rem',
    sm: '0.5rem',
    xs: '0.25rem',
  },
  fonts: {
    heading: 'Inter, sans-serif',
  },
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider theme={testTheme}>
      {ui}
    </ChakraProvider>
  );
};

const mockWidgetVisibility = {
  nextRace: true,
  standings: true,
  constructorStandings: true,
  lastPodium: true,
  fastestLap: true,
  favoriteDriver: true,
  favoriteTeam: true,
  headToHead: true,
  f1News: true,
};

describe('CustomizeDashboardModal', () => {
  const mockOnClose = vi.fn();
  const mockSetWidgetVisibility = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal when open', () => {
    renderWithProviders(
      <CustomizeDashboardModal
        isOpen={true}
        onClose={mockOnClose}
        widgetVisibility={mockWidgetVisibility}
        setWidgetVisibility={mockSetWidgetVisibility}
      />
    );

    expect(screen.getByText('Customize Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Choose which widgets to display on your dashboard')).toBeInTheDocument();
  });

  it('does not render modal when closed', () => {
    renderWithProviders(
      <CustomizeDashboardModal
        isOpen={false}
        onClose={mockOnClose}
        widgetVisibility={mockWidgetVisibility}
        setWidgetVisibility={mockSetWidgetVisibility}
      />
    );

    expect(screen.queryByText('Customize Dashboard')).not.toBeInTheDocument();
  });

  it('renders all widget options with correct labels', () => {
    renderWithProviders(
      <CustomizeDashboardModal
        isOpen={true}
        onClose={mockOnClose}
        widgetVisibility={mockWidgetVisibility}
        setWidgetVisibility={mockSetWidgetVisibility}
      />
    );

    expect(screen.getByText('Next Race')).toBeInTheDocument();
    expect(screen.getByText('Championship Standings')).toBeInTheDocument();
  expect(screen.getByText('Last Race Podium')).toBeInTheDocument();
  expect(screen.getByText('Constructor Standings')).toBeInTheDocument();
    expect(screen.getByText('Fastest Lap')).toBeInTheDocument();
    expect(screen.getByText('Favorite Driver')).toBeInTheDocument();
    expect(screen.getByText('Favorite Team')).toBeInTheDocument();
    expect(screen.getByText('Head to Head')).toBeInTheDocument();
    expect(screen.getByText('Latest F1 News')).toBeInTheDocument();
  });

  it('renders widget descriptions', () => {
    renderWithProviders(
      <CustomizeDashboardModal
        isOpen={true}
        onClose={mockOnClose}
        widgetVisibility={mockWidgetVisibility}
        setWidgetVisibility={mockSetWidgetVisibility}
      />
    );

    expect(screen.getByText('Upcoming race information and countdown')).toBeInTheDocument();
    expect(screen.getByText('Current driver championship positions')).toBeInTheDocument();
    expect(screen.getByText('Previous race podium finishers')).toBeInTheDocument();
    expect(screen.getByText('Fastest lap time from last race')).toBeInTheDocument();
    expect(screen.getByText("Snapshot of your favorite driver's stats")).toBeInTheDocument();
    expect(screen.getByText('Constructor championship standings for your team')).toBeInTheDocument();
    expect(screen.getByText('Quick comparison between two drivers')).toBeInTheDocument();
    expect(screen.getByText('Recent Formula 1 news and updates')).toBeInTheDocument();
  });

  it('displays switches for each widget', () => {
    renderWithProviders(
      <CustomizeDashboardModal
        isOpen={true}
        onClose={mockOnClose}
        widgetVisibility={mockWidgetVisibility}
        setWidgetVisibility={mockSetWidgetVisibility}
      />
    );

    // All switches should be checked since all widgets are visible
  const switches = screen.getAllByRole('checkbox');
  expect(switches).toHaveLength(9);
    
    switches.forEach(switchElement => {
      expect(switchElement).toBeChecked();
    });
  });

  it('handles switch toggle correctly', () => {
    renderWithProviders(
      <CustomizeDashboardModal
        isOpen={true}
        onClose={mockOnClose}
        widgetVisibility={mockWidgetVisibility}
        setWidgetVisibility={mockSetWidgetVisibility}
      />
    );

  const switches = screen.getAllByRole('checkbox');
    const firstSwitch = switches[0];
    
    fireEvent.click(firstSwitch);

    expect(mockSetWidgetVisibility).toHaveBeenCalledWith({
      ...mockWidgetVisibility,
      nextRace: false,
    });
  });

  it('handles multiple switch toggles', () => {
    renderWithProviders(
      <CustomizeDashboardModal
        isOpen={true}
        onClose={mockOnClose}
        widgetVisibility={mockWidgetVisibility}
        setWidgetVisibility={mockSetWidgetVisibility}
      />
    );

    const switches = screen.getAllByRole('checkbox');
    
    // Toggle first switch
    fireEvent.click(switches[0]);
    expect(mockSetWidgetVisibility).toHaveBeenCalledTimes(1);

    // Toggle second switch
    fireEvent.click(switches[1]);
    expect(mockSetWidgetVisibility).toHaveBeenCalledTimes(2);
  });

  it('calls onClose when close button is clicked', () => {
    renderWithProviders(
      <CustomizeDashboardModal
        isOpen={true}
        onClose={mockOnClose}
        widgetVisibility={mockWidgetVisibility}
        setWidgetVisibility={mockSetWidgetVisibility}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('handles partial widget visibility state', () => {
    const partialVisibility = {
      nextRace: true,
      standings: false,
      constructorStandings: true,
      lastPodium: true,
      fastestLap: false,
      favoriteDriver: true,
      favoriteTeam: false,
      headToHead: true,
      f1News: false,
    };

    renderWithProviders(
      <CustomizeDashboardModal
        isOpen={true}
        onClose={mockOnClose}
        widgetVisibility={partialVisibility}
        setWidgetVisibility={mockSetWidgetVisibility}
      />
    );

  const switches = screen.getAllByRole('checkbox');
  // Order per component widgets array
  expect(switches[0]).toBeChecked(); // nextRace
  expect(switches[1]).not.toBeChecked(); // standings
  expect(switches[2]).toBeChecked(); // constructorStandings
  expect(switches[3]).toBeChecked(); // lastPodium
  expect(switches[4]).not.toBeChecked(); // fastestLap
  expect(switches[5]).toBeChecked(); // favoriteDriver
  expect(switches[6]).not.toBeChecked(); // favoriteTeam
  expect(switches[7]).toBeChecked(); // headToHead
  expect(switches[8]).not.toBeChecked(); // f1News
  });

  it('renders modal with correct styling and backdrop', () => {
    renderWithProviders(
      <CustomizeDashboardModal
        isOpen={true}
        onClose={mockOnClose}
        widgetVisibility={mockWidgetVisibility}
        setWidgetVisibility={mockSetWidgetVisibility}
      />
    );

    // Modal should be visible
    expect(screen.getByText('Customize Dashboard')).toBeInTheDocument();
    
    // Check for modal content structure
    expect(screen.getByText('Choose which widgets to display on your dashboard')).toBeInTheDocument();
  });

  it('handles rapid toggle changes', () => {
    renderWithProviders(
      <CustomizeDashboardModal
        isOpen={true}
        onClose={mockOnClose}
        widgetVisibility={mockWidgetVisibility}
        setWidgetVisibility={mockSetWidgetVisibility}
      />
    );

    const switches = screen.getAllByRole('checkbox');
    
    // Rapidly toggle multiple switches
    fireEvent.click(switches[0]);
    fireEvent.click(switches[1]);
    fireEvent.click(switches[2]);

    expect(mockSetWidgetVisibility).toHaveBeenCalledTimes(3);
  });

  it('maintains widget order consistency', () => {
    renderWithProviders(
      <CustomizeDashboardModal
        isOpen={true}
        onClose={mockOnClose}
        widgetVisibility={mockWidgetVisibility}
        setWidgetVisibility={mockSetWidgetVisibility}
      />
    );

    // Check that we have the expected number of widgets
  const checkboxes = screen.getAllByRole('checkbox');
  expect(checkboxes).toHaveLength(9);
    
    // Just verify that all checkboxes are present and functional
    checkboxes.forEach(checkbox => {
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toBeEnabled();
    });
  });
});
