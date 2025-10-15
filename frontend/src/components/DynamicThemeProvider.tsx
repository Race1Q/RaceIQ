// frontend/src/components/DynamicThemeProvider.tsx

import React, { useMemo } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { useThemeColor } from '../context/ThemeColorContext';
import { createTheme } from '../styles/theme';

interface DynamicThemeProviderProps {
  children: React.ReactNode;
}

export const DynamicThemeProvider: React.FC<DynamicThemeProviderProps> = ({ children }) => {
  const { accentColor } = useThemeColor();
  
  // Memoize theme to prevent unnecessary re-renders
  const theme = useMemo(() => createTheme(accentColor), [accentColor]);
  
  return (
    <ChakraProvider theme={theme}>
      {children}
    </ChakraProvider>
  );
};
