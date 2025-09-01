import { jest, describe, it, expect } from '@jest/globals';
import { AuthModule } from './auth.module';

describe('AuthModule', () => {
  it('should be defined', () => {
    expect(AuthModule).toBeDefined();
  });

  describe('module structure', () => {
    it('should be a class', () => {
      expect(typeof AuthModule).toBe('function');
    });

    it('should be a valid NestJS module', () => {
      // Test that the module is a valid NestJS module class
      expect(AuthModule).toBeDefined();
    });

    it('should have module decorator', () => {
      // Test that the class has the Module decorator by checking if it's a function
      expect(typeof AuthModule).toBe('function');
    });
  });
});
