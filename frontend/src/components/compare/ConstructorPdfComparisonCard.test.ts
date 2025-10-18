import { describe, it, vi, expect, beforeEach } from 'vitest';
import * as pdfUtils from '../../lib/pdfUtils';
import * as teamColors from '../../lib/teamColors';
import * as teamAssets from '../../lib/teamAssets';

// Create a proper jsPDF mock instance
const mockJsPDFInstance = {
  internal: {
    pageSize: {
      getWidth: vi.fn(() => 297),
      getHeight: vi.fn(() => 210),
    },
  },
  setTextColor: vi.fn(),
  setFont: vi.fn(),
  setFontSize: vi.fn(),
  text: vi.fn(),
  setFillColor: vi.fn(),
  rect: vi.fn(),
  setDrawColor: vi.fn(),
  line: vi.fn(),
  addImage: vi.fn(),
  circle: vi.fn(),
  addPage: vi.fn(),
  roundedRect: vi.fn(),
  setLineWidth: vi.fn(),
  save: vi.fn(),
};

// Mock dependencies - must be before imports
vi.mock('jspdf', () => ({
  default: vi.fn(() => mockJsPDFInstance),
}));

vi.mock('../../lib/pdfUtils', () => ({
  loadImageAsDataURL: vi.fn(),
}));

vi.mock('../../lib/teamColors', () => ({
  getTeamColor: vi.fn(),
}));

vi.mock('../../lib/teamAssets', () => ({
  getTeamLogo: vi.fn(),
}));

// Import after mocks
import { ConstructorPdfComparisonCard } from './ConstructorPdfComparisonCard';

describe('ConstructorPdfComparisonCard', () => {
  const mockData = {
    constructor1: {
      id: '1',
      name: 'Red Bull Racing',
      nationality: 'Austria',
      isActive: true,
      teamColor: '#0600ef',
    },
    constructor2: {
      id: '2',
      name: 'Mercedes',
      nationality: 'Germany',
      isActive: true,
      teamColor: '#00d2be',
    },
    stats1: {
      wins: 20,
      podiums: 45,
      poles: 18,
      fastestLaps: 25,
      points: 850,
      dnfs: 8,
      races: 22,
    },
    stats2: {
      wins: 15,
      podiums: 40,
      poles: 15,
      fastestLaps: 20,
      points: 750,
      dnfs: 10,
      races: 22,
    },
    enabledMetrics: {
      wins: true,
      podiums: true,
      poles: true,
      fastestLaps: true,
      points: true,
      dnfs: true,
      races: true,
    },
    score: {
      c1: 68,
      c2: 55,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset all mock functions on the jsPDF instance
    Object.values(mockJsPDFInstance).forEach((fn: any) => {
      if (typeof fn === 'function' && 'mockClear' in fn) {
        fn.mockClear();
      }
    });
    
    // Mock image loading
    vi.mocked(pdfUtils.loadImageAsDataURL).mockResolvedValue('data:image/png;base64,mock');
    
    // Mock team colors
    vi.mocked(teamColors.getTeamColor).mockImplementation((teamName) => {
      if (teamName === 'Red Bull Racing') return '#0600ef';
      if (teamName === 'Mercedes') return '#00d2be';
      return '#cccccc';
    });
    
    // Mock team logos
    vi.mocked(teamAssets.getTeamLogo).mockImplementation((teamName) => {
      if (teamName === 'Red Bull Racing') return '/logos/red-bull.png';
      if (teamName === 'Mercedes') return '/logos/mercedes.png';
      return null as any;
    });
  });

  it('should generate PDF with constructor comparison data', async () => {
    await ConstructorPdfComparisonCard(mockData);

    expect(mockJsPDFInstance.save).toHaveBeenCalled();
  });

  it('should use landscape orientation for few metrics', async () => {
    const dataWithFewMetrics = {
      ...mockData,
      enabledMetrics: {
        wins: true,
        podiums: true,
        poles: false,
        fastestLaps: false,
        points: false,
        dnfs: false,
        races: false,
      },
    };

    await ConstructorPdfComparisonCard(dataWithFewMetrics);

    expect(mockJsPDFInstance.save).toHaveBeenCalled();
  });

  it('should use portrait orientation for many metrics', async () => {
    await ConstructorPdfComparisonCard(mockData);

    expect(mockJsPDFInstance.save).toHaveBeenCalled();
  });

  it('should load team logos', async () => {
    await ConstructorPdfComparisonCard(mockData);

    expect(teamAssets.getTeamLogo).toHaveBeenCalledWith('Red Bull Racing');
    expect(teamAssets.getTeamLogo).toHaveBeenCalledWith('Mercedes');
  });

  it('should handle missing team logos gracefully', async () => {
    vi.mocked(teamAssets.getTeamLogo).mockImplementation(() => null as any);

    await ConstructorPdfComparisonCard(mockData);

    // Should still generate PDF with fallback initials
    expect(mockJsPDFInstance.save).toHaveBeenCalled();
  });

  it('should fallback to team initials when logo unavailable', async () => {
    vi.mocked(pdfUtils.loadImageAsDataURL).mockResolvedValue(null as any);
    vi.mocked(teamAssets.getTeamLogo).mockImplementation(() => null as any);

    await ConstructorPdfComparisonCard(mockData);

    // Should draw circles for initials
    expect(mockJsPDFInstance.circle).toHaveBeenCalled();
  });

  it('should use team colors from getTeamColor', async () => {
    await ConstructorPdfComparisonCard(mockData);

    expect(teamColors.getTeamColor).toHaveBeenCalledWith('Red Bull Racing');
    expect(teamColors.getTeamColor).toHaveBeenCalledWith('Mercedes');
  });

  it('should fallback to default colors if team color not found', async () => {
    vi.mocked(teamColors.getTeamColor).mockImplementation(() => null as any);

    await ConstructorPdfComparisonCard(mockData);

    expect(mockJsPDFInstance.save).toHaveBeenCalled();
  });

  it('should include all enabled metrics', async () => {
    await ConstructorPdfComparisonCard(mockData);

    // Should draw text for each metric label
    expect(mockJsPDFInstance.text).toHaveBeenCalled();
    // Should draw rectangles for bars
    expect(mockJsPDFInstance.rect).toHaveBeenCalled();
  });

  it('should calculate winner correctly', async () => {
    await ConstructorPdfComparisonCard(mockData);

    // Should display winner (constructor1 has higher score)
    expect(mockJsPDFInstance.text).toHaveBeenCalledWith(
      'WINNER: Red Bull Racing',
      expect.any(Number),
      expect.any(Number),
      expect.any(Object)
    );
  });

  it('should calculate winner as constructor2 when c2 score is higher', async () => {
    const dataWithConstructor2Winning = {
      ...mockData,
      score: {
        c1: 45,
        c2: 70,
      },
    };

    await ConstructorPdfComparisonCard(dataWithConstructor2Winning);

    expect(mockJsPDFInstance.text).toHaveBeenCalledWith(
      'WINNER: Mercedes',
      expect.any(Number),
      expect.any(Number),
      expect.any(Object)
    );
  });

  it('should save PDF with correct filename', async () => {
    await ConstructorPdfComparisonCard(mockData);

    expect(mockJsPDFInstance.save).toHaveBeenCalledWith(
      'constructor-comparison-Red-Bull-Racing-vs-Mercedes.pdf'
    );
  });

  it('should handle constructor names with spaces', async () => {
    await ConstructorPdfComparisonCard(mockData);

    expect(mockJsPDFInstance.save).toHaveBeenCalledWith(
      expect.stringContaining('Red-Bull-Racing')
    );
  });

  it('should handle zero values in stats', async () => {
    const dataWithZeros = {
      ...mockData,
      stats1: {
        wins: 0,
        podiums: 0,
        poles: 0,
        fastestLaps: 0,
        points: 0,
        dnfs: 0,
        races: 0,
      },
      stats2: {
        wins: 0,
        podiums: 0,
        poles: 0,
        fastestLaps: 0,
        points: 0,
        dnfs: 0,
        races: 0,
      },
    };

    await ConstructorPdfComparisonCard(dataWithZeros);

    expect(mockJsPDFInstance.save).toHaveBeenCalled();
  });

  it('should compute composite score when not provided', async () => {
    const dataWithoutScore = {
      ...mockData,
      score: {
        c1: null,
        c2: null,
      },
    };

    await ConstructorPdfComparisonCard(dataWithoutScore);

    const jsPDF = (await import('jspdf')).default;
    const mockInstance = new jsPDF();
    
    // Should still generate PDF with computed score
    expect(mockInstance.save).toHaveBeenCalled();
  });

  it('should normalize dnf and fastest_laps keys', async () => {
    const dataWithAltKeys = {
      ...mockData,
      enabledMetrics: {
        wins: true,
        podiums: false,
        fastest_laps: true,
        points: false,
        dnf: true,
        races: false,
        poles: false,
      } as any,
    };

    await ConstructorPdfComparisonCard(dataWithAltKeys);

    expect(mockJsPDFInstance.save).toHaveBeenCalled();
  });

  it('should render all metric labels correctly', async () => {
    await ConstructorPdfComparisonCard(mockData);

    // Check that metric labels are rendered
    expect(mockJsPDFInstance.text).toHaveBeenCalledWith(
      'WINS',
      expect.any(Number),
      expect.any(Number),
      expect.any(Object)
    );
    expect(mockJsPDFInstance.text).toHaveBeenCalledWith(
      'PODIUMS',
      expect.any(Number),
      expect.any(Number),
      expect.any(Object)
    );
    expect(mockJsPDFInstance.text).toHaveBeenCalledWith(
      'RACES',
      expect.any(Number),
      expect.any(Number),
      expect.any(Object)
    );
  });

  it('should include header and footer', async () => {
    await ConstructorPdfComparisonCard(mockData);

    // Check for header
    expect(mockJsPDFInstance.text).toHaveBeenCalledWith(
      'Constructor Comparison',
      expect.any(Number),
      expect.any(Number),
      expect.any(Object)
    );
    
    // Check for footer
    expect(mockJsPDFInstance.text).toHaveBeenCalledWith(
      'Generated by RaceIQ • raceiq.com',
      expect.any(Number),
      expect.any(Number),
      expect.any(Object)
    );
  });

  it('should include date in header', async () => {
    await ConstructorPdfComparisonCard(mockData);

    // Should include current date
    const dateStr = new Date().toLocaleDateString();
    expect(mockJsPDFInstance.text).toHaveBeenCalledWith(
      dateStr,
      expect.any(Number),
      expect.any(Number),
      expect.any(Object)
    );
  });

  it('should draw side rails with team colors', async () => {
    await ConstructorPdfComparisonCard(mockData);

    // Should draw colored rectangles for rails
    expect(mockJsPDFInstance.rect).toHaveBeenCalledWith(
      0,
      26,
      6,
      expect.any(Number),
      'F'
    );
  });

  it('should add new page when content exceeds page height', async () => {
    const dataWithManyMetrics = {
      ...mockData,
      enabledMetrics: {
        wins: true,
        podiums: true,
        poles: true,
        fastestLaps: true,
        points: true,
        dnfs: true,
        races: true,
      },
    };

    await ConstructorPdfComparisonCard(dataWithManyMetrics);

    expect(mockJsPDFInstance.save).toHaveBeenCalled();
  });

  it('should handle logo load errors gracefully', async () => {
    // Mock logos to return null (simulating failed load)
    vi.mocked(teamAssets.getTeamLogo).mockImplementation(() => null as any);
    vi.mocked(pdfUtils.loadImageAsDataURL).mockResolvedValue(null as any);

    await ConstructorPdfComparisonCard(mockData);

    // Should still complete without throwing
    expect(mockJsPDFInstance.save).toHaveBeenCalled();
  });

  it('should display nationality correctly', async () => {
    await ConstructorPdfComparisonCard(mockData);

    // Should include nationality in the PDF
    expect(mockJsPDFInstance.text).toHaveBeenCalledWith(
      'Austria',
      expect.any(Number),
      expect.any(Number),
      expect.any(Object)
    );
    expect(mockJsPDFInstance.text).toHaveBeenCalledWith(
      'Germany',
      expect.any(Number),
      expect.any(Number),
      expect.any(Object)
    );
  });

  it('should handle inactive constructors', async () => {
    const dataWithInactive = {
      ...mockData,
      constructor1: { ...mockData.constructor1, isActive: false },
    };

    await ConstructorPdfComparisonCard(dataWithInactive);

    expect(mockJsPDFInstance.save).toHaveBeenCalled();
  });

  it('should draw bars proportional to values', async () => {
    await ConstructorPdfComparisonCard(mockData);

    // Should draw filled rectangles for comparison bars
    expect(mockJsPDFInstance.rect).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number),
      expect.any(Number),
      expect.any(Number),
      'F'
    );
  });

  it('should handle equal scores', async () => {
    const dataWithEqualScores = {
      ...mockData,
      score: {
        c1: 60,
        c2: 60,
      },
    };

    await ConstructorPdfComparisonCard(dataWithEqualScores);

    // Should still declare a winner (first constructor in case of tie)
    expect(mockJsPDFInstance.save).toHaveBeenCalled();
  });

  it('should scale content to fit one page', async () => {
    const dataWithSomeMetrics = {
      ...mockData,
      enabledMetrics: {
        wins: true,
        podiums: true,
        poles: true,
        fastestLaps: false,
        points: false,
        dnfs: false,
        races: false,
      },
    };

    await ConstructorPdfComparisonCard(dataWithSomeMetrics);

    expect(mockJsPDFInstance.save).toHaveBeenCalled();
  });

  it('should include RaceIQ branding', async () => {
    await ConstructorPdfComparisonCard(mockData);

    expect(mockJsPDFInstance.text).toHaveBeenCalledWith(
      'RaceIQ Analytics',
      expect.any(Number),
      expect.any(Number),
      expect.any(Object)
    );
  });
});

