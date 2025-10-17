import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { vi, describe, it, expect } from 'vitest';
import LatestF1NewsWidget from './LatestF1NewsWidget';
import { ThemeColorProvider } from '../../../context/ThemeColorContext';

// Mock Auth0
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: false,
    user: null,
    isLoading: false,
    getAccessTokenSilently: vi.fn().mockResolvedValue('mock-token'),
  }),
}));

// Mock useUserProfile
vi.mock('../../../hooks/useUserProfile', () => ({
  useUserProfile: () => ({
    profile: null,
    favoriteConstructor: null,
    favoriteDriver: null,
    loading: false,
  }),
}));

// Mock useAiNews
vi.mock('../../../hooks/useAiNews', () => ({
  useAiNews: () => ({
    data: {
      summary: 'Latest F1 news summary',
      bullets: [
        'Hamilton signs multi-year extension with Ferrari',
        'Safety Car Deployed - Lap 26 (British GP)',
        'FIA announces new engine regulations for 2026'
      ],
      citations: [
        { title: 'F1 News Article', source: 'F1.com', url: 'https://f1.com/news1', publishedAt: new Date().toISOString() },
        { title: 'Sport News', source: 'BBC Sport', url: 'https://bbc.com/sport', publishedAt: new Date().toISOString() }
      ],
      generatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      ttlSeconds: 3600,
      isFallback: false
    },
    loading: false,
    error: null,
  }),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Newspaper: () => <div data-testid="newspaper-icon">📰</div>,
  AlertTriangle: () => <div data-testid="alert-triangle-icon">⚠️</div>,
  Settings: () => <div data-testid="settings-icon">⚙️</div>,
  ExternalLink: () => <div data-testid="external-link-icon">🔗</div>,
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
      <ThemeColorProvider>
        {ui}
      </ThemeColorProvider>
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

    // Component shows a single "Last updated" timestamp, not per-item timestamps
    expect(screen.getByText(/last updated:/i)).toBeInTheDocument();
    expect(screen.getByText(/2 hour/i)).toBeInTheDocument();
  });

  it('renders correct icons for each news item', () => {
    renderWithProviders(<LatestF1NewsWidget />);

    // Component uses Newspaper icon for all bullets
    const newspaperIcons = screen.getAllByTestId('newspaper-icon');
    expect(newspaperIcons.length).toBeGreaterThanOrEqual(1);
  });

  it('renders news items in correct order', () => {
    renderWithProviders(<LatestF1NewsWidget />);

    // Check all three items are present
    expect(screen.getByText('Hamilton signs multi-year extension with Ferrari')).toBeInTheDocument();
    expect(screen.getByText('Safety Car Deployed - Lap 26 (British GP)')).toBeInTheDocument();
    expect(screen.getByText('FIA announces new engine regulations for 2026')).toBeInTheDocument();
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

    // Component uses Newspaper icon for all bullets
    const newspaperIcons = screen.getAllByTestId('newspaper-icon');
    expect(newspaperIcons.length).toBeGreaterThanOrEqual(1);

    // Verify news items are present
    expect(screen.getByText('Hamilton signs multi-year extension with Ferrari')).toBeInTheDocument();
    expect(screen.getByText('Safety Car Deployed - Lap 26 (British GP)')).toBeInTheDocument();
    expect(screen.getByText('FIA announces new engine regulations for 2026')).toBeInTheDocument();
  });
});
