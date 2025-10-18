import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import ConstructorStandingCard from './ConstructorStandingCard';
import { ThemeColorProvider } from '../../context/ThemeColorContext';

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: false,
  }),
}));

vi.mock('../../hooks/useUserProfile', () => ({
  useUserProfile: () => ({
    profile: null,
    favoriteConstructor: null,
    loading: false,
  }),
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider>
      <ThemeColorProvider>
        <BrowserRouter>
          {ui}
        </BrowserRouter>
      </ThemeColorProvider>
    </ChakraProvider>
  );
};

describe('ConstructorStandingCard', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <ConstructorStandingCard 
        constructorId={1}
        position={1}
        constructorName="Red Bull Racing"
        nationality="Austrian"
        points={800}
        wins={21}
        podiums={15}
      />
    );
    expect(container).toBeInTheDocument();
  });

  it('displays constructor name', () => {
    const { container } = renderWithProviders(
      <ConstructorStandingCard 
        constructorId={1}
        position={1}
        constructorName="Red Bull Racing"
        nationality="Austrian"
        points={800}
        wins={21}
        podiums={15}
      />
    );
    expect(container.textContent).toContain('Red Bull Racing');
  });

  it('displays points', () => {
    const { container } = renderWithProviders(
      <ConstructorStandingCard 
        constructorId={1}
        position={1}
        constructorName="Red Bull Racing"
        nationality="Austrian"
        points={800}
        wins={21}
        podiums={15}
      />
    );
    expect(container.textContent).toContain('800');
  });

  it('displays wins', () => {
    const { container } = renderWithProviders(
      <ConstructorStandingCard 
        constructorId={1}
        position={1}
        constructorName="Red Bull Racing"
        nationality="Austrian"
        points={800}
        wins={21}
        podiums={15}
      />
    );
    expect(container.textContent).toContain('21');
  });

  it('displays position', () => {
    const { container } = renderWithProviders(
      <ConstructorStandingCard 
        constructorId={1}
        position={1}
        constructorName="Red Bull Racing"
        nationality="Austrian"
        points={800}
        wins={21}
        podiums={15}
      />
    );
    expect(container.textContent).toContain('1');
  });

  it('handles different positions', () => {
    const { container } = renderWithProviders(
      <ConstructorStandingCard 
        constructorId={2}
        position={5}
        constructorName="Ferrari"
        nationality="Italian"
        points={400}
        wins={5}
        podiums={10}
      />
    );
    expect(container.textContent).toContain('5');
  });

  it('handles constructor with no wins', () => {
    const { container } = renderWithProviders(
      <ConstructorStandingCard 
        constructorId={10}
        position={10}
        constructorName="Williams"
        nationality="British"
        points={50}
        wins={0}
        podiums={0}
      />
    );
    expect(container.textContent).toContain('0');
  });
});

