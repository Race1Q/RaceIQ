import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

// 1. Set up the color mode configuration
const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: true, // Respects the user's OS preference
};

// 2. Extend the theme with your custom design tokens
const theme = extendTheme({
  config,
  colors: {
    // Link your CSS variables to Chakra's color keys
    primaryRed: 'var(--color-primary-red)',
    backgroundDark: 'var(--color-background-dark)',
    surfaceGray: 'var(--color-surface-gray)',
    surfaceDark: 'var(--color-surface-dark)',
    textLight: 'var(--color-text-light)',
    textMedium: 'var(--color-text-medium)',
  },
  fonts: {
    // Link your CSS font variables
    heading: 'var(--font-display)', // For Orbitron
    body: 'var(--font-primary)',    // For Exo 2
  },
  styles: {
    global: {
      'html, body': {
        // Apply global background color from your variables
        backgroundColor: 'var(--color-background-dark)',
        color: 'var(--color-text-light)',
      },
    },
  },
});

export default theme;