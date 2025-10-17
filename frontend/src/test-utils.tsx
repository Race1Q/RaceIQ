import React from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { ThemeColorProvider } from './context/ThemeColorContext';

// Mock Auth0
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: false,
    user: null,
    isLoading: false,
    getAccessTokenSilently: vi.fn().mockResolvedValue('mock-token'),
  }),
  Auth0Provider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock useUserProfile
vi.mock('./hooks/useUserProfile', () => ({
  useUserProfile: () => ({
    profile: null,
    favoriteConstructor: null,
    favoriteDriver: null,
    loading: false,
  }),
}));

// Test theme with all required colors
const testTheme = extendTheme({
  colors: {
    brand: {
      red: '#FF0000',
    },
  },
});

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRoute?: string;
}

function AllTheProviders({ children, initialRoute = '/' }: { children: React.ReactNode; initialRoute?: string }) {
  return (
    <ChakraProvider theme={testTheme}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <ThemeColorProvider>
          {children}
        </ThemeColorProvider>
      </MemoryRouter>
    </ChakraProvider>
  );
}

const customRender = (ui: React.ReactElement, options: CustomRenderOptions = {}) => {
  const { initialRoute, ...renderOptions } = options;
  return render(ui, {
    wrapper: ({ children }) => <AllTheProviders initialRoute={initialRoute}>{children}</AllTheProviders>,
    ...renderOptions,
  });
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
export { testTheme };
