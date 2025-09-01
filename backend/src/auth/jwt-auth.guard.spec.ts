import { Test, TestingModule } from '@nestjs/testing';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(async () => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtAuthGuard],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('class structure', () => {
    it('should be a class', () => {
      expect(typeof guard).toBe('object');
      expect(guard.constructor).toBeDefined();
    });

    it('should be injectable', () => {
      // Test that the guard can be instantiated through dependency injection
      expect(guard).toBeDefined();
    });
  });
});
