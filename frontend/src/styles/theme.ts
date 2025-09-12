// frontend/src/theme.ts

import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

// 1. Color mode configuration - This remains the same.
const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: true, // Respects the user's OS preference
};

// 2. The new, fully migrated theme object
const theme = extendTheme({
  config,

  // 3. SEMANTIC TOKENS: The key to powerful light/dark mode.
  // This defines theme-aware tokens. Chakra automatically swaps the values.
  // 'default' is for light mode, '_dark' is for dark mode.
  semanticTokens: {
    colors: {
      // UI Backgrounds
      'bg-primary': { default: '#F0F2F5', _dark: '#0a0a0a' },
      'bg-surface': { default: '#FFFFFF', _dark: '#0f0f0f' },
      'bg-surface-raised': { default: '#FDFDFD', _dark: '#1a1a1a' },

      // Text Colors
      'text-primary': { default: '#1A202C', _dark: '#ffffff' },
      'text-secondary': { default: '#718096', _dark: '#cccccc' },
      'text-muted': { default: '#A0AEC0', _dark: '#888888' },

      // Border Colors
      'border-primary': { default: '#E2E8F0', _dark: '#333333' },

      // Icon Colors
      'icon-muted': { default: '#A0AEC0', _dark: '#666666' },

      // Logo Color (swaps based on theme)
      'logo-primary': { default: '#1a202c', _dark: '#FFFFFF' },
    },
  },

  // 4. RAW TOKENS: The base values for your design system.
  colors: {
    brand: {
      red: '#e10600',
      redDark: '#c00500',
      redLight: '#ff4444',
      greenAccent: '#00ff00',
    },
    // Static colors that don't change with the theme
    staticWhite: '#F5F5F5',
  },

  fonts: {
    heading: `'Orbitron', sans-serif`, // --font-display
    body: `'Exo 2', sans-serif`,         // --font-secondary
    ui: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`, // --font-primary
    signature: `'Damion', cursive`,
  },

  space: {
    sm: '10px',
    md: '20px',
    lg: '30px',
    xl: '40px',
  },

  radii: { // For border-radius
    sm: '5px',
    md: '8px',
    lg: '12px',
  },

  // 5. GLOBAL STYLES: Now uses the semantic tokens for automatic theme switching.
  styles: {
    global: {
      'html, body': {
        backgroundColor: 'bg-primary', // Automatically switches!
        color: 'text-primary',         // Automatically switches!
        fontFamily: 'body',
      },
    },
  },
});

export default theme;
