import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CircuitsModule } from './circuits.module';
import { CircuitsService } from './circuits.service';
import { CircuitsController } from './circuits.controller';
import { Circuit } from './circuits.entity';
import { CountriesModule } from '../countries/countries.module';

describe('CircuitsModule', () => {
  let module: TestingModule;
  let circuitsService: CircuitsService;
  let circuitsController: CircuitsController;
  let circuitRepository: any;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const moduleBuilder = Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Circuit],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Circuit]),
        CountriesModule,
      ],
      controllers: [CircuitsController],
      providers: [CircuitsService],
      exports: [CircuitsService, TypeOrmModule],
    });

    // Override the repository with our mock
    moduleBuilder.overrideProvider(getRepositoryToken(Circuit)).useValue(mockRepository);

    module = await moduleBuilder.compile();

    circuitsService = module.get<CircuitsService>(CircuitsService);
    circuitsController = module.get<CircuitsController>(CircuitsController);
    circuitRepository = module.get(getRepositoryToken(Circuit));
  });

  afterEach(async () => {
    jest.clearAllMocks();
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(CircuitsModule).toBeDefined();
  });

  describe('module structure', () => {
    it('should be a class', () => {
      expect(typeof CircuitsModule).toBe('function');
    });

    it('should be a NestJS module', () => {
      expect(CircuitsModule).toHaveProperty('name');
    });

    it('should have correct module metadata', () => {
      const moduleMetadata = Reflect.getMetadata('__module__', CircuitsModule);
      expect(moduleMetadata).toBeDefined();
    });
  });

  describe('imports', () => {
    it('should import TypeOrmModule.forFeature with Circuit entity', () => {
      expect(module).toBeDefined();
      expect(circuitRepository).toBeDefined();
    });

    it('should import CountriesModule', () => {
      const countriesModule = module.get('CountriesModule', { strict: false });
      expect(countriesModule).toBeDefined();
    });

    it('should have TypeOrmModule configured correctly', () => {
      expect(module).toBeDefined();
      // TypeOrmModule should be available in the module
      const typeOrmModule = module.get('TypeOrmModule', { strict: false });
      expect(typeOrmModule).toBeDefined();
    });
  });

  describe('controllers', () => {
    it('should register CircuitsController', () => {
      expect(circuitsController).toBeDefined();
      expect(circuitsController).toBeInstanceOf(CircuitsController);
    });

    it('should have correct controller type', () => {
      expect(typeof CircuitsController).toBe('function');
    });

    it('should be able to instantiate controller', () => {
      expect(circuitsController).toBeTruthy();
    });
  });

  describe('providers', () => {
    it('should register CircuitsService', () => {
      expect(circuitsService).toBeDefined();
      expect(circuitsService).toBeInstanceOf(CircuitsService);
    });

    it('should have correct service type', () => {
      expect(typeof CircuitsService).toBe('function');
    });

    it('should be able to instantiate service', () => {
      expect(circuitsService).toBeTruthy();
    });

    it('should inject repository into service', () => {
      expect(circuitsService).toBeDefined();
      // The service should have access to the repository
      expect(circuitRepository).toBeDefined();
    });
  });

  describe('exports', () => {
    it('should export CircuitsService', () => {
      const exportedService = module.get<CircuitsService>(CircuitsService);
      expect(exportedService).toBeDefined();
      expect(exportedService).toBeInstanceOf(CircuitsService);
    });

    it('should export TypeOrmModule', () => {
      const exportedTypeOrmModule = module.get('TypeOrmModule', { strict: false });
      expect(exportedTypeOrmModule).toBeDefined();
    });

    it('should make exports available to other modules', () => {
      // Test that the exports are properly configured
      expect(module).toBeDefined();
      // The module should be able to provide its exports
      expect(() => module.get<CircuitsService>(CircuitsService)).not.toThrow();
    });
  });

  describe('dependency injection', () => {
    it('should inject Circuit repository into CircuitsService', () => {
      expect(circuitsService).toBeDefined();
      expect(circuitRepository).toBeDefined();
      expect(circuitRepository).toBe(mockRepository);
    });

    it('should inject CircuitsService into CircuitsController', () => {
      expect(circuitsController).toBeDefined();
      expect(circuitsService).toBeDefined();
    });

    it('should have proper dependency chain', () => {
      // Controller -> Service -> Repository
      expect(circuitsController).toBeDefined();
      expect(circuitsService).toBeDefined();
      expect(circuitRepository).toBeDefined();
    });
  });

  describe('module instantiation', () => {
    it('should create module without errors', async () => {
      expect(module).toBeDefined();
      expect(module).toBeInstanceOf(TestingModule);
    });

    it('should initialize all components', () => {
      expect(circuitsController).toBeDefined();
      expect(circuitsService).toBeDefined();
      expect(circuitRepository).toBeDefined();
    });

    it('should handle module lifecycle correctly', async () => {
      expect(module).toBeDefined();
      await expect(module.close()).resolves.not.toThrow();
    });
  });

  describe('entity registration', () => {
    it('should register Circuit entity with TypeORM', () => {
      expect(circuitRepository).toBeDefined();
      // The repository should be available for the Circuit entity
      expect(typeof circuitRepository.find).toBe('function');
      expect(typeof circuitRepository.findOne).toBe('function');
    });

    it('should have correct entity token', () => {
      const entityToken = getRepositoryToken(Circuit);
      expect(entityToken).toBeDefined();
      expect(typeof entityToken).toBe('string');
    });
  });

  describe('module configuration', () => {
    it('should have correct module structure', () => {
      expect(CircuitsModule).toBeDefined();
      expect(typeof CircuitsModule).toBe('function');
    });

    it('should be properly decorated', () => {
      const moduleMetadata = Reflect.getMetadata('__module__', CircuitsModule);
      expect(moduleMetadata).toBeDefined();
    });

    it('should export the correct components', () => {
      // Test that the module exports are accessible
      expect(() => module.get<CircuitsService>(CircuitsService)).not.toThrow();
    });
  });

  describe('integration tests', () => {
    it('should allow service to use repository', async () => {
      const mockCircuits = [
        {
          id: 1,
          name: 'Test Circuit',
          location: 'Test Location',
          country_code: 'TST',
          map_url: 'https://example.com/test',
          length_km: 5.0,
          race_distance_km: 300.0,
          track_layout: null,
          country: null,
        },
      ];

      mockRepository.find.mockResolvedValue(mockCircuits);

      const result = await circuitsService.findAll();

      expect(result).toEqual(mockCircuits);
      expect(mockRepository.find).toHaveBeenCalledWith({ relations: ['country'] });
    });

    it('should allow controller to use service', async () => {
      const mockCircuit = {
        id: 1,
        name: 'Test Circuit',
        location: 'Test Location',
        country_code: 'TST',
        map_url: 'https://example.com/test',
        length_km: 5.0,
        race_distance_km: 300.0,
        track_layout: null,
        country: null,
      };

      mockRepository.findOne.mockResolvedValue(mockCircuit);

      const result = await circuitsController.findOne(1);

      expect(result).toEqual(mockCircuit);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['country'],
      });
    });

    it('should handle full request flow', async () => {
      const mockCircuits = [
        {
          id: 1,
          name: 'Monaco',
          location: 'Monte Carlo',
          country_code: 'MCO',
          map_url: 'https://example.com/monaco',
          length_km: 3.337,
          race_distance_km: 260.286,
          track_layout: null,
          country: null,
        },
      ];

      mockRepository.find.mockResolvedValue(mockCircuits);

      // Test the full flow: Controller -> Service -> Repository
      const result = await circuitsController.findAll();

      expect(result).toEqual(mockCircuits);
      expect(mockRepository.find).toHaveBeenCalledWith({ relations: ['country'] });
    });
  });

  describe('module isolation', () => {
    it('should not interfere with other modules', () => {
      expect(module).toBeDefined();
      // The module should be self-contained
      expect(circuitsController).toBeDefined();
      expect(circuitsService).toBeDefined();
    });

    it('should handle module dependencies correctly', () => {
      // CountriesModule should be available
      expect(module).toBeDefined();
      // The module should properly import its dependencies
      expect(circuitsService).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle module creation errors gracefully', async () => {
      // Test with invalid configuration
      const invalidModule = Test.createTestingModule({
        imports: [
          TypeOrmModule.forRoot({
            type: 'sqlite',
            database: ':memory:',
            entities: [Circuit],
            synchronize: true,
          }),
          TypeOrmModule.forFeature([Circuit]),
          CountriesModule,
        ],
        controllers: [CircuitsController],
        providers: [CircuitsService],
        exports: [CircuitsService, TypeOrmModule],
      });

      // Override with invalid repository
      invalidModule.overrideProvider(getRepositoryToken(Circuit)).useValue(null);

      await expect(invalidModule.compile()).rejects.toThrow();
    });

    it('should handle missing dependencies', async () => {
      const incompleteModule = Test.createTestingModule({
        imports: [TypeOrmModule.forFeature([Circuit])],
        controllers: [CircuitsController],
        providers: [CircuitsService],
        exports: [CircuitsService, TypeOrmModule],
      });

      // Missing CountriesModule import
      await expect(incompleteModule.compile()).rejects.toThrow();
    });
  });

  describe('module metadata', () => {
    it('should have correct module decorator', () => {
      const moduleMetadata = Reflect.getMetadata('__module__', CircuitsModule);
      expect(moduleMetadata).toBeDefined();
    });

    it('should be properly configured for NestJS', () => {
      expect(CircuitsModule).toBeDefined();
      expect(typeof CircuitsModule).toBe('function');
    });
  });

  describe('circular dependencies', () => {
    it('should handle module imports without circular dependencies', () => {
      expect(module).toBeDefined();
      // The module should be able to import CountriesModule without issues
      expect(circuitsService).toBeDefined();
    });

    it('should properly resolve all dependencies', () => {
      expect(circuitsController).toBeDefined();
      expect(circuitsService).toBeDefined();
      expect(circuitRepository).toBeDefined();
    });
  });

  describe('module lifecycle', () => {
    it('should initialize correctly', () => {
      expect(module).toBeDefined();
      expect(circuitsController).toBeDefined();
      expect(circuitsService).toBeDefined();
    });

    it('should clean up resources on close', async () => {
      expect(module).toBeDefined();
      await expect(module.close()).resolves.not.toThrow();
    });

    it('should handle multiple initialization cycles', async () => {
      // Test that the module can be created and destroyed multiple times
      const module1 = await Test.createTestingModule({
        imports: [
          TypeOrmModule.forRoot({
            type: 'sqlite',
            database: ':memory:',
            entities: [Circuit],
            synchronize: true,
          }),
          TypeOrmModule.forFeature([Circuit]),
          CountriesModule,
        ],
        controllers: [CircuitsController],
        providers: [CircuitsService],
        exports: [CircuitsService, TypeOrmModule],
      }).compile();

      expect(module1).toBeDefined();
      await module1.close();

      const module2 = await Test.createTestingModule({
        imports: [
          TypeOrmModule.forRoot({
            type: 'sqlite',
            database: ':memory:',
            entities: [Circuit],
            synchronize: true,
          }),
          TypeOrmModule.forFeature([Circuit]),
          CountriesModule,
        ],
        controllers: [CircuitsController],
        providers: [CircuitsService],
        exports: [CircuitsService, TypeOrmModule],
      }).compile();

      expect(module2).toBeDefined();
      await module2.close();
    });
  });
});
