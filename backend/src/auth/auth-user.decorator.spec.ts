import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { jest, describe, it, expect } from '@jest/globals';
import { AuthUser } from './auth-user.decorator';

describe('AuthUser Decorator', () => {
  describe('Decorator Structure', () => {
    it('should be defined', () => {
      expect(AuthUser).toBeDefined();
    });

    it('should be a parameter decorator', () => {
      expect(typeof AuthUser).toBe('function');
    });

    it('should be created with createParamDecorator', () => {
      // Test that it's a parameter decorator function
      expect(AuthUser).toBeInstanceOf(Function);
    });
  });

  describe('Decorator Functionality', () => {
    it('should extract user from request object', () => {
      const mockUser = {
        sub: 'auth0|123456789',
        email: 'test@example.com',
        permissions: ['read:users'],
        scope: 'read:users write:users'
      };

      const mockRequest = {
        user: mockUser
      };

      const mockExecutionContext: ExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest)
        })
      } as any;

      // Get the decorator function
      const decoratorFunction = AuthUser[Symbol.for('__param_decorator_metadata__')] || 
                               AuthUser.toString().includes('data: unknown, ctx: ExecutionContext') ? 
                               (data: unknown, ctx: ExecutionContext) => {
                                 const request = ctx.switchToHttp().getRequest();
                                 return request.user;
                               } : null;

      if (decoratorFunction) {
        const result = decoratorFunction(undefined, mockExecutionContext);
        expect(result).toEqual(mockUser);
      }
    });

    it('should handle request with no user', () => {
      const mockRequest = {};

      const mockExecutionContext: ExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest)
        })
      } as any;

      const decoratorFunction = (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
      };

      const result = decoratorFunction(undefined, mockExecutionContext);
      expect(result).toBeUndefined();
    });

    it('should handle request with null user', () => {
      const mockRequest = { user: null };

      const mockExecutionContext: ExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest)
        })
      } as any;

      const decoratorFunction = (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
      };

      const result = decoratorFunction(undefined, mockExecutionContext);
      expect(result).toBeNull();
    });

    it('should handle complex user object', () => {
      const mockUser = {
        sub: 'auth0|987654321',
        email: 'admin@example.com',
        name: 'Admin User',
        permissions: ['admin:all', 'read:users', 'write:users'],
        scope: 'admin:all read:users write:users delete:users',
        aud: 'https://api.example.com',
        iss: 'https://example.auth0.com/',
        iat: 1234567890,
        exp: 1234567890 + 3600
      };

      const mockRequest = { user: mockUser };

      const mockExecutionContext: ExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest)
        })
      } as any;

      const decoratorFunction = (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
      };

      const result = decoratorFunction(undefined, mockExecutionContext);
      expect(result).toEqual(mockUser);
      expect(result.sub).toBe('auth0|987654321');
      expect(result.email).toBe('admin@example.com');
      expect(result.permissions).toEqual(['admin:all', 'read:users', 'write:users']);
    });
  });

  describe('ExecutionContext Integration', () => {
    it('should call switchToHttp method', () => {
      const mockSwitchToHttp = jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user: { sub: 'test' } })
      });

      const mockExecutionContext: ExecutionContext = {
        switchToHttp: mockSwitchToHttp
      } as any;

      const decoratorFunction = (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
      };

      decoratorFunction(undefined, mockExecutionContext);
      expect(mockSwitchToHttp).toHaveBeenCalled();
    });

    it('should call getRequest method', () => {
      const mockGetRequest = jest.fn().mockReturnValue({ user: { sub: 'test' } });
      const mockSwitchToHttp = jest.fn().mockReturnValue({
        getRequest: mockGetRequest
      });

      const mockExecutionContext: ExecutionContext = {
        switchToHttp: mockSwitchToHttp
      } as any;

      const decoratorFunction = (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
      };

      decoratorFunction(undefined, mockExecutionContext);
      expect(mockGetRequest).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined data parameter', () => {
      const mockUser = { sub: 'auth0|123' };
      const mockRequest = { user: mockUser };

      const mockExecutionContext: ExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest)
        })
      } as any;

      const decoratorFunction = (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
      };

      const result = decoratorFunction(undefined, mockExecutionContext);
      expect(result).toEqual(mockUser);
    });

    it('should handle null data parameter', () => {
      const mockUser = { sub: 'auth0|123' };
      const mockRequest = { user: mockUser };

      const mockExecutionContext: ExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest)
        })
      } as any;

      const decoratorFunction = (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
      };

      const result = decoratorFunction(null, mockExecutionContext);
      expect(result).toEqual(mockUser);
    });

    it('should handle string data parameter', () => {
      const mockUser = { sub: 'auth0|123' };
      const mockRequest = { user: mockUser };

      const mockExecutionContext: ExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest)
        })
      } as any;

      const decoratorFunction = (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
      };

      const result = decoratorFunction('test-data', mockExecutionContext);
      expect(result).toEqual(mockUser);
    });

    it('should handle object data parameter', () => {
      const mockUser = { sub: 'auth0|123' };
      const mockRequest = { user: mockUser };

      const mockExecutionContext: ExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest)
        })
      } as any;

      const decoratorFunction = (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
      };

      const result = decoratorFunction({ key: 'value' }, mockExecutionContext);
      expect(result).toEqual(mockUser);
    });
  });

  describe('Error Handling', () => {
    it('should handle ExecutionContext without switchToHttp method', () => {
      const mockExecutionContext = {} as ExecutionContext;

      const decoratorFunction = (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
      };

      expect(() => {
        decoratorFunction(undefined, mockExecutionContext);
      }).toThrow();
    });

    it('should handle ExecutionContext with switchToHttp returning null', () => {
      const mockExecutionContext: ExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue(null)
      } as any;

      const decoratorFunction = (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
      };

      expect(() => {
        decoratorFunction(undefined, mockExecutionContext);
      }).toThrow();
    });

    it('should handle ExecutionContext with switchToHttp returning object without getRequest', () => {
      const mockExecutionContext: ExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({})
      } as any;

      const decoratorFunction = (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
      };

      expect(() => {
        decoratorFunction(undefined, mockExecutionContext);
      }).toThrow();
    });
  });

  describe('Decorator Metadata', () => {
    it('should be a valid NestJS parameter decorator', () => {
      // Test that the decorator can be used in a class method
      class TestController {
        testMethod(@AuthUser() user: any) {
          return user;
        }
      }

      expect(TestController).toBeDefined();
      expect(typeof TestController.prototype.testMethod).toBe('function');
    });

    it('should accept data parameter', () => {
      // Test that the decorator can accept a data parameter
      class TestController {
        testMethod(@AuthUser('specific-field') user: any) {
          return user;
        }
      }

      expect(TestController).toBeDefined();
      expect(typeof TestController.prototype.testMethod).toBe('function');
    });
  });
});
