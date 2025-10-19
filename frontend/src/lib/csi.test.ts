import { getCSI, getCSIForDriver, getCSIForConstructor, applyCSIDampener } from './csi';

describe('CSI (Constructor Strength Index)', () => {
  describe('getCSI', () => {
    it('should return correct CSI for known teams and seasons', () => {
      // Test dominant teams
      expect(getCSI(2023, 'red_bull')).toBe(1.4);
      expect(getCSI(2020, 'mercedes')).toBe(1.4);
      expect(getCSI(2002, 'ferrari')).toBe(1.4);
      
      // Test midfield teams
      expect(getCSI(2023, 'mclaren')).toBe(1.05);
      expect(getCSI(2020, 'renault')).toBe(1.0);
      
      // Test backmarkers
      expect(getCSI(2023, 'haas')).toBe(0.75);
      expect(getCSI(2020, 'williams')).toBe(0.7);
    });

    it('should return 1.0 for unknown teams or seasons', () => {
      expect(getCSI(1999, 'red_bull')).toBe(1.0);
      expect(getCSI(2023, 'unknown_team')).toBe(1.0);
    });
  });

  describe('getCSIForDriver', () => {
    it('should map database constructor names to CSI team keys', () => {
      expect(getCSIForDriver(2023, 'Red Bull Racing')).toBe(1.4);
      expect(getCSIForDriver(2023, 'Red Bull')).toBe(1.4);
      expect(getCSIForDriver(2023, 'Mercedes')).toBe(1.1);
      expect(getCSIForDriver(2023, 'Ferrari')).toBe(1.1);
      expect(getCSIForDriver(2023, 'Haas F1 Team')).toBe(0.75);
    });

    it('should handle unknown constructor names', () => {
      expect(getCSIForDriver(2023, 'Unknown Team')).toBe(1.0);
    });
  });

  describe('getCSIForConstructor', () => {
    it('should work the same as getCSIForDriver', () => {
      expect(getCSIForConstructor(2023, 'Red Bull Racing')).toBe(1.4);
      expect(getCSIForConstructor(2023, 'Mercedes')).toBe(1.1);
    });
  });

  describe('applyCSIDampener', () => {
    it('should apply CSI adjustment for higher-is-better metrics', () => {
      // Driver in worse car (CSI 0.8) vs good car (CSI 1.2)
      const worseCarScore = applyCSIDampener(1.0, 0.8, 'higher', 0.3);
      const goodCarScore = applyCSIDampener(1.0, 1.2, 'higher', 0.3);
      
      // Better car gets higher adjusted score (csi^alpha where csi > 1 gives bonus)
      expect(goodCarScore).toBeGreaterThan(worseCarScore);
      expect(goodCarScore).toBeCloseTo(1.0 * Math.pow(1.2, 0.3));
      expect(worseCarScore).toBeCloseTo(1.0 * Math.pow(0.8, 0.3));
    });

    it('should adjust scores based on CSI for lower-is-better metrics', () => {
      // DNFs: formula inverts the CSI effect for lower-is-better metrics
      const worseCarScore = applyCSIDampener(0.5, 0.8, 'lower', 0.3);
      const goodCarScore = applyCSIDampener(0.5, 1.2, 'lower', 0.3);
      
      // Lower-is-better uses inverted CSI formula
      expect(goodCarScore).toBeGreaterThan(worseCarScore);
    });

    it('should handle edge cases', () => {
      expect(applyCSIDampener(0, 1.0, 'higher', 0.2)).toBe(0);
      expect(applyCSIDampener(1, 1.0, 'higher', 0.2)).toBe(1);
    });
  });
});
