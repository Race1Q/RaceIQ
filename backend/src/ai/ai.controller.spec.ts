import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AiController } from './ai.controller';
import { NewsService } from './services/news.service';
import { BioService } from './services/bio.service';
import { PreviewService } from './services/preview.service';
import { QuotaService } from './services/quota.service';
import { ConstructorInfoService } from './services/constructor-info.service';
import { StandingsAnalysisService } from './services/standings-analysis.service';
import { FunFactsService } from './services/fun-facts.service';
import { AiNewsDto } from './dto/ai-news.dto';
import { AiDriverBioDto } from './dto/ai-bio.dto';
import { AiTrackPreviewDto } from './dto/ai-preview.dto';
import { AiConstructorInfoDto } from './dto/ai-constructor-info.dto';
import { AiStandingsAnalysisDto } from './dto/ai-standings-analysis.dto';
import { AiDriverFunFactsDto } from './dto/ai-fun-facts.dto';

describe('AiController', () => {
  let controller: AiController;
  let newsService: jest.Mocked<NewsService>;
  let bioService: jest.Mocked<BioService>;
  let previewService: jest.Mocked<PreviewService>;
  let quotaService: jest.Mocked<QuotaService>;
  let constructorInfoService: jest.Mocked<ConstructorInfoService>;
  let standingsAnalysisService: jest.Mocked<StandingsAnalysisService>;
  let funFactsService: jest.Mocked<FunFactsService>;

  const mockNewsDto: AiNewsDto = {
    summary: 'F1 news summary',
    keyPoints: ['Point 1', 'Point 2'],
    sources: [{ title: 'Source 1', url: 'http://example.com' }],
  };

  const mockBioDto: AiDriverBioDto = {
    biography: 'Driver bio',
    highlights: ['Highlight 1'],
    funFact: 'Fun fact',
  };

  const mockPreviewDto: AiTrackPreviewDto = {
    overview: 'Track overview',
    keyFeatures: ['Feature 1'],
    strategy: 'Strategy insights',
  };

  const mockConstructorInfoDto: AiConstructorInfoDto = {
    overview: 'Constructor overview',
    strengths: ['Strength 1'],
    recentPerformance: 'Performance summary',
  };

  const mockStandingsAnalysisDto: AiStandingsAnalysisDto = {
    analysis: 'Standings analysis',
    keyInsights: ['Insight 1'],
    predictions: 'Championship predictions',
  };

  const mockFunFactsDto: AiDriverFunFactsDto = {
    funFacts: ['Fact 1', 'Fact 2'],
    trivia: ['Trivia 1'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        {
          provide: NewsService,
          useValue: {
            getNews: jest.fn(),
          },
        },
        {
          provide: BioService,
          useValue: {
            getDriverBio: jest.fn(),
          },
        },
        {
          provide: PreviewService,
          useValue: {
            getTrackPreview: jest.fn(),
          },
        },
        {
          provide: QuotaService,
          useValue: {
            getRemaining: jest.fn(),
          },
        },
        {
          provide: ConstructorInfoService,
          useValue: {
            getConstructorInfo: jest.fn(),
          },
        },
        {
          provide: StandingsAnalysisService,
          useValue: {
            getStandingsAnalysis: jest.fn(),
          },
        },
        {
          provide: FunFactsService,
          useValue: {
            getDriverFunFacts: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AiController>(AiController);
    newsService = module.get(NewsService);
    bioService = module.get(BioService);
    previewService = module.get(PreviewService);
    quotaService = module.get(QuotaService);
    constructorInfoService = module.get(ConstructorInfoService);
    standingsAnalysisService = module.get(StandingsAnalysisService);
    funFactsService = module.get(FunFactsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getNews', () => {
    it('should return AI-generated news with default topic', async () => {
      newsService.getNews.mockResolvedValue(mockNewsDto);

      const result = await controller.getNews('f1');

      expect(result).toEqual(mockNewsDto);
      expect(newsService.getNews).toHaveBeenCalledWith('f1');
    });

    it('should return AI-generated news with custom topic', async () => {
      newsService.getNews.mockResolvedValue(mockNewsDto);

      const result = await controller.getNews('verstappen');

      expect(result).toEqual(mockNewsDto);
      expect(newsService.getNews).toHaveBeenCalledWith('verstappen');
    });
  });

  describe('getDriverBio', () => {
    it('should return driver biography without season', async () => {
      bioService.getDriverBio.mockResolvedValue(mockBioDto);

      const result = await controller.getDriverBio(1, undefined);

      expect(result).toEqual(mockBioDto);
      expect(bioService.getDriverBio).toHaveBeenCalledWith(1, undefined);
    });

    it('should return driver biography with season', async () => {
      bioService.getDriverBio.mockResolvedValue(mockBioDto);

      const result = await controller.getDriverBio(1, '2023');

      expect(result).toEqual(mockBioDto);
      expect(bioService.getDriverBio).toHaveBeenCalledWith(1, 2023);
    });
  });

  describe('getTrackPreview', () => {
    it('should return track preview without eventId', async () => {
      previewService.getTrackPreview.mockResolvedValue(mockPreviewDto);

      const result = await controller.getTrackPreview('monaco', undefined);

      expect(result).toEqual(mockPreviewDto);
      expect(previewService.getTrackPreview).toHaveBeenCalledWith('monaco', undefined);
    });

    it('should return track preview with eventId', async () => {
      previewService.getTrackPreview.mockResolvedValue(mockPreviewDto);

      const result = await controller.getTrackPreview('monaco', '123');

      expect(result).toEqual(mockPreviewDto);
      expect(previewService.getTrackPreview).toHaveBeenCalledWith('monaco', 123);
    });
  });

  describe('getConstructorInfo', () => {
    it('should return constructor info without season', async () => {
      constructorInfoService.getConstructorInfo.mockResolvedValue(mockConstructorInfoDto);

      const result = await controller.getConstructorInfo(1, undefined);

      expect(result).toEqual(mockConstructorInfoDto);
      expect(constructorInfoService.getConstructorInfo).toHaveBeenCalledWith(1, undefined);
    });

    it('should return constructor info with season', async () => {
      constructorInfoService.getConstructorInfo.mockResolvedValue(mockConstructorInfoDto);

      const result = await controller.getConstructorInfo(1, '2023');

      expect(result).toEqual(mockConstructorInfoDto);
      expect(constructorInfoService.getConstructorInfo).toHaveBeenCalledWith(1, 2023);
    });
  });

  describe('getStandingsAnalysis', () => {
    it('should return standings analysis without season', async () => {
      standingsAnalysisService.getStandingsAnalysis.mockResolvedValue(mockStandingsAnalysisDto);

      const result = await controller.getStandingsAnalysis(undefined);

      expect(result).toEqual(mockStandingsAnalysisDto);
      expect(standingsAnalysisService.getStandingsAnalysis).toHaveBeenCalledWith(undefined);
    });

    it('should return standings analysis with season', async () => {
      standingsAnalysisService.getStandingsAnalysis.mockResolvedValue(mockStandingsAnalysisDto);

      const result = await controller.getStandingsAnalysis('2023');

      expect(result).toEqual(mockStandingsAnalysisDto);
      expect(standingsAnalysisService.getStandingsAnalysis).toHaveBeenCalledWith(2023);
    });
  });

  describe('getDriverFunFacts', () => {
    it('should return driver fun facts without season', async () => {
      funFactsService.getDriverFunFacts.mockResolvedValue(mockFunFactsDto);

      const result = await controller.getDriverFunFacts(1, undefined);

      expect(result).toEqual(mockFunFactsDto);
      expect(funFactsService.getDriverFunFacts).toHaveBeenCalledWith(1, undefined);
    });

    it('should return driver fun facts with valid season', async () => {
      funFactsService.getDriverFunFacts.mockResolvedValue(mockFunFactsDto);

      const result = await controller.getDriverFunFacts(1, '2023');

      expect(result).toEqual(mockFunFactsDto);
      expect(funFactsService.getDriverFunFacts).toHaveBeenCalledWith(1, 2023);
    });

    it('should throw BadRequestException for invalid season format', async () => {
      await expect(controller.getDriverFunFacts(1, 'invalid')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for season before 1950', async () => {
      await expect(controller.getDriverFunFacts(1, '1949')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for season too far in future', async () => {
      const futureYear = new Date().getFullYear() + 2;
      await expect(controller.getDriverFunFacts(1, futureYear.toString())).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getQuota', () => {
    it('should return quota information', async () => {
      quotaService.getRemaining.mockReturnValue(1200);

      const result = await controller.getQuota();

      expect(result).toEqual({
        remaining: 1200,
        limit: 1500,
        used: 300,
      });
      expect(quotaService.getRemaining).toHaveBeenCalled();
    });

    it('should return zero remaining when quota exhausted', async () => {
      quotaService.getRemaining.mockReturnValue(0);

      const result = await controller.getQuota();

      expect(result).toEqual({
        remaining: 0,
        limit: 1500,
        used: 1500,
      });
    });
  });
});

