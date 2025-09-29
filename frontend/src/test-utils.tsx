import React from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';

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
