import { Test, TestingModule } from '@nestjs/testing';
import { PersistentCacheService } from './persistent-cache.service';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

// Mock fs/promises and fs modules
jest.mock('fs/promises');
jest.mock('fs');

describe('PersistentCacheService', () => {
  let service: PersistentCacheService;

  beforeEach(async () => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock existsSync to return false by default (no cache file)
    (existsSync as jest.Mock).mockReturnValue(false);

    const module: TestingModule = await Test.createTestingModule({
      providers: [PersistentCacheService],
    }).compile();

    service = module.get<PersistentCacheService>(PersistentCacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should load cache from disk if file exists', async () => {
      const mockCacheData = {
        'test-key': {
          data: 'test-value',
          expiresAt: Date.now() + 10000, // Future expiry
        },
      };

      (existsSync as jest.Mock).mockReturnValue(true);
      (readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockCacheData));

      await service.onModuleInit();

      expect(readFile).toHaveBeenCalled();
      expect(service.get('test-key')).toBe('test-value');
    });

    it('should skip expired entries when loading from disk', async () => {
      const mockCacheData = {
        'expired-key': {
          data: 'expired-value',
          expiresAt: Date.now() - 10000, // Past expiry
        },
        'valid-key': {
          data: 'valid-value',
          expiresAt: Date.now() + 10000, // Future expiry
        },
      };

      (existsSync as jest.Mock).mockReturnValue(true);
      (readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockCacheData));

      await service.onModuleInit();

      expect(service.get('expired-key')).toBeNull();
      expect(service.get('valid-key')).toBe('valid-value');
    });

    it('should handle missing cache file gracefully', async () => {
      (existsSync as jest.Mock).mockReturnValue(false);

      await service.onModuleInit();

      expect(readFile).not.toHaveBeenCalled();
    });

    it('should handle corrupted cache file gracefully', async () => {
      (existsSync as jest.Mock).mockReturnValue(true);
      (readFile as jest.Mock).mockResolvedValue('invalid json{{{');

      await service.onModuleInit();

      // Should not throw
      expect(service.getStats().size).toBe(0);
    });
  });

  describe('set', () => {
    it('should cache a value with TTL', async () => {
      (mkdir as jest.Mock).mockResolvedValue(undefined);
      (writeFile as jest.Mock).mockResolvedValue(undefined);
      (existsSync as jest.Mock).mockReturnValue(true);

      await service.set('test-key', 'test-value', 3600);

      const value = service.get('test-key');
      expect(value).toBe('test-value');
    });

    it('should persist to disk asynchronously', async () => {
      (mkdir as jest.Mock).mockResolvedValue(undefined);
      (writeFile as jest.Mock).mockResolvedValue(undefined);
      (existsSync as jest.Mock).mockReturnValue(true);

      await service.set('test-key', 'test-value', 3600);

      // Wait a bit for async persistence
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(writeFile).toHaveBeenCalled();
    });

    it('should handle persistence errors gracefully', async () => {
      (mkdir as jest.Mock).mockRejectedValue(new Error('Disk write error'));
      (existsSync as jest.Mock).mockReturnValue(false);

      // Should not throw
      await expect(service.set('test-key', 'test-value', 3600)).resolves.not.toThrow();
    });
  });

  describe('get', () => {
    beforeEach(async () => {
      (mkdir as jest.Mock).mockResolvedValue(undefined);
      (writeFile as jest.Mock).mockResolvedValue(undefined);
      (existsSync as jest.Mock).mockReturnValue(true);
    });

    it('should return cached value if not expired', async () => {
      await service.set('test-key', 'test-value', 3600);

      const value = service.get('test-key');
      expect(value).toBe('test-value');
    });

    it('should return null for non-existent key', () => {
      const value = service.get('non-existent');
      expect(value).toBeNull();
    });

    it('should return null for expired key', async () => {
      await service.set('test-key', 'test-value', -1); // Expired immediately

      const value = service.get('test-key');
      expect(value).toBeNull();
    });

    it('should return expired value when ignoreExpiry is true', async () => {
      await service.set('test-key', 'test-value', -1); // Expired immediately

      const value = service.get('test-key', true);
      expect(value).toBe('test-value');
    });

    it('should delete expired key on access', async () => {
      await service.set('test-key', 'test-value', -1); // Expired immediately

      service.get('test-key'); // Should delete the key

      const stats = service.getStats();
      expect(stats.keys).not.toContain('test-key');
    });
  });

  describe('has', () => {
    beforeEach(async () => {
      (mkdir as jest.Mock).mockResolvedValue(undefined);
      (writeFile as jest.Mock).mockResolvedValue(undefined);
      (existsSync as jest.Mock).mockReturnValue(true);
    });

    it('should return true for existing valid key', async () => {
      await service.set('test-key', 'test-value', 3600);

      expect(service.has('test-key')).toBe(true);
    });

    it('should return false for non-existent key', () => {
      expect(service.has('non-existent')).toBe(false);
    });

    it('should return false for expired key', async () => {
      await service.set('test-key', 'test-value', -1); // Expired immediately

      expect(service.has('test-key')).toBe(false);
    });
  });

  describe('delete', () => {
    beforeEach(async () => {
      (mkdir as jest.Mock).mockResolvedValue(undefined);
      (writeFile as jest.Mock).mockResolvedValue(undefined);
      (existsSync as jest.Mock).mockReturnValue(true);
    });

    it('should delete a cache key', async () => {
      await service.set('test-key', 'test-value', 3600);

      service.delete('test-key');

      expect(service.get('test-key')).toBeNull();
    });

    it('should handle deleting non-existent key', () => {
      expect(() => service.delete('non-existent')).not.toThrow();
    });
  });

  describe('clear', () => {
    beforeEach(async () => {
      (mkdir as jest.Mock).mockResolvedValue(undefined);
      (writeFile as jest.Mock).mockResolvedValue(undefined);
      (existsSync as jest.Mock).mockReturnValue(true);
    });

    it('should clear all cache entries', async () => {
      await service.set('key1', 'value1', 3600);
      await service.set('key2', 'value2', 3600);

      await service.clear();

      expect(service.get('key1')).toBeNull();
      expect(service.get('key2')).toBeNull();
      expect(service.getStats().size).toBe(0);
    });

    it('should persist empty cache to disk', async () => {
      await service.set('test-key', 'test-value', 3600);
      
      (writeFile as jest.Mock).mockClear();
      await service.clear();

      expect(writeFile).toHaveBeenCalled();
    });
  });

  describe('getStats', () => {
    beforeEach(async () => {
      (mkdir as jest.Mock).mockResolvedValue(undefined);
      (writeFile as jest.Mock).mockResolvedValue(undefined);
      (existsSync as jest.Mock).mockReturnValue(true);
    });

    it('should return cache statistics', async () => {
      await service.set('key1', 'value1', 3600);
      await service.set('key2', 'value2', 3600);

      const stats = service.getStats();

      expect(stats.size).toBe(2);
      expect(stats.keys).toContain('key1');
      expect(stats.keys).toContain('key2');
    });

    it('should return empty stats for empty cache', () => {
      const stats = service.getStats();

      expect(stats.size).toBe(0);
      expect(stats.keys).toEqual([]);
    });
  });
});

