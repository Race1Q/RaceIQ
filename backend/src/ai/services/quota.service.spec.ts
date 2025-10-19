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
      
      expect(remaining).toBe(stats.daily.limit - stats.daily.used);
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
      // We need to mock time to avoid hitting minute limit
      const originalNow = Date.now;
      let mockTime = Date.now();
      Date.now = jest.fn(() => mockTime);
      
      // Increment to just before the limit, advancing time every minute
      for (let i = 0; i < 1499; i++) {
        // Every 14 calls, advance time by 1 minute to reset minute quota
        if (i > 0 && i % 14 === 0) {
          mockTime += 60000; // Add 1 minute
        }
        service.increment();
      }
      
      expect(service.hasQuota()).toBe(true);
      
      // Restore original Date.now
      Date.now = originalNow;
    });
  });

  describe('getStats', () => {
    it('should return correct initial stats', () => {
      const stats = service.getStats();
      
      expect(stats).toHaveProperty('daily');
      expect(stats).toHaveProperty('minute');
      expect(stats.daily).toHaveProperty('used');
      expect(stats.daily).toHaveProperty('remaining');
      expect(stats.daily).toHaveProperty('limit');
      expect(stats.daily).toHaveProperty('resetDate');
      expect(stats.daily.limit).toBe(1500);
      expect(stats.minute).toHaveProperty('used');
      expect(stats.minute).toHaveProperty('remaining');
      expect(stats.minute).toHaveProperty('limit');
      expect(stats.minute.limit).toBe(15);
    });

    it('should update used count after increment', () => {
      const initialStats = service.getStats();
      
      service.increment();
      service.increment();
      
      const updatedStats = service.getStats();
      expect(updatedStats.daily.used).toBe(initialStats.daily.used + 2);
      expect(updatedStats.daily.remaining).toBe(initialStats.daily.remaining - 2);
      expect(updatedStats.minute.used).toBe(initialStats.minute.used + 2);
      expect(updatedStats.minute.remaining).toBe(initialStats.minute.remaining - 2);
    });

    it('should have correct relationship between used, remaining, and limit', () => {
      service.increment();
      service.increment();
      service.increment();
      
      const stats = service.getStats();
      expect(stats.daily.used + stats.daily.remaining).toBe(stats.daily.limit);
      expect(stats.minute.used + stats.minute.remaining).toBe(stats.minute.limit);
    });

    it('should include resetDate as a string', () => {
      const stats = service.getStats();
      
      expect(typeof stats.daily.resetDate).toBe('string');
      expect(stats.daily.resetDate).toBeTruthy();
    });
  });

  describe('quota reset', () => {
    it('should reset quota on a new day', () => {
      // Increment some calls
      service.increment();
      service.increment();
      service.increment();
      
      const statsBeforeReset = service.getStats();
      expect(statsBeforeReset.daily.used).toBe(3);
      
      // Mock the date to be tomorrow
      const originalToDateString = Date.prototype.toDateString;
      Date.prototype.toDateString = jest.fn(() => 'Tomorrow');
      
      const statsAfterReset = service.getStats();
      
      // Restore original method
      Date.prototype.toDateString = originalToDateString;
      
      expect(statsAfterReset.daily.used).toBe(0);
      expect(statsAfterReset.daily.remaining).toBe(statsAfterReset.daily.limit);
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

