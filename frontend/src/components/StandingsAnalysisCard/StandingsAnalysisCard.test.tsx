import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import StandingsAnalysisCard from './StandingsAnalysisCard';
import { ThemeColorProvider } from '../../context/ThemeColorContext';

// Mock useAiStandingsAnalysis hook
vi.mock('../../hooks/useAiStandingsAnalysis', () => ({
  useAiStandingsAnalysis: vi.fn(),
}));

// Mock GeminiBadge
vi.mock('../GeminiBadge/GeminiBadge', () => ({
  default: () => <div data-testid="gemini-badge">AI Powered</div>,
}));

import { useAiStandingsAnalysis } from '../../hooks/useAiStandingsAnalysis';

const mockAnalysisData = {
  overview: 'The 2025 season shows intense competition between Red Bull and Ferrari.',
  keyInsights: [
    'Max Verstappen leads with dominant performances',
    'Ferrari has shown strong race pace',
    'Mercedes struggling with car development'
  ],
  driverAnalysis: {
    leader: 'Max Verstappen with 350 points',
    biggestRiser: 'Oscar Piastri climbing to P3',
    biggestFall: 'Lewis Hamilton dropping to P7',
    midfieldBattle: 'Intense battle between Alpine and Aston Martin'
  },
  constructorAnalysis: {
    leader: 'Red Bull Racing with 500 points',
    competition: 'Ferrari within 50 points of the lead',
    surprises: 'McLaren unexpectedly challenging for podiums'
  },
  trends: [
    'Red Bull dominance continuing',
    'Ferrari improving race strategy',
    'Mercedes falling behind'
  ],
  predictions: [
    'Verstappen likely to win championship',
    'Constructor battle going down to final races',
    'Midfield becoming more competitive'
  ],
  generatedAt: '2025-10-18T12:00:00Z',
  isFallback: false
};

// Mock ProfileUpdateContext
vi.mock('../../context/ProfileUpdateContext', () => ({
  ProfileUpdateProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useProfileUpdate: () => ({
    refreshTrigger: 0,
    triggerRefresh: vi.fn(),
  }),
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider>
      <ThemeColorProvider>
        {ui}
      </ThemeColorProvider>
    </ChakraProvider>
  );
};

describe('StandingsAnalysisCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    vi.mocked(useAiStandingsAnalysis).mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });

    renderWithProviders(<StandingsAnalysisCard season={2025} />);
    
    expect(screen.getByText('Championship Analysis')).toBeInTheDocument();
    expect(screen.getByText('Analyzing championship standings and trends...')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument(); // Spinner text
  });

  it('renders error state', () => {
    vi.mocked(useAiStandingsAnalysis).mockReturnValue({
      data: null,
      loading: false,
      error: new Error('Failed to fetch analysis'),
    });

    renderWithProviders(<StandingsAnalysisCard season={2025} />);
    
    expect(screen.getByText('Unable to load championship analysis. Please try again later.')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch analysis')).toBeInTheDocument();
  });

  it('renders analysis data successfully', () => {
    vi.mocked(useAiStandingsAnalysis).mockReturnValue({
      data: mockAnalysisData,
      loading: false,
      error: null,
    });

    renderWithProviders(<StandingsAnalysisCard season={2025} />);
    
    expect(screen.getByText('Championship Analysis')).toBeInTheDocument();
    expect(screen.getByText(mockAnalysisData.overview)).toBeInTheDocument();
  });

  it('displays key insights', () => {
    vi.mocked(useAiStandingsAnalysis).mockReturnValue({
      data: mockAnalysisData,
      loading: false,
      error: null,
    });

    renderWithProviders(<StandingsAnalysisCard season={2025} />);
    
    expect(screen.getByText('Key Insights')).toBeInTheDocument();
    mockAnalysisData.keyInsights.forEach(insight => {
      expect(screen.getByText(insight)).toBeInTheDocument();
    });
  });

  it('displays driver analysis', () => {
    vi.mocked(useAiStandingsAnalysis).mockReturnValue({
      data: mockAnalysisData,
      loading: false,
      error: null,
    });

    renderWithProviders(<StandingsAnalysisCard season={2025} />);
    
    expect(screen.getByText('Driver Championship Analysis')).toBeInTheDocument();
    expect(screen.getAllByText('Championship Leader:').length).toBeGreaterThan(0);
    expect(screen.getByText(mockAnalysisData.driverAnalysis.leader)).toBeInTheDocument();
    expect(screen.getByText('Biggest Riser:')).toBeInTheDocument();
    expect(screen.getByText(mockAnalysisData.driverAnalysis.biggestRiser)).toBeInTheDocument();
    expect(screen.getByText('Biggest Fall:')).toBeInTheDocument();
    expect(screen.getByText(mockAnalysisData.driverAnalysis.biggestFall)).toBeInTheDocument();
    expect(screen.getByText('Midfield Battle:')).toBeInTheDocument();
    expect(screen.getByText(mockAnalysisData.driverAnalysis.midfieldBattle)).toBeInTheDocument();
  });

  it('displays constructor analysis', () => {
    vi.mocked(useAiStandingsAnalysis).mockReturnValue({
      data: mockAnalysisData,
      loading: false,
      error: null,
    });

    renderWithProviders(<StandingsAnalysisCard season={2025} />);
    
    expect(screen.getByText('Constructor Championship Analysis')).toBeInTheDocument();
    expect(screen.getByText(mockAnalysisData.constructorAnalysis.leader)).toBeInTheDocument();
    expect(screen.getByText(mockAnalysisData.constructorAnalysis.competition)).toBeInTheDocument();
    expect(screen.getByText(mockAnalysisData.constructorAnalysis.surprises)).toBeInTheDocument();
  });

  it('displays trends', () => {
    vi.mocked(useAiStandingsAnalysis).mockReturnValue({
      data: mockAnalysisData,
      loading: false,
      error: null,
    });

    renderWithProviders(<StandingsAnalysisCard season={2025} />);
    
    expect(screen.getByText('Current Trends')).toBeInTheDocument();
    mockAnalysisData.trends.forEach(trend => {
      expect(screen.getByText(trend)).toBeInTheDocument();
    });
  });

  it('displays predictions', () => {
    vi.mocked(useAiStandingsAnalysis).mockReturnValue({
      data: mockAnalysisData,
      loading: false,
      error: null,
    });

    renderWithProviders(<StandingsAnalysisCard season={2025} />);
    
    expect(screen.getByText('Season Predictions')).toBeInTheDocument();
    mockAnalysisData.predictions.forEach(prediction => {
      expect(screen.getByText(prediction)).toBeInTheDocument();
    });
  });

  it('displays GeminiBadge when not fallback data', () => {
    vi.mocked(useAiStandingsAnalysis).mockReturnValue({
      data: mockAnalysisData,
      loading: false,
      error: null,
    });

    renderWithProviders(<StandingsAnalysisCard season={2025} />);
    
    expect(screen.getByTestId('gemini-badge')).toBeInTheDocument();
  });

  it('hides GeminiBadge when using fallback data', () => {
    vi.mocked(useAiStandingsAnalysis).mockReturnValue({
      data: { ...mockAnalysisData, isFallback: true },
      loading: false,
      error: null,
    });

    renderWithProviders(<StandingsAnalysisCard season={2025} />);
    
    expect(screen.queryByTestId('gemini-badge')).not.toBeInTheDocument();
    expect(screen.getByText('(Fallback Data)')).toBeInTheDocument();
  });

  it('formats generated date correctly', () => {
    vi.mocked(useAiStandingsAnalysis).mockReturnValue({
      data: mockAnalysisData,
      loading: false,
      error: null,
    });

    renderWithProviders(<StandingsAnalysisCard season={2025} />);
    
    // Check that date is formatted (exact format may vary by locale)
    expect(screen.getByText(/Generated/)).toBeInTheDocument();
    expect(screen.getByText(/2025 Season/)).toBeInTheDocument();
  });

  it('works without season prop', () => {
    vi.mocked(useAiStandingsAnalysis).mockReturnValue({
      data: mockAnalysisData,
      loading: false,
      error: null,
    });

    renderWithProviders(<StandingsAnalysisCard />);
    
    expect(screen.getByText('Championship Analysis')).toBeInTheDocument();
    expect(screen.getByText(mockAnalysisData.overview)).toBeInTheDocument();
  });

  it('handles missing optional fields gracefully', () => {
    const minimalData = {
      overview: 'Minimal analysis',
      generatedAt: '2025-10-18T12:00:00Z',
      isFallback: false
    };

    vi.mocked(useAiStandingsAnalysis).mockReturnValue({
      data: minimalData,
      loading: false,
      error: null,
    });

    renderWithProviders(<StandingsAnalysisCard season={2025} />);
    
    expect(screen.getByText('Championship Analysis')).toBeInTheDocument();
    expect(screen.getByText('Minimal analysis')).toBeInTheDocument();
    expect(screen.queryByText('Key Insights')).not.toBeInTheDocument();
    expect(screen.queryByText('Current Trends')).not.toBeInTheDocument();
  });

  it('handles empty arrays gracefully', () => {
    const dataWithEmptyArrays = {
      ...mockAnalysisData,
      keyInsights: [],
      trends: [],
      predictions: []
    };

    vi.mocked(useAiStandingsAnalysis).mockReturnValue({
      data: dataWithEmptyArrays,
      loading: false,
      error: null,
    });

    renderWithProviders(<StandingsAnalysisCard season={2025} />);
    
    expect(screen.getByText(mockAnalysisData.overview)).toBeInTheDocument();
    expect(screen.queryByText('Key Insights')).not.toBeInTheDocument();
    expect(screen.queryByText('Current Trends')).not.toBeInTheDocument();
    expect(screen.queryByText('Season Predictions')).not.toBeInTheDocument();
  });

  it('displays all sections when data is complete', () => {
    vi.mocked(useAiStandingsAnalysis).mockReturnValue({
      data: mockAnalysisData,
      loading: false,
      error: null,
    });

    renderWithProviders(<StandingsAnalysisCard season={2025} />);
    
    expect(screen.getByText('Championship Analysis')).toBeInTheDocument();
    expect(screen.getByText('Key Insights')).toBeInTheDocument();
    expect(screen.getByText('Driver Championship Analysis')).toBeInTheDocument();
    expect(screen.getByText('Constructor Championship Analysis')).toBeInTheDocument();
    expect(screen.getByText('Current Trends')).toBeInTheDocument();
    expect(screen.getByText('Season Predictions')).toBeInTheDocument();
  });
});

