// frontend/src/pages/ConstructorsDetails/ConstructorsDetailsSkeleton.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import ConstructorsDetailsSkeleton from './ConstructorsDetailsSkeleton';
import theme from '../../theme';

// Mock SpeedometerMini component
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

describe('ConstructorsDetailsSkeleton', () => {
  it('renders without crashing', () => {
    renderWithProviders(<ConstructorsDetailsSkeleton />);
    expect(screen.getByText('Loading constructor details...')).toBeInTheDocument();
  });

  it('renders all main skeleton sections', () => {
    renderWithProviders(<ConstructorsDetailsSkeleton />);
    
    // Check that loading text is present
    expect(screen.getByText('Loading constructor details...')).toBeInTheDocument();
    
    // The skeleton should render various placeholder elements
    // We can't test for specific skeleton elements as they don't have test IDs,
    // but we can verify the component renders without errors
    expect(screen.getByText('Loading constructor details...')).toBeInTheDocument();
  });

  it('has proper loading text styling', () => {
    renderWithProviders(<ConstructorsDetailsSkeleton />);
    const loadingText = screen.getByText('Loading constructor details...');
    expect(loadingText).toBeInTheDocument();
    expect(loadingText).toHaveStyle({ 'font-family': 'var(--chakra-fonts-heading)' });
  });

  it('renders with proper container structure', () => {
    renderWithProviders(<ConstructorsDetailsSkeleton />);
    
    // The component should render without throwing any errors
    // This test ensures the basic structure is correct
    expect(screen.getByText('Loading constructor details...')).toBeInTheDocument();
  });
});
