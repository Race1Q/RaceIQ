import { Test, TestingModule } from '@nestjs/testing';
import { QuotaService } from './quota.service';

describe('QuotaService', () => {
  let service: QuotaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuotaService],
    }).compile();

    service = module.get<QuotaService>(QuotaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('increment', () => {
    it('should increment the daily count', () => {
      const initialRemaining = service.getRemaining();
      
      service.increment();
      
      expect(service.getRemaining()).toBe(initialRemaining - 1);
    });

    it('should increment multiple times', () => {
      const initialRemaining = service.getRemaining();
      
      service.increment();
      service.increment();
      service.increment();
      
      expect(service.getRemaining()).toBe(initialRemaining - 3);
    });
  });

  describe('getRemaining', () => {
    it('should return the correct remaining quota', () => {
      const stats = service.getStats();
      const remaining = service.getRemaining();
      
      expect(remaining).toBe(stats.limit - stats.used);
    });

    it('should decrease remaining quota after increment', () => {
      const initialRemaining = service.getRemaining();
      
      service.increment();
      
      expect(service.getRemaining()).toBe(initialRemaining - 1);
    });

    it('should not return negative values', () => {
      // Increment beyond the limit
      for (let i = 0; i < 2000; i++) {
        service.increment();
      }
      
      const remaining = service.getRemaining();
      expect(remaining).toBeGreaterThanOrEqual(0);
    });
  });

  describe('hasQuota', () => {
    it('should return true when quota is available', () => {
      expect(service.hasQuota()).toBe(true);
    });

    it('should return false when quota is exhausted', () => {
      // Exhaust the quota
      for (let i = 0; i < 1500; i++) {
        service.increment();
      }
      
      expect(service.hasQuota()).toBe(false);
    });

    it('should return true for one call before limit', () => {
      // Increment to just before the limit
      for (let i = 0; i < 1499; i++) {
        service.increment();
      }
      
      expect(service.hasQuota()).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should return correct initial stats', () => {
      const stats = service.getStats();
      
      expect(stats).toHaveProperty('used');
      expect(stats).toHaveProperty('remaining');
      expect(stats).toHaveProperty('limit');
      expect(stats).toHaveProperty('resetDate');
      expect(stats.limit).toBe(1500);
    });

    it('should update used count after increment', () => {
      const initialStats = service.getStats();
      
      service.increment();
      service.increment();
      
      const updatedStats = service.getStats();
      expect(updatedStats.used).toBe(initialStats.used + 2);
      expect(updatedStats.remaining).toBe(initialStats.remaining - 2);
    });

    it('should have correct relationship between used, remaining, and limit', () => {
      service.increment();
      service.increment();
      service.increment();
      
      const stats = service.getStats();
      expect(stats.used + stats.remaining).toBe(stats.limit);
    });

    it('should include resetDate as a string', () => {
      const stats = service.getStats();
      
      expect(typeof stats.resetDate).toBe('string');
      expect(stats.resetDate).toBeTruthy();
    });
  });

  describe('quota reset', () => {
    it('should reset quota on a new day', () => {
      // Increment some calls
      service.increment();
      service.increment();
      service.increment();
      
      const statsBeforeReset = service.getStats();
      expect(statsBeforeReset.used).toBe(3);
      
      // Mock the date to be tomorrow
      const originalToDateString = Date.prototype.toDateString;
      Date.prototype.toDateString = jest.fn(() => 'Tomorrow');
      
      const statsAfterReset = service.getStats();
      
      // Restore original method
      Date.prototype.toDateString = originalToDateString;
      
      expect(statsAfterReset.used).toBe(0);
      expect(statsAfterReset.remaining).toBe(statsAfterReset.limit);
    });
  });

  describe('logging behavior', () => {
    it('should handle increment without errors', () => {
      expect(() => {
        for (let i = 0; i < 100; i++) {
          service.increment();
        }
      }).not.toThrow();
    });

    it('should handle quota exhaustion gracefully', () => {
      expect(() => {
        for (let i = 0; i < 2000; i++) {
          service.increment();
        }
      }).not.toThrow();
      
      expect(service.hasQuota()).toBe(false);
      expect(service.getRemaining()).toBe(0);
    });
  });
});

