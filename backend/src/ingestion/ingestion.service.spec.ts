// backend/src/ingestion/ingestion.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { IngestionService } from './ingestion.service';
import { ErgastService } from './ergast.service';
import { OpenF1Service } from './openf1.service';
import { DataSource } from 'typeorm';

describe('IngestionService', () => {
  let service: IngestionService;
  let ergastService: ErgastService;
  let openf1Service: OpenF1Service;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngestionService,
        {
          provide: ErgastService,
          useValue: {
            ingestSeasons: jest.fn(),
            ingestCircuits: jest.fn(),
            ingestConstructors: jest.fn(),
            ingestDrivers: jest.fn(),
            ingestRacesAndSessions: jest.fn(),
            ingestAllResults: jest.fn(),
            ingestAllStandings: jest.fn(),
          },
        },
        {
          provide: OpenF1Service,
          useValue: {
            ingestSessionsAndWeather: jest.fn(),
            ingestGranularData: jest.fn(),
            ingestModernResultsAndLaps: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            query: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<IngestionService>(IngestionService);
    ergastService = module.get<ErgastService>(ErgastService);
    openf1Service = module.get<OpenF1Service>(OpenF1Service);
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('refreshMaterializedViews', () => {
    it('should refresh all materialized views', async () => {
      const querySpy = jest.spyOn(dataSource, 'query').mockResolvedValue([]);

      await service.refreshMaterializedViews();

      expect(querySpy).toHaveBeenCalledTimes(5);
      expect(querySpy).toHaveBeenCalledWith(
        'REFRESH MATERIALIZED VIEW CONCURRENTLY driver_standings_materialized',
      );
    });

    it('should continue refreshing other views if one fails', async () => {
      const querySpy = jest
        .spyOn(dataSource, 'query')
        .mockRejectedValueOnce(new Error('View refresh failed'))
        .mockResolvedValue([]);

      await service.refreshMaterializedViews();

      expect(querySpy).toHaveBeenCalledTimes(5);
    });
  });

  describe('ingest2025Pipeline', () => {
    it('should run all 2025 ingestion steps successfully', async () => {
      const year = 2025;
      jest.spyOn(openf1Service, 'ingestSessionsAndWeather').mockResolvedValue(undefined);
      jest.spyOn(openf1Service, 'ingestGranularData').mockResolvedValue(undefined);
      jest.spyOn(openf1Service, 'ingestModernResultsAndLaps').mockResolvedValue(undefined);
      jest.spyOn(dataSource, 'query').mockResolvedValue([]);

      const result = await service.ingest2025Pipeline(year);

      expect(result.success).toBe(true);
      expect(result.steps).toHaveLength(4);
      expect(openf1Service.ingestSessionsAndWeather).toHaveBeenCalledWith(year);
      expect(openf1Service.ingestGranularData).toHaveBeenCalledWith(year);
      expect(openf1Service.ingestModernResultsAndLaps).toHaveBeenCalledWith(year);
    });

    it('should return failure if any step fails', async () => {
      const year = 2025;
      jest
        .spyOn(openf1Service, 'ingestSessionsAndWeather')
        .mockRejectedValue(new Error('API failed'));

      const result = await service.ingest2025Pipeline(year);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Pipeline failed');
    });
  });

  describe('runFullPipeline', () => {
    it('should run all historical and modern ingestion steps', async () => {
      jest.spyOn(ergastService, 'ingestSeasons').mockResolvedValue(undefined);
      jest.spyOn(ergastService, 'ingestCircuits').mockResolvedValue(undefined);
      jest.spyOn(ergastService, 'ingestConstructors').mockResolvedValue(undefined);
      jest.spyOn(ergastService, 'ingestDrivers').mockResolvedValue(undefined);
      jest.spyOn(ergastService, 'ingestRacesAndSessions').mockResolvedValue(undefined);
      jest.spyOn(ergastService, 'ingestAllResults').mockResolvedValue(undefined);
      jest.spyOn(ergastService, 'ingestAllStandings').mockResolvedValue(undefined);
      jest.spyOn(openf1Service, 'ingestSessionsAndWeather').mockResolvedValue(undefined);
      jest.spyOn(openf1Service, 'ingestGranularData').mockResolvedValue(undefined);
      jest.spyOn(openf1Service, 'ingestModernResultsAndLaps').mockResolvedValue(undefined);
      jest.spyOn(dataSource, 'query').mockResolvedValue([]);

      const result = await service.runFullPipeline();

      expect(result.success).toBe(true);
      expect(ergastService.ingestSeasons).toHaveBeenCalled();
      expect(openf1Service.ingestSessionsAndWeather).toHaveBeenCalledTimes(3); // 2023, 2024, 2025
    });
  });
});

