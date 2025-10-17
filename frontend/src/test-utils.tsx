import React from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

// Mock the ThemeColorContext module globally with a simple stub
// This provides useThemeColor to components without requiring Auth0/useUserProfile dependencies
vi.mock('./context/ThemeColorContext', () => ({
  ThemeColorProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useThemeColor: () => ({
    accentColor: 'e10600',
    accentColorWithHash: '#e10600',
    accentColorLight: '#ff2020',
    accentColorDark: '#c10500',
    accentColorRgba: (alpha: number) => `rgba(225, 6, 0, ${alpha})`,
    isLoading: false,
    useCustomTeamColor: true,
    toggleCustomTeamColor: () => {},
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
        {children}
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
