// frontend/src/components/DynamicThemeProvider.tsx

import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { useThemeColor } from '../context/ThemeColorContext';
import { createTheme } from '../styles/theme';

interface DynamicThemeProviderProps {
  children: React.ReactNode;
}

export const DynamicThemeProvider: React.FC<DynamicThemeProviderProps> = ({ children }) => {
  const { accentColor } = useThemeColor();
  
  // Create theme with the current accent color
  const theme = createTheme(accentColor);
  
  return (
    <ChakraProvider theme={theme}>
      {children}
    </ChakraProvider>
  );
};
