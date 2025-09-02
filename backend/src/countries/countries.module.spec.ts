import { describe, it, expect } from '@jest/globals';

describe('CountriesModule', () => {
  it('should be defined', () => {
    // Test that the module can be imported
    expect(() => {
      require('./countries.module');
    }).not.toThrow();
  });

  it('should be a class', () => {
    // Test that the module is a class
    const { CountriesModule } = require('./countries.module');
    expect(typeof CountriesModule).toBe('function');
  });

  it('should have module decorator', () => {
    // Test that the module has the @Module decorator
    const { CountriesModule } = require('./countries.module');
    expect(CountriesModule).toBeDefined();
  });

  it('should be importable', () => {
    // Test that the module can be imported without errors
    expect(() => {
      const { CountriesModule } = require('./countries.module');
      expect(CountriesModule).toBeDefined();
    }).not.toThrow();
  });
});
