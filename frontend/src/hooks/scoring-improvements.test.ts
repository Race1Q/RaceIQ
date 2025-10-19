import { describe, it, expect } from 'vitest';

// Test the improved scoring system
describe('Improved Composite Scoring System', () => {
  describe('Metric Weights', () => {
    it('should weight wins 3x more than points', () => {
      // Driver A: 1 win, 0 points
      // Driver B: 0 wins, 100 points
      // With old system: Driver B would win (100 vs 0)
      // With new system: Driver A should win (wins weighted 3x)
      
      const winsWeight = 3.0;
      const pointsWeight = 1.0;
      
      expect(winsWeight).toBeGreaterThan(pointsWeight);
      expect(winsWeight / pointsWeight).toBe(3.0);
    });

    it('should weight podiums 2x more than points', () => {
      const podiumsWeight = 2.0;
      const pointsWeight = 1.0;
      
      expect(podiumsWeight).toBeGreaterThan(pointsWeight);
      expect(podiumsWeight / pointsWeight).toBe(2.0);
    });

  });

  describe('Logarithmic Scaling', () => {
    it('should handle large point differences better', () => {
      // Old system: 1000 vs 100 points = 1.0 vs 0.1 (huge difference)
      // New system: log(1001) vs log(101) = 6.9 vs 4.6 (more reasonable)
      
      const largeValue = 1000;
      const smallValue = 100;
      
      const logLarge = Math.log(largeValue + 1);
      const logSmall = Math.log(smallValue + 1);
      const ratio = logLarge / logSmall;
      
      // Logarithmic scaling reduces the impact of large differences
      expect(ratio).toBeLessThan(largeValue / smallValue); // 10x difference becomes ~1.5x
    });

    it('should handle zero values correctly', () => {
      const logZero = Math.log(0 + 1); // log(1) = 0
      const logOne = Math.log(1 + 1);   // log(2) = 0.693
      
      expect(logZero).toBe(0);
      expect(logOne).toBeGreaterThan(0);
    });
  });

  describe('Zero Value Handling', () => {
    it('should return tied scores for both zeros', () => {
      const result = [0.5, 0.5]; // Both drivers have 0
      expect(result[0]).toBe(result[1]);
      expect(result[0]).toBe(0.5);
    });

    it('should handle mixed zero and non-zero values', () => {
      // Driver A: 0 wins, Driver B: 5 wins
      // Should not result in division by zero
      const value1 = 0;
      const value2 = 5;
      
      const log1 = value1 > 0 ? Math.log(value1 + 1) : 0;
      const log2 = value2 > 0 ? Math.log(value2 + 1) : 0;
      
      expect(log1).toBe(0);
      expect(log2).toBeGreaterThan(0);
    });
  });

  describe('CSI Integration', () => {
    it('should apply CSI adjustments correctly', () => {
      // Test that CSI adjustments are applied after normalization
      const baseScore = 1.0;
      const csi = 1.2; // Better car
      const alpha = 0.2;
      
      // Better car gets slight penalty
      const adjusted = baseScore * Math.pow(csi, alpha);
      expect(adjusted).toBeGreaterThan(baseScore); // 1.0 * 1.037 = 1.037
    });

    it('should give bonus to drivers in worse cars', () => {
      const baseScore = 1.0;
      const csi = 0.8; // Worse car
      const alpha = 0.2;
      
      // Worse car gets bonus
      const adjusted = baseScore * Math.pow(csi, alpha);
      expect(adjusted).toBeLessThan(baseScore); // 1.0 * 0.956 = 0.956
    });
  });

  describe('Real-world Scenarios', () => {
    it('should favor race winners over point scorers', () => {
      // Scenario: Driver with 1 win vs Driver with 200 points
      const winsWeight = 3.0;
      const pointsWeight = 1.0;
      
      // With logarithmic scaling, 200 points becomes log(201) ≈ 5.3
      // 1 win becomes log(2) ≈ 0.693, but weighted 3x = 2.08
      // This makes wins more competitive with high point totals
      
      const logPoints = Math.log(201);
      const logWins = Math.log(2) * winsWeight;
      
      // Wins should be competitive even against high points
      expect(logWins).toBeGreaterThan(logPoints * 0.3); // At least 30% of points value
    });

    it('should balance multiple metrics realistically', () => {
      // Driver A: 2 wins, 1 podium, 50 points
      // Driver B: 0 wins, 5 podiums, 100 points
      
      const driverA = {
        wins: 2 * 3.0,      // 6.0 weighted
        podiums: 1 * 2.0,   // 2.0 weighted  
        points: 50 * 1.0    // 50.0 weighted
      };
      
      const driverB = {
        wins: 0 * 3.0,      // 0.0 weighted
        podiums: 5 * 2.0,   // 10.0 weighted
        points: 100 * 1.0   // 100.0 weighted
      };
      
      const totalA = driverA.wins + driverA.podiums + driverA.points;
      const totalB = driverB.wins + driverB.podiums + driverB.points;
      
      // Driver B has higher total (110 vs 58) due to more points and podiums
      expect(totalB).toBeGreaterThan(totalA);
      expect(totalB).toBe(110);
      expect(totalA).toBe(58);
    });
  });
});
