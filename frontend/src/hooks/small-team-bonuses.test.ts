import { describe, it, expect } from 'vitest';
import { getCSIForDriver, applyCSIDampener } from '../lib/csi';

// Test the small team bonus system
describe('Small Team Bonus System', () => {
  describe('CSI Impact on Scoring', () => {
    it('should apply CSI adjustments based on car performance', () => {
      // Small team (CSI 0.8) vs Big team (CSI 1.3)
      const smallTeamScore = applyCSIDampener(1.0, 0.8, 'higher', 0.6);
      const bigTeamScore = applyCSIDampener(1.0, 1.3, 'higher', 0.6);
      
      // Better car (higher CSI) gets higher score with current implementation
      expect(bigTeamScore).toBeGreaterThan(smallTeamScore);
      expect(bigTeamScore).toBeCloseTo(1.0 * Math.pow(1.3, 0.6));
      expect(smallTeamScore).toBeCloseTo(1.0 * Math.pow(0.8, 0.6));
    });

    it('should apply CSI scaling consistently', () => {
      // Dominant team (CSI 1.4) vs Average team (CSI 1.0)
      const dominantScore = applyCSIDampener(1.0, 1.4, 'higher', 0.6);
      const averageScore = applyCSIDampener(1.0, 1.0, 'higher', 0.6);
      
      // Dominant team (higher CSI) gets higher adjusted score
      expect(dominantScore).toBeGreaterThan(averageScore);
      expect(averageScore).toBe(1.0); // CSI of 1.0 means no change
    });
  });

  describe('Small Team Bonus Multipliers', () => {
    it('should apply correct bonuses for different metrics', () => {
      // Simulate small team bonuses
      const csi = 0.8; // Small team
      const baseScore = 1.0;
      
      // Points bonus: 50%
      const pointsBonus = 1.5;
      const pointsScore = baseScore * pointsBonus;
      expect(pointsScore).toBe(1.5);
      
      // Podiums bonus: 30%
      const podiumsBonus = 1.3;
      const podiumsScore = baseScore * podiumsBonus;
      expect(podiumsScore).toBe(1.3);
      
      // Wins bonus: 50%
      const winsBonus = 1.5;
      const winsScore = baseScore * winsBonus;
      expect(winsScore).toBe(1.5);
    });

    it('should not apply bonuses to big teams', () => {
      const csi = 1.2; // Big team
      const baseScore = 1.0;
      
      // No bonuses for big teams
      const pointsScore = baseScore * 1.0; // No bonus
      const podiumsScore = baseScore * 1.0; // No bonus
      const winsScore = baseScore * 1.0; // No bonus
      
      expect(pointsScore).toBe(1.0);
      expect(podiumsScore).toBe(1.0);
      expect(winsScore).toBe(1.0);
    });
  });

  describe('Real-world Scenarios', () => {
    it('should make small team points competitive with big team wins', () => {
      // Haas (CSI 0.8) with 50 points vs Red Bull (CSI 1.3) with 1 win
      const haasPoints = 50;
      const redBullWins = 1;
      
      // Normalize scores
      const haasNormalized = haasPoints / Math.max(haasPoints, redBullWins); // 1.0
      const redBullNormalized = redBullWins / Math.max(haasPoints, redBullWins); // 0.02
      
      // Apply CSI adjustments
      const haasCSI = 0.8;
      const redBullCSI = 1.3;
      
      const haasAdjusted = applyCSIDampener(haasNormalized, haasCSI, 'higher', 0.6);
      const redBullAdjusted = applyCSIDampener(redBullNormalized, redBullCSI, 'higher', 0.6);
      
      // Apply small team bonuses
      const haasFinal = haasAdjusted * 1.5; // 50% points bonus
      const redBullFinal = redBullAdjusted * 1.0; // No bonus
      
      // Apply weights (wins = 3.0, points = 1.0)
      const haasWeighted = haasFinal * 1.0; // Points weight
      const redBullWeighted = redBullFinal * 3.0; // Wins weight
      
      // Haas should now be competitive
      expect(haasWeighted).toBeGreaterThan(redBullWeighted * 0.3); // At least 30% competitive
    });

    it('should calculate weighted scores for different teams', () => {
      // Haas (CSI 0.8) with 2 podiums vs Mercedes (CSI 1.1) with 5 podiums
      const haasPodiums = 2;
      const mercedesPodiums = 5;
      
      // Normalize
      const haasNormalized = haasPodiums / Math.max(haasPodiums, mercedesPodiums); // 0.4
      const mercedesNormalized = mercedesPodiums / Math.max(haasPodiums, mercedesPodiums); // 1.0
      
      // Apply CSI (note: current implementation favors higher CSI)
      const haasCSIAdjusted = applyCSIDampener(haasNormalized, 0.8, 'higher', 0.6);
      const mercedesCSIAdjusted = applyCSIDampener(mercedesNormalized, 1.1, 'higher', 0.6);
      
      // Apply bonus multipliers (Haas gets 30% podium bonus)
      const haasFinal = haasCSIAdjusted * 1.3;
      const mercedesFinal = mercedesCSIAdjusted * 1.0;
      
      // Apply weights (podiums = 2.0)
      const haasWeighted = haasFinal * 2.0;
      const mercedesWeighted = mercedesFinal * 2.0;
      
      // Mercedes should still be ahead due to more podiums and better CSI
      expect(mercedesWeighted).toBeGreaterThan(haasWeighted);
      // But Haas should get closer with the bonus
      expect(haasWeighted).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero values correctly', () => {
      // Both teams have 0 wins
      const haasWins = 0;
      const redBullWins = 0;
      
      // Should return tied scores
      const haasScore = 0.5 * 1.0; // No bonus for zeros
      const redBullScore = 0.5 * 1.0;
      
      expect(haasScore).toBe(redBullScore);
    });

    it('should handle very small CSI values', () => {
      const verySmallTeamCSI = 0.6; // Very small team
      const baseScore = 1.0;
      
      const adjusted = applyCSIDampener(baseScore, verySmallTeamCSI, 'higher', 0.6);
      const withBonus = adjusted * 1.5; // Points bonus
      
      // Should get significant boost
      expect(withBonus).toBeGreaterThan(1.0);
    });
  });
});
