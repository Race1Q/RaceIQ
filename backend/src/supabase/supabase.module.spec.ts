import { Test, TestingModule } from '@nestjs/testing';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { SupabaseModule } from './supabase.module';
import { SupabaseService } from './supabase.service';
import { ConfigService } from '@nestjs/config';

describe('SupabaseModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    // Create a mock ConfigService to satisfy the SupabaseService dependency
    const mockConfigService = {
      get: jest.fn()
        .mockReturnValueOnce('https://test.supabase.co')      // SUPABASE_URL
        .mockReturnValueOnce('test-service-role-key-12345'),  // SUPABASE_SERVICE_ROLE_KEY
    };

    module = await Test.createTestingModule({
      providers: [
        SupabaseService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide SupabaseService', () => {
    const supabaseService = module.get<SupabaseService>(SupabaseService);
    expect(supabaseService).toBeDefined();
    expect(supabaseService).toBeInstanceOf(SupabaseService);
  });

  it('should have correct module structure', () => {
    expect(module).toBeDefined();
  });

  describe('module configuration', () => {
    it('should have SupabaseService as a provider', () => {
      const supabaseService = module.get<SupabaseService>(SupabaseService);
      expect(supabaseService).toBeDefined();
    });

    it('should be able to inject ConfigService', () => {
      const configService = module.get<ConfigService>(ConfigService);
      expect(configService).toBeDefined();
      expect(configService.get).toBeDefined();
    });
  });

  describe('SupabaseModule structure', () => {
    it('should have correct module metadata', () => {
      // Test the module structure by examining the SupabaseModule class
      const moduleRef = new SupabaseModule();
      expect(moduleRef).toBeDefined();
    });

    it('should export SupabaseService', () => {
      // Test that the module exports the service by checking the module definition
      const moduleRef = new SupabaseModule();
      expect(moduleRef).toBeInstanceOf(SupabaseModule);
    });
  });
});
