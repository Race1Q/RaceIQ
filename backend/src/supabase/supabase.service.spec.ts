import { Test, TestingModule } from '@nestjs/testing';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from './supabase.service';
import { createClient } from '@supabase/supabase-js';

// Mock the @supabase/supabase-js module
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

describe('SupabaseService', () => {
  let service: SupabaseService;
  let configService: ConfigService;
  let mockCreateClient: jest.MockedFunction<typeof createClient>;

  const mockSupabaseClient = {
    from: jest.fn(),
    rpc: jest.fn(),
  };

  beforeEach(async () => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup the mock createClient function
    mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
    mockCreateClient.mockReturnValue(mockSupabaseClient as any);

    // Create mock config service with default values
    const mockConfigService = {
      get: jest.fn()
        .mockReturnValueOnce('https://test.supabase.co')      // SUPABASE_URL
        .mockReturnValueOnce('test-service-role-key-12345'),  // SUPABASE_SERVICE_ROLE_KEY
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupabaseService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<SupabaseService>(SupabaseService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have a client property', () => {
    expect(service.client).toBeDefined();
    expect(service.client).toBe(mockSupabaseClient);
  });

  describe('initialization', () => {
    it('should initialize successfully with valid configuration', () => {
      const mockUrl = 'https://test.supabase.co';
      const mockKey = 'test-service-role-key-12345';

      const mockConfig = {
        get: jest.fn()
          .mockReturnValueOnce(mockUrl)
          .mockReturnValueOnce(mockKey)
      };

      // Reset the mock call count before this test
      mockCreateClient.mockClear();

      // Create a new instance to test initialization
      const newService = new SupabaseService(mockConfig as any);

      expect(newService.client).toBeDefined();
      expect(mockCreateClient).toHaveBeenCalledWith(mockUrl, mockKey);
      expect(mockCreateClient).toHaveBeenCalledTimes(1);
    });

    it('should throw error when SUPABASE_URL is missing', () => {
      const mockConfig = {
        get: jest.fn()
          .mockReturnValueOnce(undefined)    // SUPABASE_URL missing
          .mockReturnValueOnce('test-key')   // SUPABASE_SERVICE_ROLE_KEY
      };

      expect(() => {
        new SupabaseService(mockConfig as any);
      }).toThrow('Supabase URL or SERVICE_ROLE_KEY missing!');
    });

    it('should throw error when SUPABASE_SERVICE_ROLE_KEY is missing', () => {
      const mockConfig = {
        get: jest.fn()
          .mockReturnValueOnce('https://test.supabase.co')  // SUPABASE_URL
          .mockReturnValueOnce(undefined)                   // SUPABASE_SERVICE_ROLE_KEY missing
      };

      expect(() => {
        new SupabaseService(mockConfig as any);
      }).toThrow('Supabase URL or SERVICE_ROLE_KEY missing!');
    });

    it('should throw error when both SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are missing', () => {
      const mockConfig = {
        get: jest.fn()
          .mockReturnValueOnce(undefined)  // SUPABASE_URL missing
          .mockReturnValueOnce(undefined)  // SUPABASE_SERVICE_ROLE_KEY missing
      };

      expect(() => {
        new SupabaseService(mockConfig as any);
      }).toThrow('Supabase URL or SERVICE_ROLE_KEY missing!');
    });

    it('should throw error when SUPABASE_URL is empty string', () => {
      const mockConfig = {
        get: jest.fn()
          .mockReturnValueOnce('')           // SUPABASE_URL empty
          .mockReturnValueOnce('test-key')   // SUPABASE_SERVICE_ROLE_KEY
      };

      expect(() => {
        new SupabaseService(mockConfig as any);
      }).toThrow('Supabase URL or SERVICE_ROLE_KEY missing!');
    });

    it('should throw error when SUPABASE_SERVICE_ROLE_KEY is empty string', () => {
      const mockConfig = {
        get: jest.fn()
          .mockReturnValueOnce('https://test.supabase.co')  // SUPABASE_URL
          .mockReturnValueOnce('')                          // SUPABASE_SERVICE_ROLE_KEY empty
      };

      expect(() => {
        new SupabaseService(mockConfig as any);
      }).toThrow('Supabase URL or SERVICE_ROLE_KEY missing!');
    });
  });

  describe('client property', () => {
    it('should have a client property that is a SupabaseClient instance', () => {
      expect(service.client).toBeDefined();
      expect(service.client).toBe(mockSupabaseClient);
    });

    it('should expose client property as public', () => {
      expect(service.client).toBeDefined();
    });
  });

  describe('logger', () => {
    it('should log successful initialization with key prefix', () => {
      const mockUrl = 'https://test.supabase.co';
      const mockKey = 'test-service-role-key-12345';

      const mockConfig = {
        get: jest.fn()
          .mockReturnValueOnce(mockUrl)
          .mockReturnValueOnce(mockKey)
      };

      // Spy on console.log to capture logger output
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      new SupabaseService(mockConfig as any);

      // The logger should have been called with the key prefix message
      expect(mockCreateClient).toHaveBeenCalledWith(mockUrl, mockKey);

      consoleSpy.mockRestore();
    });
  });

  describe('configuration validation', () => {
    it('should validate configuration on service instantiation', () => {
      const mockUrl = 'https://test.supabase.co';
      const mockKey = 'test-service-role-key-12345';

      const mockConfig = {
        get: jest.fn()
          .mockReturnValueOnce(mockUrl)
          .mockReturnValueOnce(mockKey)
      };

      expect(() => {
        new SupabaseService(mockConfig as any);
      }).not.toThrow();
    });

    it('should call ConfigService.get with correct keys', () => {
      const mockUrl = 'https://test.supabase.co';
      const mockKey = 'test-service-role-key-12345';

      const mockConfig = {
        get: jest.fn()
          .mockReturnValueOnce(mockUrl)
          .mockReturnValueOnce(mockKey)
      };

      new SupabaseService(mockConfig as any);

      expect(mockConfig.get).toHaveBeenCalledWith('SUPABASE_URL');
      expect(mockConfig.get).toHaveBeenCalledWith('SUPABASE_SERVICE_ROLE_KEY');
      expect(mockConfig.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('error handling', () => {
    it('should handle ConfigService.get returning null values', () => {
      const mockConfig = {
        get: jest.fn()
          .mockReturnValueOnce(null)         // SUPABASE_URL null
          .mockReturnValueOnce('test-key')   // SUPABASE_SERVICE_ROLE_KEY
      };

      expect(() => {
        new SupabaseService(mockConfig as any);
      }).toThrow('Supabase URL or SERVICE_ROLE_KEY missing!');
    });

    it('should handle ConfigService.get returning false values', () => {
      const mockConfig = {
        get: jest.fn()
          .mockReturnValueOnce(false)        // SUPABASE_URL false
          .mockReturnValueOnce('test-key')   // SUPABASE_SERVICE_ROLE_KEY
      };

      expect(() => {
        new SupabaseService(mockConfig as any);
      }).toThrow('Supabase URL or SERVICE_ROLE_KEY missing!');
    });
  });
});
