// backend/jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  moduleFileExtensions: ['ts', 'js', 'json'],

  // Load .env BEFORE tests (uses DOTENV_CONFIG_PATH from your npm script)
  setupFiles: ['dotenv/config'],

  // Per-test hooks/utilities (no top-level await here)
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],

  // --- Coverage focus ---
  collectCoverageFrom: [
    'src/**/*.{ts,js}',

    // Explicitly INCLUDE main.ts so bootstrap logic counts
    'src/main.ts',

    // Exclude boilerplate / noise
    '!src/**/*.module.ts',

    // Pure data/shape classes (no logic to test)
    '!src/**/dto/**',
    '!src/**/entities/**',

    // Ingestion & scripts (infra-level, usually integration-tested separately)
    '!src/**/*ingest*.ts',
    '!src/**/*-ingestion.service.ts',

    // Optionally ignore generated or infra folders
    '!src/**/migrations/**',
    '!src/**/seed/**',
  ],

  coverageDirectory: '<rootDir>/coverage',

  // Optional helpers:
  // clearMocks: true,
  // coverageThreshold: {
  //   global: { branches: 20, functions: 30, lines: 30, statements: 30 },
  // },
};

export default config;
