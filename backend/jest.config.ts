// backend/jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Roots for test discovery
  roots: ['<rootDir>/src', '<rootDir>/test'],

  // File extensions Jest will handle
  moduleFileExtensions: ['ts', 'js', 'json'],

  // Transform configuration to handle ES modules
  transformIgnorePatterns: [
    'node_modules/(?!(uuid)/)'
  ],

  // Ensure .env.test is loaded before tests
  setupFiles: ['dotenv/config'],

  // Hooks/utilities for tests (optional)
  // setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],

  // Coverage settings
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'json-summary', 'lcov'],
  collectCoverageFrom: [
    'src/**/*.{ts,js}',

    // Exclude files that don't need unit tests
    '!src/**/*.module.ts',
    '!src/**/dto/**',
    '!src/**/entities/**',
    '!src/**/migrations/**',
    '!src/**/seed/**',
    '!src/ingestion/**',
    '!src/main.ts',
    '!**/*.spec.{ts,js}',
  ],

  // Exclude ingestion directory from test discovery
  testPathIgnorePatterns: [
    '<rootDir>/src/ingestion/',
  ],

  // Stability improvements
  clearMocks: true,
  restoreMocks: true,
  maxWorkers: 1, // keep single-threaded to avoid Jest spawn issues in CI
};

export default config;
