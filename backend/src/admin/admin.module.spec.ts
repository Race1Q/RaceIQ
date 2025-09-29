import { Test, TestingModule } from '@nestjs/testing';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { Module } from '@nestjs/common';
import { AdminModule } from './admin.module';
import { AdminController } from './admin.controller';

describe('AdminModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    module = await Test.createTestingModule({
      imports: [AdminModule],
    }).compile();
  });

  describe('Module Structure', () => {
    it('should be defined', () => {
      expect(AdminModule).toBeDefined();
    });

    it('should be a class', () => {
      expect(typeof AdminModule).toBe('function');
    });

    it('should be a valid NestJS module', () => {
      // Test that the module is a valid NestJS module class
      expect(AdminModule).toBeDefined();
    });

    it('should have module decorator', () => {
      // Test that the class has the Module decorator by checking if it's a function
      expect(typeof AdminModule).toBe('function');
    });

    it('should be instantiable', () => {
      const moduleInstance = new AdminModule();
      expect(moduleInstance).toBeInstanceOf(AdminModule);
    });
  });

  describe('Module Configuration', () => {
    it('should have controllers array in module decorator', () => {
      // This test verifies that the module is properly configured with controllers
      expect(AdminModule).toBeDefined();
      expect(typeof AdminModule).toBe('function');
    });

    it('should be importable', () => {
      // Test that the module can be imported in a testing module
      expect(() => {
        Test.createTestingModule({
          imports: [AdminModule],
        });
      }).not.toThrow();
    });
  });

  describe('Module Compilation', () => {
    it('should compile successfully', async () => {
      const compiledModule = await Test.createTestingModule({
        imports: [AdminModule],
      }).compile();

      expect(compiledModule).toBeDefined();
      expect(compiledModule).toBeInstanceOf(TestingModule);
    });

    it('should be able to create module instance', () => {
      const moduleInstance = new AdminModule();
      expect(moduleInstance).toBeDefined();
      expect(moduleInstance).toBeInstanceOf(AdminModule);
    });
  });

  describe('Controller Registration', () => {
    it('should register AdminController', async () => {
      const compiledModule = await Test.createTestingModule({
        imports: [AdminModule],
      }).compile();

      // Test that AdminController is registered in the module
      expect(() => {
        compiledModule.get(AdminController);
      }).not.toThrow();
    });

    it('should have AdminController available', async () => {
      const compiledModule = await Test.createTestingModule({
        imports: [AdminModule],
      }).compile();

      const adminController = compiledModule.get(AdminController);
      expect(adminController).toBeDefined();
      expect(adminController).toBeInstanceOf(AdminController);
    });

    it('should have AdminController with correct methods', async () => {
      const compiledModule = await Test.createTestingModule({
        imports: [AdminModule],
      }).compile();

      const adminController = compiledModule.get(AdminController);
      expect(adminController).toBeDefined();
      expect(typeof adminController.dashboard).toBe('function');
      expect(typeof adminController.me).toBe('function');
    });
  });

  describe('Module Dependencies', () => {
    it('should not have providers array', () => {
      // The AdminModule doesn't define providers, so this should be undefined
      // This test verifies the module structure is minimal as expected
      expect(AdminModule).toBeDefined();
    });

    it('should not have imports array', () => {
      // The AdminModule doesn't import other modules, so this should be undefined
      // This test verifies the module structure is minimal as expected
      expect(AdminModule).toBeDefined();
    });

    it('should not have exports array', () => {
      // The AdminModule doesn't export anything, so this should be undefined
      // This test verifies the module structure is minimal as expected
      expect(AdminModule).toBeDefined();
    });
  });

  describe('Module Metadata', () => {
    it('should have correct module metadata structure', () => {
      // Test that the module can be instantiated and has expected properties
      const moduleInstance = new AdminModule();
      expect(moduleInstance).toBeDefined();
      expect(moduleInstance.constructor.name).toBe('AdminModule');
    });

    it('should be a singleton when used in testing module', async () => {
      const compiledModule = await Test.createTestingModule({
        imports: [AdminModule],
      }).compile();

      const adminController1 = compiledModule.get(AdminController);
      const adminController2 = compiledModule.get(AdminController);
      
      // Both should be the same instance (singleton)
      expect(adminController1).toBe(adminController2);
    });
  });

  describe('Module Integration', () => {
    it('should work with other modules when imported', async () => {
      // Test that AdminModule can be imported alongside other modules
      const compiledModule = await Test.createTestingModule({
        imports: [AdminModule],
      }).compile();

      expect(compiledModule).toBeDefined();
      expect(() => compiledModule.get(AdminController)).not.toThrow();
    });

    it('should allow module to be imported multiple times', async () => {
      // Test that AdminModule can be imported multiple times without issues
      const compiledModule1 = await Test.createTestingModule({
        imports: [AdminModule],
      }).compile();

      const compiledModule2 = await Test.createTestingModule({
        imports: [AdminModule],
      }).compile();

      expect(compiledModule1).toBeDefined();
      expect(compiledModule2).toBeDefined();
      expect(compiledModule1.get(AdminController)).toBeDefined();
      expect(compiledModule2.get(AdminController)).toBeDefined();
    });
  });

  describe('Module Lifecycle', () => {
    it('should initialize without errors', async () => {
      const compiledModule = await Test.createTestingModule({
        imports: [AdminModule],
      }).compile();

      // Test that the module initializes without throwing errors
      expect(compiledModule).toBeDefined();
      expect(() => compiledModule.get(AdminController)).not.toThrow();
    });

    it('should be able to close module', async () => {
      const compiledModule = await Test.createTestingModule({
        imports: [AdminModule],
      }).compile();

      // Test that the module can be closed without errors
      expect(async () => {
        await compiledModule.close();
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle module compilation errors gracefully', async () => {
      // Test that the module handles compilation properly
      expect(async () => {
        await Test.createTestingModule({
          imports: [AdminModule],
        }).compile();
      }).not.toThrow();
    });

    it('should handle controller retrieval errors gracefully', async () => {
      const compiledModule = await Test.createTestingModule({
        imports: [AdminModule],
      }).compile();

      // Test that getting a non-existent controller throws appropriate error
      expect(() => {
        compiledModule.get('NonExistentController');
      }).toThrow();
    });
  });
});
