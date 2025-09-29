import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr'; // 1. Import svgr
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
    })
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
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

    // deps: { inline: ['recharts', 'lucide-react'] },

    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.{ts,tsx,js,jsx}'],
      exclude: [
        'src/**/__tests__/**',
        'src/**/*.test.*',
        'src/**/*.spec.*',
        'src/vite-env.d.ts',
        // Files that don't need testing (low value for coverage)
        'src/theme.ts',
        'src/data/**',
        'src/types/**',
        'src/lib/assets.ts',
        'src/lib/teamAssets.ts',
        'src/lib/teamCars.ts',
        'src/services/f1Api.ts',
        'src/hooks/useApi.ts',
        'src/context/ThemeContext.tsx',
        // 'src/**/*.stories.*',
        // 'src/**/mocks/**',
      ],
    },
  },
});
