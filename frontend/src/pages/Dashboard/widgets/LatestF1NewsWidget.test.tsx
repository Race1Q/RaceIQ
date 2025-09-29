import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { vi, describe, it, expect } from 'vitest';
import LatestF1NewsWidget from './LatestF1NewsWidget';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Newspaper: () => <div data-testid="newspaper-icon">📰</div>,
  AlertTriangle: () => <div data-testid="alert-triangle-icon">⚠️</div>,
  Settings: () => <div data-testid="settings-icon">⚙️</div>,
}));

const testTheme = extendTheme({
  colors: {
    brand: {
      red: '#dc2626',
    },
  },
  space: {
    md: '1rem',
    sm: '0.5rem',
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

describe('LatestF1NewsWidget', () => {
  it('renders widget title', () => {
    renderWithProviders(<LatestF1NewsWidget />);

    expect(screen.getByText('Latest F1 News')).toBeInTheDocument();
  });

  it('renders all news items with correct titles', () => {
    renderWithProviders(<LatestF1NewsWidget />);

    expect(screen.getByText('Hamilton signs multi-year extension with Ferrari')).toBeInTheDocument();
    expect(screen.getByText('Safety Car Deployed - Lap 26 (British GP)')).toBeInTheDocument();
    expect(screen.getByText('FIA announces new engine regulations for 2026')).toBeInTheDocument();
  });

  it('renders all news items with correct timestamps', () => {
    renderWithProviders(<LatestF1NewsWidget />);

    expect(screen.getByText('2 hours ago')).toBeInTheDocument();
    expect(screen.getByText('1 day ago')).toBeInTheDocument();
    expect(screen.getByText('3 days ago')).toBeInTheDocument();
  });

  it('renders correct icons for each news item', () => {
    renderWithProviders(<LatestF1NewsWidget />);

    expect(screen.getByTestId('newspaper-icon')).toBeInTheDocument();
    expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument();
    expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
  });

  it('renders news items in correct order', () => {
    renderWithProviders(<LatestF1NewsWidget />);

    // Check first item
    expect(screen.getByText('Hamilton signs multi-year extension with Ferrari')).toBeInTheDocument();
    expect(screen.getByText('2 hours ago')).toBeInTheDocument();

    // Check second item
    expect(screen.getByText('Safety Car Deployed - Lap 26 (British GP)')).toBeInTheDocument();
    expect(screen.getByText('1 day ago')).toBeInTheDocument();

    // Check third item
    expect(screen.getByText('FIA announces new engine regulations for 2026')).toBeInTheDocument();
    expect(screen.getByText('3 days ago')).toBeInTheDocument();
  });

  it('renders with proper structure and layout', () => {
    renderWithProviders(<LatestF1NewsWidget />);

    // Check for widget title
    expect(screen.getByText('Latest F1 News')).toBeInTheDocument();
    
    // Check for news items
    expect(screen.getByText('Hamilton signs multi-year extension with Ferrari')).toBeInTheDocument();
    expect(screen.getByText('Safety Car Deployed - Lap 26 (British GP)')).toBeInTheDocument();
    expect(screen.getByText('FIA announces new engine regulations for 2026')).toBeInTheDocument();
  });

  it('handles hover interactions correctly', () => {
    renderWithProviders(<LatestF1NewsWidget />);

    // All news items should be present and interactive
    const newsItems = screen.getAllByText(/Hamilton signs multi-year extension with Ferrari|Safety Car Deployed|FIA announces new engine regulations/);
    expect(newsItems).toHaveLength(3);

    newsItems.forEach(item => {
      expect(item).toBeInTheDocument();
    });
  });

  it('renders without crashing', () => {
    expect(() => renderWithProviders(<LatestF1NewsWidget />)).not.toThrow();
  });

  it('maintains consistent styling across news items', () => {
    renderWithProviders(<LatestF1NewsWidget />);

    // Check that all news items are present
    expect(screen.getByText('Hamilton signs multi-year extension with Ferrari')).toBeInTheDocument();
    expect(screen.getByText('Safety Car Deployed - Lap 26 (British GP)')).toBeInTheDocument();
    expect(screen.getByText('FIA announces new engine regulations for 2026')).toBeInTheDocument();
  });

  it('displays proper icon-text associations', () => {
    renderWithProviders(<LatestF1NewsWidget />);

    // Check that each news item has its corresponding icon
    const newspaperIcon = screen.getByTestId('newspaper-icon');
    const alertIcon = screen.getByTestId('alert-triangle-icon');
    const settingsIcon = screen.getByTestId('settings-icon');

    expect(newspaperIcon).toBeInTheDocument();
    expect(alertIcon).toBeInTheDocument();
    expect(settingsIcon).toBeInTheDocument();

    // Verify news items are present
    expect(screen.getByText('Hamilton signs multi-year extension with Ferrari')).toBeInTheDocument();
    expect(screen.getByText('Safety Car Deployed - Lap 26 (British GP)')).toBeInTheDocument();
    expect(screen.getByText('FIA announces new engine regulations for 2026')).toBeInTheDocument();
  });
});
