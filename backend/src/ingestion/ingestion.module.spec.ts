import { describe, it, expect } from '@jest/globals';
import { IngestionModule } from './ingestion.module';
import { HttpModule } from '@nestjs/axios';
import { SupabaseModule } from '../supabase/supabase.module';
import { IngestionController } from './ingestion.controller';
import { ErgastService } from './ergast.service';
import { OpenF1Service } from './openf1.service';

describe('IngestionModule', () => {
  it('should be defined', () => {
    expect(IngestionModule).toBeDefined();
  });

  describe('module structure', () => {
    it('should be a module object', () => {
      expect(typeof IngestionModule).toBe('function');
    });

    it('should have correct module name', () => {
      expect(IngestionModule.name).toBe('IngestionModule');
    });

    it('should be a valid NestJS module', () => {
      expect(IngestionModule).toBeDefined();
      expect(typeof IngestionModule).toBe('function');
    });
  });

  describe('imports', () => {
    it('should have imports array', () => {
      const imports = Reflect.getMetadata('imports', IngestionModule);
      expect(imports).toBeDefined();
      expect(Array.isArray(imports)).toBe(true);
    });

    it('should import HttpModule', () => {
      const imports = Reflect.getMetadata('imports', IngestionModule);
      expect(imports).toContain(HttpModule);
    });

    it('should import SupabaseModule', () => {
      const imports = Reflect.getMetadata('imports', IngestionModule);
      expect(imports).toContain(SupabaseModule);
    });

    it('should have correct import types', () => {
      const imports = Reflect.getMetadata('imports', IngestionModule);
      expect(typeof imports[0]).toBe('function');
      expect(typeof imports[1]).toBe('function');
    });

    it('should have all required imports', () => {
      const imports = Reflect.getMetadata('imports', IngestionModule);
      expect(imports).toHaveLength(2);
      expect(imports).toContain(HttpModule);
      expect(imports).toContain(SupabaseModule);
    });
  });

  describe('controllers', () => {
    it('should have controllers array', () => {
      const controllers = Reflect.getMetadata('controllers', IngestionModule);
      expect(controllers).toBeDefined();
      expect(Array.isArray(controllers)).toBe(true);
    });

    it('should register IngestionController', () => {
      const controllers = Reflect.getMetadata('controllers', IngestionModule);
      expect(controllers).toContain(IngestionController);
    });

    it('should have correct controller type', () => {
      const controllers = Reflect.getMetadata('controllers', IngestionModule);
      expect(typeof controllers[0]).toBe('function');
    });

    it('should have exactly one controller', () => {
      const controllers = Reflect.getMetadata('controllers', IngestionModule);
      expect(controllers).toHaveLength(1);
    });
  });

  describe('providers', () => {
    it('should have providers array', () => {
      const providers = Reflect.getMetadata('providers', IngestionModule);
      expect(providers).toBeDefined();
      expect(Array.isArray(providers)).toBe(true);
    });

    it('should register ErgastService', () => {
      const providers = Reflect.getMetadata('providers', IngestionModule);
      expect(providers).toContain(ErgastService);
    });

    it('should register OpenF1Service', () => {
      const providers = Reflect.getMetadata('providers', IngestionModule);
      expect(providers).toContain(OpenF1Service);
    });

    it('should have correct provider types', () => {
      const providers = Reflect.getMetadata('providers', IngestionModule);
      expect(typeof providers[0]).toBe('function');
      expect(typeof providers[1]).toBe('function');
    });

    it('should have exactly two providers', () => {
      const providers = Reflect.getMetadata('providers', IngestionModule);
      expect(providers).toHaveLength(2);
    });
  });

  describe('module configuration', () => {
    it('should have correct module structure', () => {
      const imports = Reflect.getMetadata('imports', IngestionModule);
      const controllers = Reflect.getMetadata('controllers', IngestionModule);
      const providers = Reflect.getMetadata('providers', IngestionModule);
      expect(imports).toBeDefined();
      expect(controllers).toBeDefined();
      expect(providers).toBeDefined();
    });

    it('should be properly configured for NestJS', () => {
      expect(IngestionModule).toBeDefined();
      expect(typeof IngestionModule).toBe('function');
    });

    it('should have all required properties', () => {
      const imports = Reflect.getMetadata('imports', IngestionModule);
      const controllers = Reflect.getMetadata('controllers', IngestionModule);
      const providers = Reflect.getMetadata('providers', IngestionModule);
      expect(imports).toBeDefined();
      expect(controllers).toBeDefined();
      expect(providers).toBeDefined();
    });
  });

  describe('module metadata', () => {
    it('should have correct module structure', () => {
      const imports = Reflect.getMetadata('imports', IngestionModule);
      const controllers = Reflect.getMetadata('controllers', IngestionModule);
      const providers = Reflect.getMetadata('providers', IngestionModule);
      expect(imports).toBeDefined();
      expect(controllers).toBeDefined();
      expect(providers).toBeDefined();
    });

    it('should be properly configured for NestJS', () => {
      expect(IngestionModule).toBeDefined();
      expect(typeof IngestionModule).toBe('function');
    });
  });

  describe('module structure validation', () => {
    it('should have correct imports array', () => {
      const imports = Reflect.getMetadata('imports', IngestionModule);
      expect(Array.isArray(imports)).toBe(true);
    });

    it('should have correct controllers array', () => {
      const controllers = Reflect.getMetadata('controllers', IngestionModule);
      expect(Array.isArray(controllers)).toBe(true);
    });

    it('should have correct providers array', () => {
      const providers = Reflect.getMetadata('providers', IngestionModule);
      expect(Array.isArray(providers)).toBe(true);
    });
  });

  describe('service dependencies', () => {
    it('should handle ErgastService dependency', () => {
      const providers = Reflect.getMetadata('providers', IngestionModule);
      expect(providers).toContain(ErgastService);
    });

    it('should handle OpenF1Service dependency', () => {
      const providers = Reflect.getMetadata('providers', IngestionModule);
      expect(providers).toContain(OpenF1Service);
    });

    it('should handle HttpModule dependency', () => {
      const imports = Reflect.getMetadata('imports', IngestionModule);
      expect(imports).toContain(HttpModule);
    });

    it('should handle SupabaseModule dependency', () => {
      const imports = Reflect.getMetadata('imports', IngestionModule);
      expect(imports).toContain(SupabaseModule);
    });
  });

  describe('module exports validation', () => {
    it('should not export any services', () => {
      const exports = Reflect.getMetadata('exports', IngestionModule);
      expect(exports).toBeUndefined();
    });

    it('should be a self-contained module', () => {
      const exports = Reflect.getMetadata('exports', IngestionModule);
      expect(exports).toBeUndefined();
    });
  });

  describe('module completeness', () => {
    it('should have all required imports', () => {
      const imports = Reflect.getMetadata('imports', IngestionModule);
      expect(imports).toBeDefined();
      expect(imports.length).toBeGreaterThan(0);
    });

    it('should have all required controllers', () => {
      const controllers = Reflect.getMetadata('controllers', IngestionModule);
      expect(controllers).toBeDefined();
      expect(controllers.length).toBeGreaterThan(0);
    });

    it('should have all required providers', () => {
      const providers = Reflect.getMetadata('providers', IngestionModule);
      expect(providers).toBeDefined();
      expect(providers.length).toBeGreaterThan(0);
    });
  });

  describe('module functionality', () => {
    it('should support ingestion operations', () => {
      const providers = Reflect.getMetadata('providers', IngestionModule);
      expect(providers).toContain(ErgastService);
      expect(providers).toContain(OpenF1Service);
    });

    it('should support controller operations', () => {
      const controllers = Reflect.getMetadata('controllers', IngestionModule);
      expect(controllers).toContain(IngestionController);
    });

    it('should support HTTP operations', () => {
      const imports = Reflect.getMetadata('imports', IngestionModule);
      expect(imports).toContain(HttpModule);
    });

    it('should support database operations', () => {
      const imports = Reflect.getMetadata('imports', IngestionModule);
      expect(imports).toContain(SupabaseModule);
    });
  });

  describe('module dependencies', () => {
    it('should depend on HttpModule', () => {
      const imports = Reflect.getMetadata('imports', IngestionModule);
      expect(imports).toContain(HttpModule);
    });

    it('should depend on SupabaseModule', () => {
      const imports = Reflect.getMetadata('imports', IngestionModule);
      expect(imports).toContain(SupabaseModule);
    });

    it('should depend on IngestionController', () => {
      const controllers = Reflect.getMetadata('controllers', IngestionModule);
      expect(controllers).toContain(IngestionController);
    });

    it('should depend on ErgastService', () => {
      const providers = Reflect.getMetadata('providers', IngestionModule);
      expect(providers).toContain(ErgastService);
    });

    it('should depend on OpenF1Service', () => {
      const providers = Reflect.getMetadata('providers', IngestionModule);
      expect(providers).toContain(OpenF1Service);
    });
  });

  describe('module architecture', () => {
    it('should follow NestJS module pattern', () => {
      expect(IngestionModule).toBeDefined();
      expect(typeof IngestionModule).toBe('function');
    });

    it('should have proper separation of concerns', () => {
      const controllers = Reflect.getMetadata('controllers', IngestionModule);
      const providers = Reflect.getMetadata('providers', IngestionModule);
      expect(controllers).toContain(IngestionController);
      expect(providers).toContain(ErgastService);
      expect(providers).toContain(OpenF1Service);
    });

    it('should have proper module boundaries', () => {
      const exports = Reflect.getMetadata('exports', IngestionModule);
      expect(exports).toBeUndefined();
    });
  });

  describe('module validation', () => {
    it('should have valid module name', () => {
      expect(IngestionModule.name).toBe('IngestionModule');
    });

    it('should have valid imports structure', () => {
      const imports = Reflect.getMetadata('imports', IngestionModule);
      expect(Array.isArray(imports)).toBe(true);
    });

    it('should have valid controllers structure', () => {
      const controllers = Reflect.getMetadata('controllers', IngestionModule);
      expect(Array.isArray(controllers)).toBe(true);
    });

    it('should have valid providers structure', () => {
      const providers = Reflect.getMetadata('providers', IngestionModule);
      expect(Array.isArray(providers)).toBe(true);
    });
  });

  describe('module consistency', () => {
    it('should have consistent naming', () => {
      expect(IngestionModule.name).toBe('IngestionModule');
    });

    it('should have consistent structure', () => {
      const imports = Reflect.getMetadata('imports', IngestionModule);
      const controllers = Reflect.getMetadata('controllers', IngestionModule);
      const providers = Reflect.getMetadata('providers', IngestionModule);
      expect(imports).toBeDefined();
      expect(controllers).toBeDefined();
      expect(providers).toBeDefined();
    });

    it('should have consistent types', () => {
      const imports = Reflect.getMetadata('imports', IngestionModule);
      const controllers = Reflect.getMetadata('controllers', IngestionModule);
      const providers = Reflect.getMetadata('providers', IngestionModule);

      expect(imports.every(item => typeof item === 'function')).toBe(true);
      expect(controllers.every(item => typeof item === 'function')).toBe(true);
      expect(providers.every(item => typeof item === 'function')).toBe(true);
    });
  });

  describe('module completeness check', () => {
    it('should have all required components', () => {
      const imports = Reflect.getMetadata('imports', IngestionModule);
      const controllers = Reflect.getMetadata('controllers', IngestionModule);
      const providers = Reflect.getMetadata('providers', IngestionModule);
      expect(imports).toBeDefined();
      expect(controllers).toBeDefined();
      expect(providers).toBeDefined();
    });

    it('should have correct component names', () => {
      const controllers = Reflect.getMetadata('controllers', IngestionModule);
      const providers = Reflect.getMetadata('providers', IngestionModule);
      expect(controllers).toContain(IngestionController);
      expect(providers).toContain(ErgastService);
      expect(providers).toContain(OpenF1Service);
    });

    it('should have proper module imports', () => {
      const imports = Reflect.getMetadata('imports', IngestionModule);
      expect(imports).toEqual([HttpModule, SupabaseModule]);
    });
  });

  describe('module integration', () => {
    it('should integrate with HttpModule for API calls', () => {
      const imports = Reflect.getMetadata('imports', IngestionModule);
      expect(imports).toContain(HttpModule);
    });

    it('should integrate with SupabaseModule for database operations', () => {
      const imports = Reflect.getMetadata('imports', IngestionModule);
      expect(imports).toContain(SupabaseModule);
    });

    it('should provide IngestionController for API endpoints', () => {
      const controllers = Reflect.getMetadata('controllers', IngestionModule);
      expect(controllers).toContain(IngestionController);
    });

    it('should provide ErgastService for Ergast API operations', () => {
      const providers = Reflect.getMetadata('providers', IngestionModule);
      expect(providers).toContain(ErgastService);
    });

    it('should provide OpenF1Service for OpenF1 API operations', () => {
      const providers = Reflect.getMetadata('providers', IngestionModule);
      expect(providers).toContain(OpenF1Service);
    });
  });

  describe('module service relationships', () => {
    it('should have ErgastService as a provider', () => {
      const providers = Reflect.getMetadata('providers', IngestionModule);
      expect(providers).toContain(ErgastService);
    });

    it('should have OpenF1Service as a provider', () => {
      const providers = Reflect.getMetadata('providers', IngestionModule);
      expect(providers).toContain(OpenF1Service);
    });

    it('should have IngestionController as a controller', () => {
      const controllers = Reflect.getMetadata('controllers', IngestionModule);
      expect(controllers).toContain(IngestionController);
    });

    it('should have HttpModule as an import', () => {
      const imports = Reflect.getMetadata('imports', IngestionModule);
      expect(imports).toContain(HttpModule);
    });

    it('should have SupabaseModule as an import', () => {
      const imports = Reflect.getMetadata('imports', IngestionModule);
      expect(imports).toContain(SupabaseModule);
    });
  });

  describe('module configuration validation', () => {
    it('should have correct number of imports', () => {
      const imports = Reflect.getMetadata('imports', IngestionModule);
      expect(imports).toHaveLength(2);
    });

    it('should have correct number of controllers', () => {
      const controllers = Reflect.getMetadata('controllers', IngestionModule);
      expect(controllers).toHaveLength(1);
    });

    it('should have correct number of providers', () => {
      const providers = Reflect.getMetadata('providers', IngestionModule);
      expect(providers).toHaveLength(2);
    });

    it('should have no exports', () => {
      const exports = Reflect.getMetadata('exports', IngestionModule);
      expect(exports).toBeUndefined();
    });
  });

  describe('module functionality validation', () => {
    it('should support data ingestion from multiple sources', () => {
      const providers = Reflect.getMetadata('providers', IngestionModule);
      expect(providers).toContain(ErgastService);
      expect(providers).toContain(OpenF1Service);
    });

    it('should support HTTP communication', () => {
      const imports = Reflect.getMetadata('imports', IngestionModule);
      expect(imports).toContain(HttpModule);
    });

    it('should support database operations', () => {
      const imports = Reflect.getMetadata('imports', IngestionModule);
      expect(imports).toContain(SupabaseModule);
    });

    it('should provide API endpoints', () => {
      const controllers = Reflect.getMetadata('controllers', IngestionModule);
      expect(controllers).toContain(IngestionController);
    });
  });

  describe('module structure integrity', () => {
    it('should maintain proper module structure', () => {
      const imports = Reflect.getMetadata('imports', IngestionModule);
      const controllers = Reflect.getMetadata('controllers', IngestionModule);
      const providers = Reflect.getMetadata('providers', IngestionModule);
      expect(imports).toBeDefined();
      expect(controllers).toBeDefined();
      expect(providers).toBeDefined();
    });

    it('should have consistent component relationships', () => {
      const imports = Reflect.getMetadata('imports', IngestionModule);
      const controllers = Reflect.getMetadata('controllers', IngestionModule);
      const providers = Reflect.getMetadata('providers', IngestionModule);

      expect(imports).toHaveLength(2);
      expect(controllers).toHaveLength(1);
      expect(providers).toHaveLength(2);
    });

    it('should follow NestJS module conventions', () => {
      expect(IngestionModule).toBeDefined();
      expect(typeof IngestionModule).toBe('function');
      expect(IngestionModule.name).toBe('IngestionModule');
    });
  });
});
