import { Test, TestingModule } from '@nestjs/testing';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ScopesGuard } from './scopes.guard';
import { SCOPES_KEY } from './scopes.decorator';

describe('ScopesGuard', () => {
  let guard: ScopesGuard;
  let reflector: Reflector;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  beforeEach(async () => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScopesGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<ScopesGuard>(ScopesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should implement CanActivate interface', () => {
    expect(guard).toHaveProperty('canActivate');
    expect(typeof guard.canActivate).toBe('function');
  });

  it('should be injectable', () => {
    expect(guard).toBeInstanceOf(ScopesGuard);
  });

  describe('canActivate method', () => {
    it('should return true when no scopes are required', () => {
      const mockHandler = jest.fn();
      const mockClass = jest.fn();
      const mockExecutionContext = {
        getHandler: jest.fn().mockReturnValue(mockHandler),
        getClass: jest.fn().mockReturnValue(mockClass),
        switchToHttp: jest.fn(() => ({
          getRequest: jest.fn().mockReturnValue({}),
        })),
      };

      mockReflector.getAllAndOverride.mockReturnValue(undefined);

      const result = guard.canActivate(mockExecutionContext as any);

      expect(result).toBe(true);
      expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(SCOPES_KEY, [mockHandler, mockClass]);
    });

    it('should return true when empty scopes array is required', () => {
      const mockHandler = jest.fn();
      const mockClass = jest.fn();
      const mockExecutionContext = {
        getHandler: jest.fn().mockReturnValue(mockHandler),
        getClass: jest.fn().mockReturnValue(mockClass),
        switchToHttp: jest.fn(() => ({
          getRequest: jest.fn().mockReturnValue({}),
        })),
      };

      mockReflector.getAllAndOverride.mockReturnValue([]);

      const result = guard.canActivate(mockExecutionContext as any);

      expect(result).toBe(true);
    });

    it('should return true when user has all required scopes via permissions', () => {
      const mockHandler = jest.fn();
      const mockClass = jest.fn();
      const mockRequest = {
        user: {
          permissions: ['read:users', 'write:users', 'delete:users'],
        },
      };
      const mockExecutionContext = {
        getHandler: jest.fn().mockReturnValue(mockHandler),
        getClass: jest.fn().mockReturnValue(mockClass),
        switchToHttp: jest.fn(() => ({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        })),
      };

      mockReflector.getAllAndOverride.mockReturnValue(['read:users', 'write:users']);

      const result = guard.canActivate(mockExecutionContext as any);

      expect(result).toBe(true);
    });

    it('should return true when user has all required scopes via scope string', () => {
      const mockHandler = jest.fn();
      const mockClass = jest.fn();
      const mockRequest = {
        user: {
          scope: 'read:users write:users delete:users',
        },
      };
      const mockExecutionContext = {
        getHandler: jest.fn().mockReturnValue(mockHandler),
        getClass: jest.fn().mockReturnValue(mockClass),
        switchToHttp: jest.fn(() => ({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        })),
      };

      mockReflector.getAllAndOverride.mockReturnValue(['read:users', 'write:users']);

      const result = guard.canActivate(mockExecutionContext as any);

      expect(result).toBe(true);
    });

    it('should return true when user has all required scopes via both permissions and scope', () => {
      const mockHandler = jest.fn();
      const mockClass = jest.fn();
      const mockRequest = {
        user: {
          permissions: ['read:users'],
          scope: 'write:users delete:users',
        },
      };
      const mockExecutionContext = {
        getHandler: jest.fn().mockReturnValue(mockHandler),
        getClass: jest.fn().mockReturnValue(mockClass),
        switchToHttp: jest.fn(() => ({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        })),
      };

      mockReflector.getAllAndOverride.mockReturnValue(['read:users', 'write:users', 'delete:users']);

      const result = guard.canActivate(mockExecutionContext as any);

      expect(result).toBe(true);
    });

    it('should return false when user is missing required scopes', () => {
      const mockHandler = jest.fn();
      const mockClass = jest.fn();
      const mockRequest = {
        user: {
          permissions: ['read:users'],
          scope: 'write:users',
        },
      };
      const mockExecutionContext = {
        getHandler: jest.fn().mockReturnValue(mockHandler),
        getClass: jest.fn().mockReturnValue(mockClass),
        switchToHttp: jest.fn(() => ({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        })),
      };

      mockReflector.getAllAndOverride.mockReturnValue(['read:users', 'write:users', 'delete:users']);

      const result = guard.canActivate(mockExecutionContext as any);

      expect(result).toBe(false);
    });

    it('should return false when user has no permissions or scope', () => {
      const mockHandler = jest.fn();
      const mockClass = jest.fn();
      const mockRequest = {
        user: {},
      };
      const mockExecutionContext = {
        getHandler: jest.fn().mockReturnValue(mockHandler),
        getClass: jest.fn().mockReturnValue(mockClass),
        switchToHttp: jest.fn(() => ({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        })),
      };

      mockReflector.getAllAndOverride.mockReturnValue(['read:users']);

      const result = guard.canActivate(mockExecutionContext as any);

      expect(result).toBe(false);
    });

    it('should return false when user is undefined', () => {
      const mockHandler = jest.fn();
      const mockClass = jest.fn();
      const mockRequest = {};
      const mockExecutionContext = {
        getHandler: jest.fn().mockReturnValue(mockHandler),
        getClass: jest.fn().mockReturnValue(mockClass),
        switchToHttp: jest.fn(() => ({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        })),
      };

      mockReflector.getAllAndOverride.mockReturnValue(['read:users']);

      const result = guard.canActivate(mockExecutionContext as any);

      expect(result).toBe(false);
    });

    it('should handle scope string with extra spaces', () => {
      const mockHandler = jest.fn();
      const mockClass = jest.fn();
      const mockRequest = {
        user: {
          scope: '  read:users  write:users  ',
        },
      };
      const mockExecutionContext = {
        getHandler: jest.fn().mockReturnValue(mockHandler),
        getClass: jest.fn().mockReturnValue(mockClass),
        switchToHttp: jest.fn(() => ({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        })),
      };

      mockReflector.getAllAndOverride.mockReturnValue(['read:users', 'write:users']);

      const result = guard.canActivate(mockExecutionContext as any);

      expect(result).toBe(true);
    });

    it('should handle empty scope string', () => {
      const mockHandler = jest.fn();
      const mockClass = jest.fn();
      const mockRequest = {
        user: {
          scope: '',
        },
      };
      const mockExecutionContext = {
        getHandler: jest.fn().mockReturnValue(mockHandler),
        getClass: jest.fn().mockReturnValue(mockClass),
        switchToHttp: jest.fn(() => ({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        })),
      };

      mockReflector.getAllAndOverride.mockReturnValue(['read:users']);

      const result = guard.canActivate(mockExecutionContext as any);

      expect(result).toBe(false);
    });

    it('should handle scope string with only spaces', () => {
      const mockHandler = jest.fn();
      const mockClass = jest.fn();
      const mockRequest = {
        user: {
          scope: '   ',
        },
      };
      const mockExecutionContext = {
        getHandler: jest.fn().mockReturnValue(mockHandler),
        getClass: jest.fn().mockReturnValue(mockClass),
        switchToHttp: jest.fn(() => ({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        })),
      };

      mockReflector.getAllAndOverride.mockReturnValue(['read:users']);

      const result = guard.canActivate(mockExecutionContext as any);

      expect(result).toBe(false);
    });
  });

  describe('reflector integration', () => {
    it('should call reflector with correct parameters', () => {
      const mockHandler = jest.fn();
      const mockClass = jest.fn();
      const mockExecutionContext = {
        getHandler: jest.fn().mockReturnValue(mockHandler),
        getClass: jest.fn().mockReturnValue(mockClass),
        switchToHttp: jest.fn(() => ({
          getRequest: jest.fn().mockReturnValue({}),
        })),
      };

      mockReflector.getAllAndOverride.mockReturnValue(['read:users']);

      guard.canActivate(mockExecutionContext as any);

      expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(SCOPES_KEY, [mockHandler, mockClass]);
    });

    it('should handle reflector returning null', () => {
      const mockHandler = jest.fn();
      const mockClass = jest.fn();
      const mockExecutionContext = {
        getHandler: jest.fn().mockReturnValue(mockHandler),
        getClass: jest.fn().mockReturnValue(mockClass),
        switchToHttp: jest.fn(() => ({
          getRequest: jest.fn().mockReturnValue({}),
        })),
      };

      mockReflector.getAllAndOverride.mockReturnValue(null);

      const result = guard.canActivate(mockExecutionContext as any);

      expect(result).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle user with null permissions', () => {
      const mockHandler = jest.fn();
      const mockClass = jest.fn();
      const mockRequest = {
        user: {
          permissions: null,
          scope: 'read:users',
        },
      };
      const mockExecutionContext = {
        getHandler: jest.fn().mockReturnValue(mockHandler),
        getClass: jest.fn().mockReturnValue(mockClass),
        switchToHttp: jest.fn(() => ({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        })),
      };

      mockReflector.getAllAndOverride.mockReturnValue(['read:users']);

      const result = guard.canActivate(mockExecutionContext as any);

      expect(result).toBe(true);
    });

    it('should handle user with undefined permissions', () => {
      const mockHandler = jest.fn();
      const mockClass = jest.fn();
      const mockRequest = {
        user: {
          permissions: undefined,
          scope: 'read:users',
        },
      };
      const mockExecutionContext = {
        getHandler: jest.fn().mockReturnValue(mockHandler),
        getClass: jest.fn().mockReturnValue(mockClass),
        switchToHttp: jest.fn(() => ({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        })),
      };

      mockReflector.getAllAndOverride.mockReturnValue(['read:users']);

      const result = guard.canActivate(mockExecutionContext as any);

      expect(result).toBe(true);
    });

    it('should handle user with null scope', () => {
      const mockHandler = jest.fn();
      const mockClass = jest.fn();
      const mockRequest = {
        user: {
          permissions: ['read:users'],
          scope: null,
        },
      };
      const mockExecutionContext = {
        getHandler: jest.fn().mockReturnValue(mockHandler),
        getClass: jest.fn().mockReturnValue(mockClass),
        switchToHttp: jest.fn(() => ({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        })),
      };

      mockReflector.getAllAndOverride.mockReturnValue(['read:users']);

      const result = guard.canActivate(mockExecutionContext as any);

      expect(result).toBe(true);
    });

    it('should handle user with undefined scope', () => {
      const mockHandler = jest.fn();
      const mockClass = jest.fn();
      const mockRequest = {
        user: {
          permissions: ['read:users'],
          scope: undefined,
        },
      };
      const mockExecutionContext = {
        getHandler: jest.fn().mockReturnValue(mockHandler),
        getClass: jest.fn().mockReturnValue(mockClass),
        switchToHttp: jest.fn(() => ({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        })),
      };

      mockReflector.getAllAndOverride.mockReturnValue(['read:users']);

      const result = guard.canActivate(mockExecutionContext as any);

      expect(result).toBe(true);
    });
  });
});
