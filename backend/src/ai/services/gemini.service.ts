import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly genAI: GoogleGenerativeAI;
  private readonly model: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY is not set. AI features will not work.');
      throw new Error('GEMINI_API_KEY is not configured');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    
    const modelName = this.config.get<string>('GEMINI_MODEL');
    if (!modelName) {
      this.logger.warn('GEMINI_MODEL is not set. AI features will not work.');
      throw new Error('GEMINI_MODEL is not configured');
    }
    this.model = modelName;
    
    this.logger.log(`Gemini service initialized with model: ${this.model}`);
  }

  /**
   * Generate content using Gemini with JSON response mode
   * @param systemPrompt The system instructions for the model
   * @param userPrompt The user's input/query
   * @returns Parsed JSON response of type T
   */
  async generateJSON<T>(systemPrompt: string, userPrompt: string): Promise<T> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: this.model,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;
      this.logger.debug(`Generating content with prompt length: ${combinedPrompt.length} characters`);

      const result = await model.generateContent(combinedPrompt);
      const response = result.response;
      const text = response.text();

      this.logger.debug(`Received response: ${text.substring(0, 200)}...`);

      try {
        const parsedResponse = JSON.parse(text) as T;
        return parsedResponse;
      } catch (parseError) {
        this.logger.error(`Failed to parse Gemini JSON response: ${text}`, parseError);
        throw new Error('Invalid JSON response from Gemini');
      }
    } catch (error) {
      this.logger.error('Error calling Gemini API', error);
      throw error;
    }
  }

  /**
   * Check if Gemini service is properly configured
   */
  isConfigured(): boolean {
    return !!this.config.get<string>('GEMINI_API_KEY');
  }
}

