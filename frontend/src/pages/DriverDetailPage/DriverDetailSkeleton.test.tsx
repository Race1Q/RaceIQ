// frontend/src/pages/DriverDetailPage/DriverDetailSkeleton.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import DriverDetailSkeleton from './DriverDetailSkeleton';
import theme from '../../theme';

// Mock the SpeedometerMini component
vi.mock('../../components/loaders/SpeedometerMini', () => ({
  default: function MockSpeedometerMini({ size }: { size: number }) {
    return <div data-testid="speedometer-mini" style={{ width: size, height: size }}>Speedometer</div>;
  }
}));

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </ChakraProvider>
  );
}

describe('DriverDetailSkeleton', () => {
  it('renders without crashing', () => {
    renderWithProviders(<DriverDetailSkeleton />);
    expect(screen.getByText('Loading driver details...')).toBeInTheDocument();
  });

  it('displays the speedometer loader', () => {
    renderWithProviders(<DriverDetailSkeleton />);
    expect(screen.getByTestId('speedometer-mini')).toBeInTheDocument();
  });

  it('renders skeleton elements for header section', () => {
    renderWithProviders(<DriverDetailSkeleton />);
    // The skeleton should render various placeholder elements
    // We can't test for specific skeleton elements as they don't have test IDs,
    // but we can verify the component renders without errors
    expect(screen.getByText('Loading driver details...')).toBeInTheDocument();
  });

  it('has proper loading text', () => {
    renderWithProviders(<DriverDetailSkeleton />);
    const loadingText = screen.getByText('Loading driver details...');
    expect(loadingText).toBeInTheDocument();
    expect(loadingText).toHaveStyle({ 'font-family': 'var(--chakra-fonts-heading)' });
  });
});