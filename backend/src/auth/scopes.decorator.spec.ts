import { jest, describe, it, expect } from '@jest/globals';
import { SetMetadata } from '@nestjs/common';
import { SCOPES_KEY, Scopes } from './scopes.decorator';

// Mock the @nestjs/common module
jest.mock('@nestjs/common', () => ({
  SetMetadata: jest.fn(),
}));

describe('Scopes Decorator', () => {
  let mockSetMetadata: jest.MockedFunction<typeof SetMetadata>;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup the mock SetMetadata function
    mockSetMetadata = SetMetadata as jest.MockedFunction<typeof SetMetadata>;
  });

  describe('SCOPES_KEY constant', () => {
    it('should be defined', () => {
      expect(SCOPES_KEY).toBeDefined();
    });

    it('should have the correct value', () => {
      expect(SCOPES_KEY).toBe('scopes');
    });

    it('should be a string', () => {
      expect(typeof SCOPES_KEY).toBe('string');
    });
  });

  describe('Scopes decorator function', () => {
    it('should be defined', () => {
      expect(Scopes).toBeDefined();
    });

    it('should be a function', () => {
      expect(typeof Scopes).toBe('function');
    });

    it('should call SetMetadata with correct parameters for single scope', () => {
      const scope = 'read:users';
      
      Scopes(scope);

      expect(mockSetMetadata).toHaveBeenCalledWith(SCOPES_KEY, [scope]);
      expect(mockSetMetadata).toHaveBeenCalledTimes(1);
    });

    it('should call SetMetadata with correct parameters for multiple scopes', () => {
      const scopes = ['read:users', 'write:users', 'delete:users'];
      
      Scopes(...scopes);

      expect(mockSetMetadata).toHaveBeenCalledWith(SCOPES_KEY, scopes);
      expect(mockSetMetadata).toHaveBeenCalledTimes(1);
    });

    it('should call SetMetadata with correct parameters for empty scopes', () => {
      Scopes();

      expect(mockSetMetadata).toHaveBeenCalledWith(SCOPES_KEY, []);
      expect(mockSetMetadata).toHaveBeenCalledTimes(1);
    });

    it('should handle single string scope', () => {
      const scope = 'admin';
      
      Scopes(scope);

      expect(mockSetMetadata).toHaveBeenCalledWith(SCOPES_KEY, [scope]);
    });

    it('should handle multiple string scopes', () => {
      const scopes = ['read', 'write', 'admin'];
      
      Scopes(...scopes);

      expect(mockSetMetadata).toHaveBeenCalledWith(SCOPES_KEY, scopes);
    });

    it('should handle mixed scope types', () => {
      const scopes = ['read:users', 'write:posts', 'delete:comments'];
      
      Scopes(...scopes);

      expect(mockSetMetadata).toHaveBeenCalledWith(SCOPES_KEY, scopes);
    });

    it('should return the result of SetMetadata', () => {
      const mockReturnValue = 'mock-metadata';
      mockSetMetadata.mockReturnValue(mockReturnValue as any);

      const result = Scopes('read:users');

      expect(result).toBe(mockReturnValue);
    });
  });

  describe('decorator usage patterns', () => {
    it('should work with class decorator', () => {
      const scopes = ['admin'];
      
      Scopes(...scopes);

      expect(mockSetMetadata).toHaveBeenCalledWith(SCOPES_KEY, scopes);
    });

    it('should work with method decorator', () => {
      const scopes = ['read:users', 'write:users'];
      
      Scopes(...scopes);

      expect(mockSetMetadata).toHaveBeenCalledWith(SCOPES_KEY, scopes);
    });

    it('should handle special characters in scope names', () => {
      const scopes = ['read:users:profile', 'write:posts:comments'];
      
      Scopes(...scopes);

      expect(mockSetMetadata).toHaveBeenCalledWith(SCOPES_KEY, scopes);
    });
  });
});
