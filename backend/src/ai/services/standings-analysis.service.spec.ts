import { Test, TestingModule } from '@nestjs/testing';
import { StandingsAnalysisService } from './standings-analysis.service';
import { GeminiService } from './gemini.service';
import { PersistentCacheService } from '../cache/persistent-cache.service';
import { StandingsService } from '../../standings/standings.service';
import { AiStandingsAnalysisDto } from '../dto/ai-standings-analysis.dto';

describe('StandingsAnalysisService', () => {
  let service: StandingsAnalysisService;
  let geminiService: jest.Mocked<GeminiService>;
  let cacheService: jest.Mocked<PersistentCacheService>;
  let standingsService: jest.Mocked<StandingsService>;

  const mockStandingsData = {
    driverStandings: [
      {
        position: 1,
        driverFullName: 'Max Verstappen',
        constructorName: 'Red Bull Racing',
        points: 575,
        wins: 19,
      },
      {
        position: 2,
        driverFullName: 'Sergio Perez',
        constructorName: 'Red Bull Racing',
        points: 285,
        wins: 2,
      },
    ],
    constructorStandings: [
      {
        position: 1,
        team: { name: 'Red Bull Racing' },
        points: 860,
        wins: 21,
      },
      {
        position: 2,
        team: { name: 'Mercedes' },
        points: 409,
        wins: 0,
      },
    ],
  };

  const mockGeminiResponse = {
    overview: 'Red Bull dominates the 2023 championship',
    keyInsights: [
      'Verstappen leading by huge margin',
      'Red Bull securing constructor title early',
    ],
    driverAnalysis: {
      leader: 'Max Verstappen is unstoppable',
      biggestRiser: 'Lando Norris showing great form',
      biggestFall: 'Some drivers struggled with new regs',
      midfieldBattle: 'Tight battle for P5-P10',
    },
    constructorAnalysis: {
      leader: 'Red Bull dominant',
      competition: 'Mercedes fighting for P2',
      surprises: 'Aston Martin strong start',
    },
    trends: ['Red Bull dominance', 'Midfield competitiveness'],
    predictions: ['Verstappen likely champion', 'Constructor battle intensifies'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StandingsAnalysisService,
        {
          provide: GeminiService,
          useValue: {
            generateJSON: jest.fn(),
            isConfigured: jest.fn().mockReturnValue(true),
          },
        },
        {
          provide: PersistentCacheService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
        {
          provide: StandingsService,
          useValue: {
            getStandingsByYear: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StandingsAnalysisService>(StandingsAnalysisService);
    geminiService = module.get(GeminiService);
    cacheService = module.get(PersistentCacheService);
    standingsService = module.get(StandingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStandingsAnalysis - cache hit path', () => {
    it('should return cached analysis when available', async () => {
      const cachedAnalysis: AiStandingsAnalysisDto = {
        overview: 'Cached overview',
        keyInsights: ['Cached insight'],
        driverAnalysis: {
          leader: 'Cached leader',
          biggestRiser: 'Cached riser',
          biggestFall: 'Cached fall',
          midfieldBattle: 'Cached midfield',
        },
        constructorAnalysis: {
          leader: 'Cached constructor leader',
          competition: 'Cached competition',
          surprises: 'Cached surprises',
        },
        trends: ['Cached trend'],
        predictions: ['Cached prediction'],
        generatedAt: new Date().toISOString(),
        isFallback: false,
      };
      
      cacheService.get.mockReturnValue(cachedAnalysis);

      const result = await service.getStandingsAnalysis();

      expect(result).toEqual(cachedAnalysis);
      expect(standingsService.getStandingsByYear).not.toHaveBeenCalled();
      expect(geminiService.generateJSON).not.toHaveBeenCalled();
    });

    it('should use current year cache key when no season provided', async () => {
      const currentYear = new Date().getFullYear();
      cacheService.get.mockReturnValue(null);
      standingsService.getStandingsByYear.mockResolvedValue(mockStandingsData as any);
      geminiService.generateJSON.mockResolvedValue(mockGeminiResponse);

      await service.getStandingsAnalysis();

      expect(cacheService.get).toHaveBeenCalledWith(`standings-analysis-${currentYear}`);
    });

    it('should use season cache key when season provided', async () => {
      cacheService.get.mockReturnValue(null);
      standingsService.getStandingsByYear.mockResolvedValue(mockStandingsData as any);
      geminiService.generateJSON.mockResolvedValue(mockGeminiResponse);

      await service.getStandingsAnalysis(2023);

      expect(cacheService.get).toHaveBeenCalledWith('standings-analysis-2023');
    });
  });

  describe('getStandingsAnalysis - AI generation path', () => {
    beforeEach(() => {
      cacheService.get.mockReturnValue(null);
      standingsService.getStandingsByYear.mockResolvedValue(mockStandingsData as any);
      geminiService.generateJSON.mockResolvedValue(mockGeminiResponse);
    });

    it('should generate analysis when cache is empty', async () => {
      const result = await service.getStandingsAnalysis(2023);

      expect(result).toMatchObject({
        overview: expect.stringContaining('dominates'),
        keyInsights: expect.any(Array),
        driverAnalysis: expect.any(Object),
        constructorAnalysis: expect.any(Object),
        isFallback: false,
      });
    });

    it('should fetch standings for specified season', async () => {
      await service.getStandingsAnalysis(2023);

      expect(standingsService.getStandingsByYear).toHaveBeenCalledWith(2023);
    });

    it('should fetch standings for current year when no season provided', async () => {
      const currentYear = new Date().getFullYear();
      
      await service.getStandingsAnalysis();

      expect(standingsService.getStandingsByYear).toHaveBeenCalledWith(currentYear);
    });

    it('should pass standings data to Gemini', async () => {
      await service.getStandingsAnalysis(2023);

      const callArgs = geminiService.generateJSON.mock.calls[0];
      expect(callArgs[1]).toContain('Max Verstappen');
      expect(callArgs[1]).toContain('Red Bull Racing');
      expect(callArgs[1]).toContain('575');
    });

    it('should cache generated analysis with 12 hour TTL', async () => {
      await service.getStandingsAnalysis(2023);

      expect(cacheService.set).toHaveBeenCalledWith(
        'standings-analysis-2023',
        expect.any(Object),
        43200, // 12 hours * 3600 seconds
      );
    });

    it('should include generatedAt timestamp', async () => {
      const result = await service.getStandingsAnalysis(2023);

      expect(result.generatedAt).toBeTruthy();
      expect(new Date(result.generatedAt).getTime()).toBeGreaterThan(0);
    });
  });

  describe('getStandingsAnalysis - error handling and fallback', () => {
    beforeEach(() => {
      cacheService.get.mockReturnValue(null);
    });

    it('should return fallback on standings fetch error', async () => {
      standingsService.getStandingsByYear.mockRejectedValue(new Error('DB error'));

      const result = await service.getStandingsAnalysis(2023);

      expect(result.isFallback).toBe(true);
      expect(result.overview).toContain('2023 Formula 1 season');
      expect(geminiService.generateJSON).not.toHaveBeenCalled();
    });

    it('should return fallback on Gemini API error', async () => {
      standingsService.getStandingsByYear.mockResolvedValue(mockStandingsData as any);
      geminiService.generateJSON.mockRejectedValue(new Error('API error'));

      const result = await service.getStandingsAnalysis(2023);

      expect(result.isFallback).toBe(true);
    });

    it('should have structured fallback response', async () => {
      standingsService.getStandingsByYear.mockRejectedValue(new Error('Error'));

      const result = await service.getStandingsAnalysis(2023);

      expect(result).toMatchObject({
        overview: expect.stringContaining('Formula 1 season'),
        keyInsights: expect.any(Array),
        driverAnalysis: expect.objectContaining({
          leader: expect.any(String),
          biggestRiser: expect.any(String),
          biggestFall: expect.any(String),
          midfieldBattle: expect.any(String),
        }),
        constructorAnalysis: expect.objectContaining({
          leader: expect.any(String),
          competition: expect.any(String),
          surprises: expect.any(String),
        }),
        trends: expect.any(Array),
        predictions: expect.any(Array),
        isFallback: true,
      });
    });

    it('should use current year in fallback when no season provided', async () => {
      const currentYear = new Date().getFullYear();
      standingsService.getStandingsByYear.mockRejectedValue(new Error('Error'));

      const result = await service.getStandingsAnalysis();

      expect(result.overview).toContain(currentYear.toString());
    });

    it('should not cache fallback responses', async () => {
      standingsService.getStandingsByYear.mockRejectedValue(new Error('Error'));

      await service.getStandingsAnalysis(2023);

      expect(cacheService.set).not.toHaveBeenCalled();
    });
  });

  describe('analysis content validation', () => {
    beforeEach(() => {
      cacheService.get.mockReturnValue(null);
      standingsService.getStandingsByYear.mockResolvedValue(mockStandingsData as any);
      geminiService.generateJSON.mockResolvedValue(mockGeminiResponse);
    });

    it('should include insights array', async () => {
      const result = await service.getStandingsAnalysis(2023);

      expect(Array.isArray(result.keyInsights)).toBe(true);
      expect(result.keyInsights.length).toBeGreaterThan(0);
    });

    it('should include driver analysis object', async () => {
      const result = await service.getStandingsAnalysis(2023);

      expect(result.driverAnalysis).toBeDefined();
      expect(result.driverAnalysis.leader).toBeTruthy();
    });

    it('should include constructor analysis object', async () => {
      const result = await service.getStandingsAnalysis(2023);

      expect(result.constructorAnalysis).toBeDefined();
      expect(result.constructorAnalysis.leader).toBeTruthy();
    });

    it('should include trends and predictions arrays', async () => {
      const result = await service.getStandingsAnalysis(2023);

      expect(Array.isArray(result.trends)).toBe(true);
      expect(Array.isArray(result.predictions)).toBe(true);
    });
  });
});
