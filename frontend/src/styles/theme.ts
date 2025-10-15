// frontend/src/styles/theme.ts

import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

// 1. Color mode configuration - This remains the same.
const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false, // Disabled to prevent conflicts
};

// 2. Dynamic theme creation function
export const createTheme = (accentColor: string = 'e10600') => {
  return extendTheme({
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
      
      // Card backgrounds
      'bg-card': { default: '#FFFFFF', _dark: 'rgba(15, 15, 15, 0.6)' },
      'bg-card-hover': { default: '#FFFFFF', _dark: 'rgba(26, 26, 26, 0.7)' },
      
      // Overlay backgrounds (modals, dropdowns)
      'bg-overlay': { default: 'rgba(15, 23, 42, 0.75)', _dark: 'rgba(0, 0, 0, 0.6)' },
      'bg-modal': { default: '#FFFFFF', _dark: 'rgba(15, 15, 15, 0.95)' },
      
      // Glassmorphism (sidebar, floating elements)
      'bg-glassmorphism': { default: 'rgba(255, 255, 255, 0.9)', _dark: 'rgba(15, 15, 15, 0.7)' },
      
      // Interactive states
      'bg-hover': { default: 'rgba(0, 0, 0, 0.04)', _dark: 'rgba(255, 255, 255, 0.05)' },
      'bg-active': { default: 'rgba(0, 0, 0, 0.08)', _dark: 'rgba(255, 255, 255, 0.1)' },
      'bg-subtle': { default: 'rgba(0, 0, 0, 0.02)', _dark: 'rgba(255, 255, 255, 0.02)' },

      // Text Colors
      'text-primary': { default: '#1A202C', _dark: '#ffffff' },
      'text-secondary': { default: '#718096', _dark: '#cccccc' },
      'text-muted': { default: '#A0AEC0', _dark: '#888888' },
      'text-on-accent': { default: '#ffffff', _dark: '#ffffff' },
      'text-inverse': { default: '#ffffff', _dark: '#0F172A' },

      // Border Colors
      'border-primary': { default: '#E2E8F0', _dark: '#333333' },
      'border-subtle': { default: 'rgba(0, 0, 0, 0.06)', _dark: 'rgba(255, 255, 255, 0.1)' },
      'border-strong': { default: 'rgba(0, 0, 0, 0.15)', _dark: 'rgba(255, 255, 255, 0.2)' },
      'border-accent': { default: `#${accentColor}`, _dark: `#${accentColor}` },

      // Icon Colors
      'icon-primary': { default: '#475569', _dark: '#cccccc' },
      'icon-muted': { default: '#A0AEC0', _dark: '#666666' },
      'icon-accent': { default: `#${accentColor}`, _dark: `#${accentColor}` },

      // Logo Color (swaps based on theme)
      'logo-primary': { default: '#1a202c', _dark: '#FFFFFF' },
      
      // Shadow colors (used in boxShadow)
      'shadow-color': { default: 'rgba(0, 0, 0, 0.1)', _dark: 'rgba(0, 0, 0, 0.5)' },
      'shadow-color-md': { default: 'rgba(0, 0, 0, 0.08)', _dark: 'rgba(0, 0, 0, 0.4)' },
      'shadow-color-lg': { default: 'rgba(0, 0, 0, 0.12)', _dark: 'rgba(220, 38, 38, 0.15)' },
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

  // Custom breakpoints for responsive design
  breakpoints: {
    base: '0px',
    xs: '320px',
    sm: '480px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Container sizes for responsive layouts
  sizes: {
    container: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1400px',
      '3xl': '1600px',
    },
  },

  space: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
  },

  radii: { // For border-radius
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },

  // Typography scale for responsive text
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
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
};

// Default theme with F1 red color
const theme = createTheme('e10600');
export default theme;
