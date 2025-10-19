import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        exportType: 'default',
        ref: true,
        svgo: false,
        titleProp: true,
      },
      include: '**/*.svg?react',
    }),
    // Bundle analyzer - generates stats.html after build
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }) as any,
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  // Production build optimizations
  build: {
    target: 'es2020', // Modern browsers only, no legacy JS
    minify: 'esbuild', // Use esbuild for faster minification
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching and loading
        manualChunks: {
          // Core React libs - MUST be together for context to work
          'react-vendor': ['react', 'react-dom', 'react/jsx-runtime', 'react-router-dom'],
          
          // UI libraries
          'ui-vendor': [
            '@chakra-ui/react',
            '@chakra-ui/icons',
            '@emotion/react',
            '@emotion/styled',
            'framer-motion',
          ],
          
          // Auth and API
          'auth-vendor': [
            '@auth0/auth0-react',
            '@supabase/supabase-js',
            'axios',
          ],
          
          // Smaller utilities
          'utils-vendor': [
            'lucide-react',
            'react-icons',
            'react-country-flag',
            'react-intersection-observer',
          ],
        },
        // Optimize chunk file names
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Increase chunk size warning limit (some chunks will be large due to 3D models)
    chunkSizeWarningLimit: 1000,
    // Enable source maps for production debugging (optional - can disable for smaller builds)
    sourcemap: false,
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@chakra-ui/react',
      '@emotion/react',
      '@emotion/styled',
      'framer-motion',
      'react-reconciler',
      'react-reconciler/constants',
      'scheduler',
      'suspend-react',
      '@react-three/drei', // Include drei to handle stats.js properly
    ],
    exclude: ['three', '@react-three/fiber'], // Only exclude three and fiber
  },

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },

  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
    css: true,

    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
    testTimeout: 20000,

    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      reporter: ['text', 'json-summary', 'lcov'],
      include: ['src/**/*.{ts,tsx,js,jsx}'],
      exclude: [
        'src/**/__tests__/**',
        'src/**/*.test.*',
        'src/**/*.spec.*',
        'src/vite-env.d.ts',
        'src/theme.ts',
        'src/data/**',
        'src/types/**',
        'src/lib/assets.ts',
        'src/lib/teamAssets.ts',
        'src/lib/teamCars.ts',
        'src/services/f1Api.ts',
        'src/hooks/useApi.ts',
        'src/context/ThemeContext.tsx',
        // Exclude XR/VR files (experimental, difficult to test in JSDOM)
        'src/experiences/xr/**',
      ],
    },
  },
});
