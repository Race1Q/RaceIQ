import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import FeaturedDriverSkeleton from './FeaturedDriverSkeleton';

const renderWithChakra = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider>
      {ui}
    </ChakraProvider>
  );
};

describe('FeaturedDriverSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = renderWithChakra(<FeaturedDriverSkeleton />);
    expect(container).toBeInTheDocument();
  });

  it('displays skeleton elements', () => {
    const { container } = renderWithChakra(<FeaturedDriverSkeleton />);
    
    // Should have multiple skeleton elements
    const skeletons = container.querySelectorAll('.chakra-skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('maintains layout structure', () => {
    const { container } = renderWithChakra(<FeaturedDriverSkeleton />);
    
    // Should have container structure
    expect(container.querySelector('.chakra-container')).toBeTruthy();
  });
});

