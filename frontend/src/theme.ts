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
      // ===== BACKGROUNDS =====
      // Page backgrounds
      'bg-primary': { default: '#F5F7FA', _dark: '#0a0a0a' },
      'bg-surface': { default: '#FFFFFF', _dark: '#0f0f0f' },
      'bg-surface-raised': { default: '#FFFFFF', _dark: '#1a1a1a' },
      
      // Card backgrounds
      'bg-card': { default: 'rgba(255, 255, 255, 0.95)', _dark: 'rgba(15, 15, 15, 0.6)' },
      'bg-card-hover': { default: 'rgba(255, 255, 255, 1)', _dark: 'rgba(26, 26, 26, 0.7)' },
      
      // Overlay backgrounds (modals, dropdowns)
      'bg-overlay': { default: 'rgba(15, 23, 42, 0.75)', _dark: 'rgba(0, 0, 0, 0.6)' },
      'bg-modal': { default: 'rgba(255, 255, 255, 0.98)', _dark: 'rgba(15, 15, 15, 0.95)' },
      
      // Glassmorphism (sidebar, floating elements)
      'bg-glassmorphism': { default: 'rgba(255, 255, 255, 0.85)', _dark: 'rgba(15, 15, 15, 0.7)' },
      
      // Interactive states
      'bg-hover': { default: 'rgba(0, 0, 0, 0.04)', _dark: 'rgba(255, 255, 255, 0.05)' },
      'bg-active': { default: 'rgba(0, 0, 0, 0.08)', _dark: 'rgba(255, 255, 255, 0.1)' },
      'bg-subtle': { default: 'rgba(0, 0, 0, 0.02)', _dark: 'rgba(255, 255, 255, 0.02)' },

      // ===== TEXT COLORS =====
      'text-primary': { default: '#0F172A', _dark: '#ffffff' },
      'text-secondary': { default: '#475569', _dark: '#cccccc' },
      'text-muted': { default: '#94A3B8', _dark: '#888888' },
      'text-on-accent': { default: '#ffffff', _dark: '#ffffff' },
      'text-inverse': { default: '#ffffff', _dark: '#0F172A' },

      // ===== BORDERS =====
      'border-primary': { default: '#E2E8F0', _dark: '#333333' },
      'border-subtle': { default: 'rgba(0, 0, 0, 0.06)', _dark: 'rgba(255, 255, 255, 0.1)' },
      'border-strong': { default: 'rgba(0, 0, 0, 0.15)', _dark: 'rgba(255, 255, 255, 0.2)' },
      'border-accent': { default: '#e10600', _dark: '#e10600' },

      // ===== ICONS =====
      'icon-primary': { default: '#475569', _dark: '#cccccc' },
      'icon-muted': { default: '#94A3B8', _dark: '#666666' },
      'icon-accent': { default: '#e10600', _dark: '#e10600' },

      // ===== SPECIAL =====
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

  // 4.1 Container sizes
  sizes: {
    containers: {
      '2xl': '1600px',
    },
  },
  components: {
    Container: {
      defaultProps: {
        // Enable custom size token via maxW="container.2xl"
        // Chakra maps container tokens to theme.sizes.containers
      },
      sizes: {
        '2xl': {
          maxW: 'containers.2xl',
        },
      },
    },
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
