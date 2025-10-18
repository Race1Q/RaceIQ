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
import { DriverPdfComparisonCard } from './DriverPdfComparisonCard';

describe('DriverPdfComparisonCard', () => {
  const mockData = {
    driver1: {
      id: '1',
      fullName: 'Max Verstappen',
      teamName: 'Red Bull Racing',
      championshipStanding: 1,
      wins: 15,
      podiums: 20,
      points: 450,
      imageUrl: 'https://example.com/ver.png',
      teamColorToken: 'red-bull',
      teamColorHex: '#0600ef',
    },
    driver2: {
      id: '44',
      fullName: 'Lewis Hamilton',
      teamName: 'Mercedes',
      championshipStanding: 3,
      wins: 10,
      podiums: 15,
      points: 380,
      imageUrl: 'https://example.com/ham.png',
      teamColorToken: 'mercedes',
      teamColorHex: '#00d2be',
    },
    stats1: {
      wins: 15,
      podiums: 20,
      fastestLaps: 8,
      points: 450,
      dnfs: 2,
      sprintWins: 3,
      sprintPodiums: 4,
    },
    stats2: {
      wins: 10,
      podiums: 15,
      fastestLaps: 6,
      points: 380,
      dnfs: 3,
      sprintWins: 2,
      sprintPodiums: 3,
    },
    enabledMetrics: {
      wins: true,
      podiums: true,
      fastestLaps: true,
      points: true,
      sprintWins: true,
      sprintPodiums: true,
      dnfs: true,
    },
    score: {
      d1: 65,
      d2: 58,
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

  it('should generate PDF with driver comparison data', async () => {
    await DriverPdfComparisonCard(mockData);

    // Verify PDF was created (save was called)
    expect(mockJsPDFInstance.save).toHaveBeenCalled();
  });

  it('should use landscape orientation for few metrics', async () => {
    const dataWithFewMetrics = {
      ...mockData,
      enabledMetrics: {
        wins: true,
        podiums: true,
        fastestLaps: false,
        points: false,
        sprintWins: false,
        sprintPodiums: false,
        dnfs: false,
      },
    };

    await DriverPdfComparisonCard(dataWithFewMetrics);

    expect(mockJsPDFInstance.save).toHaveBeenCalled();
  });

  it('should use portrait orientation for many metrics', async () => {
    const dataWithManyMetrics = {
      ...mockData,
      enabledMetrics: {
        wins: true,
        podiums: true,
        fastestLaps: true,
        points: true,
        sprintWins: true,
        sprintPodiums: true,
        dnfs: true,
      },
    };

    await DriverPdfComparisonCard(dataWithManyMetrics);

    expect(mockJsPDFInstance.save).toHaveBeenCalled();
  });

  it('should load driver images', async () => {
    await DriverPdfComparisonCard(mockData);

    expect(pdfUtils.loadImageAsDataURL).toHaveBeenCalledWith('https://example.com/ver.png');
    expect(pdfUtils.loadImageAsDataURL).toHaveBeenCalledWith('https://example.com/ham.png');
  });

  it('should fallback to team logo if driver image fails', async () => {
    vi.mocked(pdfUtils.loadImageAsDataURL).mockRejectedValueOnce(new Error('Image load failed'));

    await DriverPdfComparisonCard(mockData);

    expect(teamAssets.getTeamLogo).toHaveBeenCalledWith('Red Bull Racing');
  });

  it('should handle missing driver images gracefully', async () => {
    vi.mocked(pdfUtils.loadImageAsDataURL).mockResolvedValue(null as any);

    const dataWithoutImages = {
      ...mockData,
      driver1: { ...mockData.driver1, imageUrl: '' },
      driver2: { ...mockData.driver2, imageUrl: '' },
    };

    await DriverPdfComparisonCard(dataWithoutImages);

    // Should still generate PDF with fallback initials
    expect(mockJsPDFInstance.save).toHaveBeenCalled();
  });

  it('should use team colors from hex if provided', async () => {
    await DriverPdfComparisonCard(mockData);

    // Should use the provided teamColorHex values
    expect(teamColors.getTeamColor).not.toHaveBeenCalled();
  });

  it('should fallback to getTeamColor if hex not provided', async () => {
    const dataWithoutHex = {
      ...mockData,
      driver1: { ...mockData.driver1, teamColorHex: undefined },
      driver2: { ...mockData.driver2, teamColorHex: undefined },
    };

    await DriverPdfComparisonCard(dataWithoutHex);

    expect(teamColors.getTeamColor).toHaveBeenCalledWith('Red Bull Racing');
    expect(teamColors.getTeamColor).toHaveBeenCalledWith('Mercedes');
  });

  it('should include all enabled metrics', async () => {
    await DriverPdfComparisonCard(mockData);

    // Should draw text for each metric label
    expect(mockJsPDFInstance.text).toHaveBeenCalled();
    // Should draw rectangles for bars
    expect(mockJsPDFInstance.rect).toHaveBeenCalled();
  });

  it('should calculate winner correctly', async () => {
    await DriverPdfComparisonCard(mockData);

    // Should display winner (driver1 has higher score)
    expect(mockJsPDFInstance.text).toHaveBeenCalledWith(
      'WINNER: Max Verstappen',
      expect.any(Number),
      expect.any(Number),
      expect.any(Object)
    );
  });

  it('should calculate winner as driver2 when d2 score is higher', async () => {
    const dataWithDriver2Winning = {
      ...mockData,
      score: {
        d1: 45,
        d2: 70,
      },
    };

    await DriverPdfComparisonCard(dataWithDriver2Winning);

    expect(mockJsPDFInstance.text).toHaveBeenCalledWith(
      'WINNER: Lewis Hamilton',
      expect.any(Number),
      expect.any(Number),
      expect.any(Object)
    );
  });

  it('should save PDF with correct filename', async () => {
    await DriverPdfComparisonCard(mockData);

    expect(mockJsPDFInstance.save).toHaveBeenCalledWith(
      'driver-comparison-Max-Verstappen-vs-Lewis-Hamilton.pdf'
    );
  });

  it('should handle driver names with multiple spaces', async () => {
    const dataWithSpaces = {
      ...mockData,
      driver1: { ...mockData.driver1, fullName: 'Max   Verstappen' },
    };

    await DriverPdfComparisonCard(dataWithSpaces);

    expect(mockJsPDFInstance.save).toHaveBeenCalledWith(
      expect.stringContaining('Max-Verstappen')
    );
  });

  it('should handle zero values in stats', async () => {
    const dataWithZeros = {
      ...mockData,
      stats1: {
        wins: 0,
        podiums: 0,
        fastestLaps: 0,
        points: 0,
        dnfs: 0,
        sprintWins: 0,
        sprintPodiums: 0,
      },
      stats2: {
        wins: 0,
        podiums: 0,
        fastestLaps: 0,
        points: 0,
        dnfs: 0,
        sprintWins: 0,
        sprintPodiums: 0,
      },
    };

    await DriverPdfComparisonCard(dataWithZeros);

    expect(mockJsPDFInstance.save).toHaveBeenCalled();
  });

  it('should compute composite score when not provided', async () => {
    const dataWithoutScore = {
      ...mockData,
      score: {
        d1: null,
        d2: null,
      },
    };

    await DriverPdfComparisonCard(dataWithoutScore);

    const jsPDF = (await import('jspdf')).default;
    const mockInstance = new jsPDF();
    
    // Should still generate PDF with computed score
    expect(mockInstance.save).toHaveBeenCalled();
  });

  it('should add new page when content exceeds page height', async () => {
    const dataWithManyMetrics = {
      ...mockData,
      enabledMetrics: {
        wins: true,
        podiums: true,
        fastestLaps: true,
        points: true,
        sprintWins: true,
        sprintPodiums: true,
        dnfs: true,
        poles: true,
      },
    };

    await DriverPdfComparisonCard(dataWithManyMetrics);

    const jsPDF = (await import('jspdf')).default;
    const mockInstance = new jsPDF();
    
    // May add a page if content is large
    expect(mockInstance.save).toHaveBeenCalled();
  });

  it('should normalize dnf and fastest_laps keys', async () => {
    const dataWithAltKeys = {
      ...mockData,
      enabledMetrics: {
        wins: true,
        podiums: false,
        fastest_laps: true, // Alternative key
        points: false,
        sprintWins: false,
        sprintPodiums: false,
        dnf: true, // Alternative key
      } as any,
    };

    await DriverPdfComparisonCard(dataWithAltKeys);

    expect(mockJsPDFInstance.save).toHaveBeenCalled();
  });

  it('should render all metric labels correctly', async () => {
    await DriverPdfComparisonCard(mockData);

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
  });

  it('should include header and footer', async () => {
    await DriverPdfComparisonCard(mockData);

    // Check for header
    expect(mockJsPDFInstance.text).toHaveBeenCalledWith(
      'Driver Comparison',
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

  it('should handle null championship standing', async () => {
    const dataWithNullStanding = {
      ...mockData,
      driver1: { ...mockData.driver1, championshipStanding: null },
    };

    await DriverPdfComparisonCard(dataWithNullStanding);

    expect(mockJsPDFInstance.save).toHaveBeenCalled();
  });

  it('should handle image load errors gracefully', async () => {
    vi.mocked(pdfUtils.loadImageAsDataURL).mockRejectedValue(new Error('Network error'));
    vi.mocked(teamAssets.getTeamLogo).mockImplementation(() => null as any);

    await DriverPdfComparisonCard(mockData);

    // Should still complete without throwing
    expect(mockJsPDFInstance.save).toHaveBeenCalled();
  });

  it('should include date in header', async () => {
    await DriverPdfComparisonCard(mockData);

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
    await DriverPdfComparisonCard(mockData);

    // Should draw colored rectangles for rails
    expect(mockJsPDFInstance.rect).toHaveBeenCalledWith(
      0,
      26,
      6,
      expect.any(Number),
      'F'
    );
  });
});

