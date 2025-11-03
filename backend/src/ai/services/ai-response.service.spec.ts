import { Test, TestingModule } from '@nestjs/testing';
import { AiResponseService } from './ai-response.service';
import { AiResponseRepository } from '../repositories/ai-response.repository';
import { AiResponse } from '../entities/ai-response.entity';

describe('AiResponseService', () => {
  let service: AiResponseService;
  let repository: AiResponseRepository;

  const mockRepository = {
    findLatest: jest.fn(),
    store: jest.fn(),
    findByEntity: jest.fn(),
    deleteOldResponses: jest.fn(),
    getStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiResponseService,
        {
          provide: AiResponseRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AiResponseService>(AiResponseService);
    repository = module.get<AiResponseRepository>(AiResponseRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getLatestResponse', () => {
    it('should return latest response when found', async () => {
      const mockResponse = {
        id: 1,
        responseType: 'fun_facts',
        entityType: 'driver',
        entityId: 1,
        season: 2024,
        eventId: null,
        responseData: { title: 'Test Facts', facts: ['Fact 1'] },
        generatedAt: new Date(),
        isFallback: false,
        aiAttribution: 'Powered by Gemini AI',
        createdAt: new Date(),
      };

      mockRepository.findLatest.mockResolvedValue(mockResponse);

      const result = await service.getLatestResponse('fun_facts', 'driver', 1, 2024);

      expect(result).toEqual(mockResponse.responseData);
      expect(mockRepository.findLatest).toHaveBeenCalledWith('fun_facts', 'driver', 1, 2024, undefined);
    });

    it('should return null when no response found', async () => {
      mockRepository.findLatest.mockResolvedValue(null);

      const result = await service.getLatestResponse('fun_facts', 'driver', 1, 2024);

      expect(result).toBeNull();
    });
  });

  describe('storeResponse', () => {
    it('should store response successfully', async () => {
      const responseData = { title: 'Test Facts', facts: ['Fact 1'] };
      const mockStoredResponse = {
        id: 1,
        responseType: 'fun_facts',
        entityType: 'driver',
        entityId: 1,
        season: 2024,
        eventId: null,
        responseData,
        generatedAt: new Date(),
        isFallback: false,
        aiAttribution: 'Powered by Gemini AI',
        createdAt: new Date(),
      };

      mockRepository.store.mockResolvedValue(mockStoredResponse);

      await service.storeResponse('fun_facts', 'driver', 1, responseData, 2024);

      expect(mockRepository.store).toHaveBeenCalledWith(
        'fun_facts',
        'driver',
        1,
        responseData,
        2024,
        undefined,
        false,
        undefined,
      );
    });
  });

  describe('getResponseWithFallback', () => {
    it('should return latest response when available', async () => {
      const mockResponse = {
        id: 1,
        responseType: 'fun_facts',
        entityType: 'driver',
        entityId: 1,
        season: 2024,
        eventId: null,
        responseData: { title: 'Test Facts', facts: ['Fact 1'] },
        generatedAt: new Date(),
        isFallback: false,
        aiAttribution: 'Powered by Gemini AI',
        createdAt: new Date(),
      };

      mockRepository.findLatest.mockResolvedValue(mockResponse);
      const fallbackGenerator = jest.fn();

      const result = await service.getResponseWithFallback(
        'fun_facts',
        'driver',
        1,
        fallbackGenerator,
        2024,
      );

      expect(result).toEqual(mockResponse.responseData);
      expect(fallbackGenerator).not.toHaveBeenCalled();
    });

    it('should call fallback generator when no response found', async () => {
      mockRepository.findLatest.mockResolvedValue(null);
      const fallbackResponse = { title: 'Fallback Facts', facts: ['Fallback Fact'] };
      const fallbackGenerator = jest.fn().mockReturnValue(fallbackResponse);

      const result = await service.getResponseWithFallback(
        'fun_facts',
        'driver',
        1,
        fallbackGenerator,
        2024,
      );

      expect(result).toEqual(fallbackResponse);
      expect(fallbackGenerator).toHaveBeenCalled();
    });
  });
});
