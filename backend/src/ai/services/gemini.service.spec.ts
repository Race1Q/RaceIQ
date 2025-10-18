import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GeminiService } from './gemini.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock the Google Generative AI SDK
jest.mock('@google/generative-ai');

describe('GeminiService', () => {
  let service: GeminiService;
  let configService: jest.Mocked<ConfigService>;
  let mockGenAI: jest.Mocked<GoogleGenerativeAI>;
  let mockModel: any;

  beforeEach(async () => {
    // Setup mock model
    mockModel = {
      generateContent: jest.fn(),
    };

    // Setup mock GoogleGenerativeAI
    mockGenAI = {
      getGenerativeModel: jest.fn().mockReturnValue(mockModel),
    } as any;

    (GoogleGenerativeAI as jest.Mock).mockImplementation(() => mockGenAI);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeminiService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'GEMINI_API_KEY') return 'test-api-key';
              if (key === 'GEMINI_MODEL') return 'gemini-1.5-flash';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<GeminiService>(GeminiService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw error when GEMINI_API_KEY is not set', () => {
    configService.get.mockImplementation((key: string) => {
      if (key === 'GEMINI_API_KEY') return null;
      if (key === 'GEMINI_MODEL') return 'gemini-1.5-flash';
      return null;
    });

    expect(() => {
      new GeminiService(configService);
    }).toThrow('GEMINI_API_KEY is not configured');
  });

  it('should throw error when GEMINI_MODEL is not set', () => {
    configService.get.mockImplementation((key: string) => {
      if (key === 'GEMINI_API_KEY') return 'test-api-key';
      if (key === 'GEMINI_MODEL') return null;
      return null;
    });

    expect(() => {
      new GeminiService(configService);
    }).toThrow('GEMINI_MODEL is not configured');
  });

  describe('generateJSON', () => {
    it('should generate and parse JSON response successfully', async () => {
      const mockResponse = {
        summary: 'Test summary',
        points: ['Point 1', 'Point 2'],
      };

      mockModel.generateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify(mockResponse),
        },
      });

      const result = await service.generateJSON<typeof mockResponse>(
        'System prompt',
        'User prompt',
      );

      expect(result).toEqual(mockResponse);
      expect(mockModel.generateContent).toHaveBeenCalledWith(
        'System prompt\n\nUser prompt',
      );
    });

    it('should clean markdown code blocks from response', async () => {
      const mockResponse = { data: 'test' };
      const responseWithMarkdown = '```json\n' + JSON.stringify(mockResponse) + '\n```';

      mockModel.generateContent.mockResolvedValue({
        response: {
          text: () => responseWithMarkdown,
        },
      });

      const result = await service.generateJSON<typeof mockResponse>(
        'System prompt',
        'User prompt',
      );

      expect(result).toEqual(mockResponse);
    });

    it('should replace smart quotes with regular quotes', async () => {
      const responseWithSmartQuotes = '{"data": "test"}'; // Using smart quotes

      mockModel.generateContent.mockResolvedValue({
        response: {
          text: () => responseWithSmartQuotes,
        },
      });

      const result = await service.generateJSON<{ data: string }>(
        'System prompt',
        'User prompt',
      );

      expect(result).toEqual({ data: 'test' });
    });

    it('should throw error for invalid JSON response', async () => {
      mockModel.generateContent.mockResolvedValue({
        response: {
          text: () => 'Invalid JSON {{{',
        },
      });

      await expect(
        service.generateJSON('System prompt', 'User prompt'),
      ).rejects.toThrow('Invalid JSON response from Gemini');
    });

    it('should handle Gemini API errors', async () => {
      const apiError = new Error('API Rate Limit');
      mockModel.generateContent.mockRejectedValue(apiError);

      await expect(
        service.generateJSON('System prompt', 'User prompt'),
      ).rejects.toThrow(apiError);
    });

    it('should fix unescaped quotes in JSON strings', async () => {
      // This simulates Gemini returning JSON with unescaped quotes
      const problematicJson = '{"text": "He said "hello" to me"}';
      
      mockModel.generateContent.mockResolvedValue({
        response: {
          text: () => problematicJson,
        },
      });

      const result = await service.generateJSON<{ text: string }>(
        'System prompt',
        'User prompt',
      );

      // The service should fix the quotes and parse successfully
      expect(result).toHaveProperty('text');
      expect(result.text).toContain('hello');
    });
  });

  describe('isConfigured', () => {
    it('should return true when API key is configured', () => {
      configService.get.mockReturnValue('test-api-key');

      const result = service.isConfigured();

      expect(result).toBe(true);
      expect(configService.get).toHaveBeenCalledWith('GEMINI_API_KEY');
    });

    it('should return false when API key is not configured', () => {
      configService.get.mockReturnValue(null);

      const result = service.isConfigured();

      expect(result).toBe(false);
    });
  });
});

