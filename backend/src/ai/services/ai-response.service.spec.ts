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
    deleteLatest: jest.fn(),
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

  describe('getLatestResponseIfValid', () => {
    it('should return data with isExpired false when response is not expired', async () => {
      const now = Date.now();
      const generatedAt = new Date(now - 1000 * 1000); // 1000 seconds ago (16.67 minutes)
      const ttlSeconds = 7200; // 2 hours TTL

      const mockResponse = {
        id: 1,
        responseType: 'news',
        entityType: 'general',
        entityId: 0,
        season: null,
        eventId: null,
        responseData: { summary: 'Test news', bullets: ['Bullet 1'] },
        generatedAt,
        isFallback: false,
        aiAttribution: 'Powered by Gemini AI',
        createdAt: new Date(),
      };

      mockRepository.findLatest.mockResolvedValue(mockResponse);

      const result = await service.getLatestResponseIfValid('news', 'general', 0, ttlSeconds);

      expect(result).toEqual({
        data: mockResponse.responseData,
        isExpired: false,
      });
      expect(mockRepository.findLatest).toHaveBeenCalledWith('news', 'general', 0, undefined, undefined);
    });

    it('should return data with isExpired true when response is expired', async () => {
      const now = Date.now();
      const generatedAt = new Date(now - 10000 * 1000); // 10000 seconds ago (2.78 hours)
      const ttlSeconds = 7200; // 2 hours TTL

      const mockResponse = {
        id: 1,
        responseType: 'news',
        entityType: 'general',
        entityId: 0,
        season: null,
        eventId: null,
        responseData: { summary: 'Test news', bullets: ['Bullet 1'] },
        generatedAt,
        isFallback: false,
        aiAttribution: 'Powered by Gemini AI',
        createdAt: new Date(),
      };

      mockRepository.findLatest.mockResolvedValue(mockResponse);

      const result = await service.getLatestResponseIfValid('news', 'general', 0, ttlSeconds);

      expect(result).toEqual({
        data: mockResponse.responseData,
        isExpired: true,
      });
    });

    it('should return null when no response found', async () => {
      mockRepository.findLatest.mockResolvedValue(null);

      const result = await service.getLatestResponseIfValid('news', 'general', 0, 7200);

      expect(result).toBeNull();
    });

    it('should treat response as expired when generatedAt is null', async () => {
      const mockResponse = {
        id: 1,
        responseType: 'news',
        entityType: 'general',
        entityId: 0,
        season: null,
        eventId: null,
        responseData: { summary: 'Test news', bullets: ['Bullet 1'] },
        generatedAt: null,
        isFallback: false,
        aiAttribution: 'Powered by Gemini AI',
        createdAt: new Date(),
      };

      mockRepository.findLatest.mockResolvedValue(mockResponse);

      const result = await service.getLatestResponseIfValid('news', 'general', 0, 7200);

      expect(result).toEqual({
        data: mockResponse.responseData,
        isExpired: true,
      });
    });

    it('should handle edge case where response expires exactly at TTL boundary', async () => {
      const now = Date.now();
      const ttlSeconds = 7200; // 2 hours
      const generatedAt = new Date(now - ttlSeconds * 1000); // Exactly at TTL boundary

      const mockResponse = {
        id: 1,
        responseType: 'news',
        entityType: 'general',
        entityId: 0,
        season: null,
        eventId: null,
        responseData: { summary: 'Test news', bullets: ['Bullet 1'] },
        generatedAt,
        isFallback: false,
        aiAttribution: 'Powered by Gemini AI',
        createdAt: new Date(),
      };

      mockRepository.findLatest.mockResolvedValue(mockResponse);

      const result = await service.getLatestResponseIfValid('news', 'general', 0, ttlSeconds);

      // Should be expired (age >= ttlSeconds)
      expect(result).toEqual({
        data: mockResponse.responseData,
        isExpired: true,
      });
    });
  });

  describe('deleteLatestResponse', () => {
    it('should delete latest response successfully', async () => {
      mockRepository.deleteLatest.mockResolvedValue(true);

      await service.deleteLatestResponse('news', 'general', 0, undefined, undefined);

      expect(mockRepository.deleteLatest).toHaveBeenCalledWith('news', 'general', 0, undefined, undefined);
    });

    it('should handle case when no response found to delete', async () => {
      mockRepository.deleteLatest.mockResolvedValue(false);

      await service.deleteLatestResponse('news', 'general', 0, undefined, undefined);

      expect(mockRepository.deleteLatest).toHaveBeenCalledWith('news', 'general', 0, undefined, undefined);
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Database error');
      mockRepository.deleteLatest.mockRejectedValue(error);

      // Should not throw
      await expect(
        service.deleteLatestResponse('news', 'general', 0, undefined, undefined),
      ).resolves.not.toThrow();

      expect(mockRepository.deleteLatest).toHaveBeenCalled();
    });
  });
});
