import { Test, TestingModule } from '@nestjs/testing';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

// Mock jwks-rsa
jest.mock('jwks-rsa', () => ({
  passportJwtSecret: jest.fn().mockReturnValue('mock-secret-provider')
}));

// Mock passport-jwt
jest.mock('passport-jwt', () => ({
  Strategy: jest.fn().mockImplementation(() => {}),
  ExtractJwt: {
    fromAuthHeaderAsBearerToken: jest.fn().mockReturnValue('mock-extractor')
  }
}));

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn()
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    // Set up default mock config values
    mockConfigService.get.mockImplementation((key: string) => {
      if (key === 'AUTH0_ISSUER_URL') return 'https://test.auth0.com/';
      if (key === 'AUTH0_AUDIENCE') return 'https://api.test.com';
      return undefined;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService
        }
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('Class Structure', () => {
    it('should be defined', () => {
      expect(JwtStrategy).toBeDefined();
    });

    it('should be a class', () => {
      expect(typeof JwtStrategy).toBe('function');
    });

    it('should be instantiable', () => {
      expect(strategy).toBeInstanceOf(JwtStrategy);
    });

    it('should have logger property', () => {
      expect(strategy['logger']).toBeDefined();
    });

    it('should have config property', () => {
      expect(strategy['config']).toBeDefined();
    });
  });

  describe('Constructor', () => {
    it('should initialize with valid config', () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'AUTH0_ISSUER_URL') return 'https://test.auth0.com/';
        if (key === 'AUTH0_AUDIENCE') return 'https://api.test.com';
        return undefined;
      });

      expect(() => {
        new JwtStrategy(configService);
      }).not.toThrow();
    });

    it('should throw error when AUTH0_ISSUER_URL is missing', () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'AUTH0_ISSUER_URL') return undefined;
        if (key === 'AUTH0_AUDIENCE') return 'https://api.test.com';
        return undefined;
      });

      expect(() => {
        new JwtStrategy(configService);
      }).toThrow('AUTH0_ISSUER_URL or AUTH0_AUDIENCE is not set');
    });

    it('should throw error when AUTH0_AUDIENCE is missing', () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'AUTH0_ISSUER_URL') return 'https://test.auth0.com/';
        if (key === 'AUTH0_AUDIENCE') return undefined;
        return undefined;
      });

      expect(() => {
        new JwtStrategy(configService);
      }).toThrow('AUTH0_ISSUER_URL or AUTH0_AUDIENCE is not set');
    });

    it('should throw error when both config values are missing', () => {
      mockConfigService.get.mockReturnValue(undefined);

      expect(() => {
        new JwtStrategy(configService);
      }).toThrow('AUTH0_ISSUER_URL or AUTH0_AUDIENCE is not set');
    });

    it('should call config.get with correct keys', () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'AUTH0_ISSUER_URL') return 'https://test.auth0.com/';
        if (key === 'AUTH0_AUDIENCE') return 'https://api.test.com';
        return undefined;
      });

      new JwtStrategy(configService);

      expect(mockConfigService.get).toHaveBeenCalledWith('AUTH0_ISSUER_URL');
      expect(mockConfigService.get).toHaveBeenCalledWith('AUTH0_AUDIENCE');
    });
  });

  describe('validate method', () => {
    beforeEach(() => {
      // Mock the logger methods
      strategy['logger'] = {
        log: jest.fn(),
        error: jest.fn()
      } as any;
    });

    it('should validate JWT payload successfully', async () => {
      const mockPayload = {
        sub: 'auth0|123456789',
        email: 'test@example.com',
        aud: 'https://api.test.com',
        iss: 'https://test.auth0.com/',
        iat: 1234567890,
        exp: 1234567890 + 3600
      };

      const result = await strategy.validate(mockPayload);

      expect(result).toEqual(mockPayload);
      expect(strategy['logger'].log).toHaveBeenCalledWith(
        `Validating JWT for auth0_sub: ${mockPayload.sub}, email: ${mockPayload.email}`
      );
      expect(strategy['logger'].log).toHaveBeenCalledWith(
        `JWT payload: ${JSON.stringify(mockPayload, null, 2)}`
      );
      expect(strategy['logger'].log).toHaveBeenCalledWith(
        `JWT validation successful for auth0_sub: ${mockPayload.sub}`
      );
    });

    it('should throw error when sub claim is missing', async () => {
      const mockPayload = {
        email: 'test@example.com',
        aud: 'https://api.test.com',
        iss: 'https://test.auth0.com/'
      };

      await expect(strategy.validate(mockPayload)).rejects.toThrow(
        'No sub claim found in JWT payload'
      );
    });

    it('should throw error when sub claim is null', async () => {
      const mockPayload = {
        sub: null,
        email: 'test@example.com',
        aud: 'https://api.test.com',
        iss: 'https://test.auth0.com/'
      };

      await expect(strategy.validate(mockPayload)).rejects.toThrow(
        'No sub claim found in JWT payload'
      );
    });

    it('should throw error when sub claim is undefined', async () => {
      const mockPayload = {
        sub: undefined,
        email: 'test@example.com',
        aud: 'https://api.test.com',
        iss: 'https://test.auth0.com/'
      };

      await expect(strategy.validate(mockPayload)).rejects.toThrow(
        'No sub claim found in JWT payload'
      );
    });

    it('should handle payload with empty sub string', async () => {
      const mockPayload = {
        sub: '',
        email: 'test@example.com',
        aud: 'https://api.test.com',
        iss: 'https://test.auth0.com/'
      };

      await expect(strategy.validate(mockPayload)).rejects.toThrow(
        'No sub claim found in JWT payload'
      );
    });

    it('should handle payload without email', async () => {
      const mockPayload = {
        sub: 'auth0|123456789',
        aud: 'https://api.test.com',
        iss: 'https://test.auth0.com/'
      };

      const result = await strategy.validate(mockPayload);

      expect(result).toEqual(mockPayload);
      expect(strategy['logger'].log).toHaveBeenCalledWith(
        `Validating JWT for auth0_sub: ${mockPayload.sub}, email: ${undefined}`
      );
    });

    it('should handle complex payload structure', async () => {
      const mockPayload = {
        sub: 'auth0|987654321',
        email: 'admin@example.com',
        name: 'Admin User',
        permissions: ['admin:all', 'read:users'],
        scope: 'admin:all read:users',
        aud: 'https://api.test.com',
        iss: 'https://test.auth0.com/',
        iat: 1234567890,
        exp: 1234567890 + 3600,
        customClaim: 'custom-value'
      };

      const result = await strategy.validate(mockPayload);

      expect(result).toEqual(mockPayload);
      expect(result.sub).toBe('auth0|987654321');
      expect(result.email).toBe('admin@example.com');
      expect(result.permissions).toEqual(['admin:all', 'read:users']);
    });

    it('should log error and rethrow when validation fails', async () => {
      const mockPayload = {
        email: 'test@example.com',
        aud: 'https://api.test.com',
        iss: 'https://test.auth0.com/'
      };

      await expect(strategy.validate(mockPayload)).rejects.toThrow(
        'No sub claim found in JWT payload'
      );

      expect(strategy['logger'].error).toHaveBeenCalledWith(
        expect.stringContaining('Error in JWT validation: No sub claim found in JWT payload'),
        expect.any(String)
      );
    });

    it('should handle validation with different sub formats', async () => {
      const testCases = [
        'auth0|123456789',
        'google-oauth2|987654321',
        'facebook|111222333',
        'twitter|444555666',
        'github|777888999'
      ];

      for (const sub of testCases) {
        const mockPayload = {
          sub,
          email: 'test@example.com'
        };

        const result = await strategy.validate(mockPayload);
        expect(result.sub).toBe(sub);
      }
    });

    it('should handle payload with special characters in sub', async () => {
      const mockPayload = {
        sub: 'auth0|123456789-abcdef|special',
        email: 'test@example.com'
      };

      const result = await strategy.validate(mockPayload);
      expect(result.sub).toBe('auth0|123456789-abcdef|special');
    });

    it('should handle payload with numeric sub', async () => {
      const mockPayload = {
        sub: '123456789',
        email: 'test@example.com'
      };

      const result = await strategy.validate(mockPayload);
      expect(result.sub).toBe('123456789');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      strategy['logger'] = {
        log: jest.fn(),
        error: jest.fn()
      } as any;
    });

    it('should handle validation errors gracefully', async () => {
      const mockPayload = {};

      await expect(strategy.validate(mockPayload)).rejects.toThrow();

      expect(strategy['logger'].error).toHaveBeenCalledWith(
        expect.stringContaining('Error in JWT validation:'),
        expect.any(String)
      );
    });

    it('should handle payload with invalid structure', async () => {
      const mockPayload = {
        sub: 123, // Invalid type
        email: 'test@example.com'
      };

      const result = await strategy.validate(mockPayload);
      expect(result).toEqual(mockPayload);
    });
  });

  describe('Logging', () => {
    beforeEach(() => {
      strategy['logger'] = {
        log: jest.fn(),
        error: jest.fn()
      } as any;
    });

    it('should log validation start', async () => {
      const mockPayload = {
        sub: 'auth0|123456789',
        email: 'test@example.com'
      };

      await strategy.validate(mockPayload);

      expect(strategy['logger'].log).toHaveBeenCalledWith(
        `Validating JWT for auth0_sub: ${mockPayload.sub}, email: ${mockPayload.email}`
      );
    });

    it('should log payload details', async () => {
      const mockPayload = {
        sub: 'auth0|123456789',
        email: 'test@example.com'
      };

      await strategy.validate(mockPayload);

      expect(strategy['logger'].log).toHaveBeenCalledWith(
        `JWT payload: ${JSON.stringify(mockPayload, null, 2)}`
      );
    });

    it('should log successful validation', async () => {
      const mockPayload = {
        sub: 'auth0|123456789',
        email: 'test@example.com'
      };

      await strategy.validate(mockPayload);

      expect(strategy['logger'].log).toHaveBeenCalledWith(
        `JWT validation successful for auth0_sub: ${mockPayload.sub}`
      );
    });

    it('should log error details when validation fails', async () => {
      const mockPayload = {};

      await expect(strategy.validate(mockPayload)).rejects.toThrow();

      expect(strategy['logger'].error).toHaveBeenCalledWith(
        expect.stringContaining('Error in JWT validation:'),
        expect.any(String)
      );
    });
  });
});
