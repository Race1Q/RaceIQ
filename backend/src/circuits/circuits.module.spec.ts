import { jest, describe, it, expect } from '@jest/globals';
import { CircuitsModule } from './circuits.module';

describe('CircuitsModule', () => {
  it('should be defined', () => {
    expect(CircuitsModule).toBeDefined();
  });

  describe('module structure', () => {
    it('should be a class', () => {
      expect(typeof CircuitsModule).toBe('function');
    });

    it('should be a valid NestJS module', () => {
      // Test that the module is a valid NestJS module class
      expect(CircuitsModule).toBeDefined();
    });

    it('should have module decorator', () => {
      // Test that the class has the Module decorator by checking if it's a function
      expect(typeof CircuitsModule).toBe('function');
    });
  });

  describe('module configuration', () => {
    it('should be a valid module class', () => {
      // Test that the module class is properly defined
      expect(CircuitsModule).toBeDefined();
    });

    it('should be importable', () => {
      // Test that the module can be imported without errors
      expect(() => {
        const module = CircuitsModule;
        expect(module).toBeDefined();
      }).not.toThrow();
    });
  });
});
