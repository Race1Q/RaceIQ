import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import CircuitKeyStats from './CircuitKeyStats';

const mockStats = {
  length: '5.278 km',
  laps: 58,
  corners: 16,
  drsZones: 2,
  recordLap: '1:18.123',
  firstRace: 1950,
  elevation: '610m',
  averageSpeed: '233 km/h',
};

const renderWithChakra = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider>
      {ui}
    </ChakraProvider>
  );
};

describe('CircuitKeyStats', () => {
  it('renders without crashing', () => {
    const { container } = renderWithChakra(<CircuitKeyStats stats={mockStats} />);
    expect(container).toBeInTheDocument();
  });

  it('displays lap record information', () => {
    const { container } = renderWithChakra(<CircuitKeyStats stats={mockStats} />);
    expect(container.textContent).toContain('1:18.123');
  });

  it('displays number of laps', () => {
    const { container } = renderWithChakra(<CircuitKeyStats stats={mockStats} />);
    expect(container.textContent).toContain('58');
  });

  it('displays circuit length', () => {
    const { container } = renderWithChakra(<CircuitKeyStats stats={mockStats} />);
    expect(container.textContent).toContain('5.278 km');
  });

  it('displays first grand prix year', () => {
    const { container } = renderWithChakra(<CircuitKeyStats stats={mockStats} />);
    expect(container.textContent).toContain('1950');
  });

  it('displays number of corners', () => {
    const { container } = renderWithChakra(<CircuitKeyStats stats={mockStats} />);
    expect(container.textContent).toContain('16');
  });

  it('handles missing optional fields', () => {
    const minimalStats = {
      length: '5 km',
      laps: 50,
      corners: 14,
      drsZones: 1,
    };

    const { container } = renderWithChakra(<CircuitKeyStats stats={minimalStats} />);
    expect(container).toBeInTheDocument();
  });

  it('handles null stats', () => {
    const { container } = renderWithChakra(<CircuitKeyStats stats={null as any} />);
    expect(container).toBeInTheDocument();
  });
});

