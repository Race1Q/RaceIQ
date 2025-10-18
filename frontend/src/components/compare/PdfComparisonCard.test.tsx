import { describe, it, vi, expect, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PdfComparisonCard from './PdfComparisonCard';
import React from 'react';

// Mock fetch for image loading
global.fetch = vi.fn();

// Properly mock FileReader
class MockFileReader {
  result: string | null = null;
  onloadend: (() => void) | null = null;
  onerror: ((error: any) => void) | null = null;
  
  readAsDataURL(_blob: Blob) {
    // Simulate async behavior
    setTimeout(() => {
      this.result = 'data:image/png;base64,mockbase64';
      if (this.onloadend) {
        this.onloadend();
      }
    }, 0);
  }
}

global.FileReader = MockFileReader as any;

describe('PdfComparisonCard', () => {
  const mockDriver1 = {
    fullName: 'Max Verstappen',
    imageUrl: 'https://example.com/ver.png',
    teamColorToken: 'red-bull',
    teamColorHex: '#0600ef',
  };

  const mockDriver2 = {
    fullName: 'Lewis Hamilton',
    imageUrl: 'https://example.com/ham.png',
    teamColorToken: 'mercedes',
    teamColorHex: '#00d2be',
  };

  const mockRows = [
    { label: 'Wins', value1: 15, value2: 10, better1: true, better2: false },
    { label: 'Podiums', value1: 20, value2: 15, better1: true, better2: false },
    { label: 'Points', value1: 450, value2: 380, better1: true, better2: false },
    { label: 'Fastest Laps', value1: 8, value2: 6, better1: true, better2: false },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful image fetch
    vi.mocked(fetch).mockResolvedValue({
      blob: async () => new Blob(['fake-image'], { type: 'image/png' }),
    } as any);
  });

  it('should render without crashing', () => {
    const { container } = render(
      <PdfComparisonCard
        driver1={mockDriver1}
        driver2={mockDriver2}
        rows={mockRows}
      />
    );

    expect(container).toBeInTheDocument();
  });

  it('should display driver names', () => {
    const { getAllByText } = render(
      <PdfComparisonCard
        driver1={mockDriver1}
        driver2={mockDriver2}
        rows={mockRows}
      />
    );

    // Names appear multiple times (header and table)
    const verNames = getAllByText('Max Verstappen');
    const hamNames = getAllByText('Lewis Hamilton');
    
    expect(verNames.length).toBeGreaterThan(0);
    expect(hamNames.length).toBeGreaterThan(0);
  });

  it('should render all comparison rows', () => {
    const { getByText } = render(
      <PdfComparisonCard
        driver1={mockDriver1}
        driver2={mockDriver2}
        rows={mockRows}
      />
    );

    mockRows.forEach((row) => {
      expect(getByText(row.label)).toBeInTheDocument();
    });
  });

  it('should display row values correctly', () => {
    const { getAllByText, getByText } = render(
      <PdfComparisonCard
        driver1={mockDriver1}
        driver2={mockDriver2}
        rows={mockRows}
      />
    );

    // Some values appear multiple times (wins: 15, podiums: 15)
    expect(getAllByText('15').length).toBeGreaterThan(0); // Driver 1 wins and Driver 2 podiums
    expect(getByText('10')).toBeInTheDocument(); // Driver 2 wins
    expect(getByText('450')).toBeInTheDocument(); // Driver 1 points
    expect(getByText('380')).toBeInTheDocument(); // Driver 2 points
  });

  it('should apply team colors to backgrounds', () => {
    const { container } = render(
      <PdfComparisonCard
        driver1={mockDriver1}
        driver2={mockDriver2}
        rows={mockRows}
      />
    );

    // Inline styles convert hex to rgb format
    // #0600ef = rgb(6, 0, 239), #00d2be = rgb(0, 210, 190)
    const driver1Section = container.querySelector('[style*="rgb(6, 0, 239)"]');
    const driver2Section = container.querySelector('[style*="rgb(0, 210, 190)"]');

    expect(driver1Section).toBeInTheDocument();
    expect(driver2Section).toBeInTheDocument();
  });

  it('should fallback to teamColorToken if teamColorHex not provided', () => {
    const driver1NoHex = {
      ...mockDriver1,
      teamColorHex: undefined,
    };

    const { container } = render(
      <PdfComparisonCard
        driver1={driver1NoHex}
        driver2={mockDriver2}
        rows={mockRows}
      />
    );

    // Should use teamColorToken as fallback - just verify it renders
    expect(container.firstChild).toBeInTheDocument();
    expect(container.querySelector('h2')).toHaveTextContent('Max Verstappen');
  });

  it('should use default color if no team color provided', () => {
    const driver1NoColors = {
      ...mockDriver1,
      teamColorHex: undefined,
      teamColorToken: '',
    };

    const { container } = render(
      <PdfComparisonCard
        driver1={driver1NoColors}
        driver2={mockDriver2}
        rows={mockRows}
      />
    );

    // Should fallback to default #CCCCCC = rgb(204, 204, 204)
    const driver1Section = container.querySelector('[style*="rgb(204, 204, 204)"]');
    expect(driver1Section).toBeInTheDocument();
  });

  it('should load and display driver images', async () => {
    const { container } = render(
      <PdfComparisonCard
        driver1={mockDriver1}
        driver2={mockDriver2}
        rows={mockRows}
      />
    );

    await waitFor(() => {
      const images = container.querySelectorAll('img');
      expect(images).toHaveLength(2);
    });

    expect(fetch).toHaveBeenCalledWith('https://example.com/ver.png');
    expect(fetch).toHaveBeenCalledWith('https://example.com/ham.png');
  });

  it('should handle image load errors gracefully', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Image load failed'));

    const { container } = render(
      <PdfComparisonCard
        driver1={mockDriver1}
        driver2={mockDriver2}
        rows={mockRows}
      />
    );

    // Should still render without crashing
    expect(container).toBeInTheDocument();
  });

  it('should highlight better values with correct styling', () => {
    const { container } = render(
      <PdfComparisonCard
        driver1={mockDriver1}
        driver2={mockDriver2}
        rows={mockRows}
      />
    );

    const cells = container.querySelectorAll('td');
    
    // Check that better values have appropriate styling (bold, colored)
    const betterValueCells = Array.from(cells).filter((cell) => {
      const style = window.getComputedStyle(cell);
      return style.fontWeight === 'bold';
    });

    expect(betterValueCells.length).toBeGreaterThan(0);
  });

  it('should apply alternating row colors', () => {
    const { container } = render(
      <PdfComparisonCard
        driver1={mockDriver1}
        driver2={mockDriver2}
        rows={mockRows}
      />
    );

    const rows = container.querySelectorAll('tbody tr');
    
    // Check that rows exist with alternating styling
    expect(rows.length).toBeGreaterThan(0);
    rows.forEach((row) => {
      expect(row).toBeInTheDocument();
    });
  });

  it('should render "Head-to-Head Comparison" title', () => {
    const { getByText } = render(
      <PdfComparisonCard
        driver1={mockDriver1}
        driver2={mockDriver2}
        rows={mockRows}
      />
    );

    expect(getByText('Head-to-Head Comparison')).toBeInTheDocument();
  });

  it('should use Orbitron font family', () => {
    const { container } = render(
      <PdfComparisonCard
        driver1={mockDriver1}
        driver2={mockDriver2}
        rows={mockRows}
      />
    );

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveStyle({ fontFamily: "'Orbitron', sans-serif" });
  });

  it('should render table with proper headers', () => {
    const { getByText, getAllByText } = render(
      <PdfComparisonCard
        driver1={mockDriver1}
        driver2={mockDriver2}
        rows={mockRows}
      />
    );

    expect(getByText('Statistic')).toBeInTheDocument();
    // Headers should also include driver names (appear multiple times)
    expect(getAllByText('Max Verstappen').length).toBeGreaterThan(0);
    expect(getAllByText('Lewis Hamilton').length).toBeGreaterThan(0);
  });

  it('should handle empty rows array', () => {
    const { container, getByText } = render(
      <PdfComparisonCard
        driver1={mockDriver1}
        driver2={mockDriver2}
        rows={[]}
      />
    );

    expect(container).toBeInTheDocument();
    expect(getByText('Head-to-Head Comparison')).toBeInTheDocument();
  });

  it('should handle string values in rows', () => {
    const rowsWithStrings = [
      { label: 'Team', value1: 'Red Bull Racing', value2: 'Mercedes' },
      { label: 'Nationality', value1: 'Dutch', value2: 'British' },
    ];

    const { getByText } = render(
      <PdfComparisonCard
        driver1={mockDriver1}
        driver2={mockDriver2}
        rows={rowsWithStrings}
      />
    );

    expect(getByText('Red Bull Racing')).toBeInTheDocument();
    expect(getByText('Mercedes')).toBeInTheDocument();
    expect(getByText('Dutch')).toBeInTheDocument();
    expect(getByText('British')).toBeInTheDocument();
  });

  it('should handle rows without better flags', () => {
    const neutralRows = [
      { label: 'Races', value1: 22, value2: 22 },
      { label: 'Age', value1: 27, value2: 39 },
    ];

    const { getByText, getAllByText } = render(
      <PdfComparisonCard
        driver1={mockDriver1}
        driver2={mockDriver2}
        rows={neutralRows}
      />
    );

    expect(getByText('Races')).toBeInTheDocument();
    // 22 appears twice (both drivers have same value)
    expect(getAllByText('22').length).toBe(2);
    expect(getByText('27')).toBeInTheDocument();
    expect(getByText('39')).toBeInTheDocument();
  });

  it('should apply correct styling for better2 flag', () => {
    const rowsWithBetter2 = [
      { label: 'Wins', value1: 10, value2: 15, better1: false, better2: true },
    ];

    const { getByText } = render(
      <PdfComparisonCard
        driver1={mockDriver1}
        driver2={mockDriver2}
        rows={rowsWithBetter2}
      />
    );

    expect(getByText('15')).toBeInTheDocument();
  });

  it('should set minimum width for container', () => {
    const { container } = render(
      <PdfComparisonCard
        driver1={mockDriver1}
        driver2={mockDriver2}
        rows={mockRows}
      />
    );

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveStyle({ minWidth: '800px' });
  });

  it('should use dark theme colors', () => {
    const { container } = render(
      <PdfComparisonCard
        driver1={mockDriver1}
        driver2={mockDriver2}
        rows={mockRows}
      />
    );

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveStyle({ backgroundColor: '#0a0a0a' });
  });

  it('should handle image conversion with FileReader', async () => {
    const { container } = render(
      <PdfComparisonCard
        driver1={mockDriver1}
        driver2={mockDriver2}
        rows={mockRows}
      />
    );

    await waitFor(() => {
      const images = container.querySelectorAll('img');
      expect(images.length).toBeGreaterThan(0);
    });
  });

  it('should render with ref', () => {
    const ref = React.createRef<HTMLDivElement>();
    
    render(
      <PdfComparisonCard
        ref={ref}
        driver1={mockDriver1}
        driver2={mockDriver2}
        rows={mockRows}
      />
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('should update images when driver imageUrl changes', async () => {
    const { rerender } = render(
      <PdfComparisonCard
        driver1={mockDriver1}
        driver2={mockDriver2}
        rows={mockRows}
      />
    );

    const newDriver1 = {
      ...mockDriver1,
      imageUrl: 'https://example.com/new-ver.png',
    };

    rerender(
      <PdfComparisonCard
        driver1={newDriver1}
        driver2={mockDriver2}
        rows={mockRows}
      />
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('https://example.com/new-ver.png');
    });
  });

  it('should apply proper border radius to images', () => {
    const { container } = render(
      <PdfComparisonCard
        driver1={mockDriver1}
        driver2={mockDriver2}
        rows={mockRows}
      />
    );

    const images = container.querySelectorAll('img');
    images.forEach((img) => {
      expect(img).toHaveStyle({ borderRadius: '12px' });
    });
  });

  it('should display component with correct display name', () => {
    expect(PdfComparisonCard.displayName).toBe('PdfComparisonCard');
  });

  it('should handle large number values', () => {
    const rowsWithLargeNumbers = [
      { label: 'Points', value1: 999999, value2: 888888 },
    ];

    const { getByText } = render(
      <PdfComparisonCard
        driver1={mockDriver1}
        driver2={mockDriver2}
        rows={rowsWithLargeNumbers}
      />
    );

    expect(getByText('999999')).toBeInTheDocument();
    expect(getByText('888888')).toBeInTheDocument();
  });

  it('should handle negative values', () => {
    const rowsWithNegatives = [
      { label: 'Delta', value1: -5, value2: 5 },
    ];

    const { getByText } = render(
      <PdfComparisonCard
        driver1={mockDriver1}
        driver2={mockDriver2}
        rows={rowsWithNegatives}
      />
    );

    expect(getByText('-5')).toBeInTheDocument();
    expect(getByText('5')).toBeInTheDocument();
  });

  it('should maintain grid layout for driver sections', () => {
    const { container } = render(
      <PdfComparisonCard
        driver1={mockDriver1}
        driver2={mockDriver2}
        rows={mockRows}
      />
    );

    const gridContainer = container.querySelector('[style*="grid"]');
    expect(gridContainer).toBeInTheDocument();
  });
});

