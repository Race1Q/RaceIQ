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
      let text = response.text();

      this.logger.debug(`Received response: ${text.substring(0, 200)}...`);

      try {
        // Clean the response text before parsing
        // Remove markdown code blocks if present
        text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        
        // Fix common JSON issues from Gemini:
        // 1. Replace smart quotes with regular quotes
        text = text.replace(/[""]/g, '"').replace(/['']/g, "'");
        
        // 2. Fix unescaped quotes within string values
        // This regex finds quotes that are not properly escaped within JSON strings
        text = this.fixUnescapedQuotes(text);
        
        const parsedResponse = JSON.parse(text) as T;
        return parsedResponse;
      } catch (parseError) {
        console.error('SERVICE FAILED:', parseError);
        this.logger.error(`Failed to parse Gemini JSON response: ${text}`, parseError);
        throw new Error('Invalid JSON response from Gemini');
      }
    } catch (error) {
      console.error('SERVICE FAILED:', error);
      this.logger.error('Error calling Gemini API', error);
      throw error;
    }
  }

  /**
   * Fix unescaped quotes within JSON string values
   * This is a helper method to handle Gemini's occasional formatting issues
   */
  private fixUnescapedQuotes(jsonStr: string): string {
    try {
      // Try to parse first - if it works, no need to fix
      JSON.parse(jsonStr);
      return jsonStr;
    } catch (error) {
      console.error('SERVICE FAILED:', error);
      this.logger.debug('JSON parse failed, attempting to fix common issues...');
      
      // Simple approach: Replace double quotes that appear within string values
      // by converting them to single quotes
      // This is safer than trying to escape them
      let fixed = jsonStr;
      
      // Strategy: Find patterns like "text with "quotes" inside" and convert inner quotes to single quotes
      // Match: ": " followed by content with quotes, ending with "
      // We use a greedy match to get the full string content
      fixed = fixed.replace(
        /(":\s*")(.*?)("(?:\s*[,\}\]]|\s*$))/gs,
        (match, prefix, content, suffix) => {
          // If content contains unescaped quotes, replace them with single quotes
          if (content.includes('"') && !content.match(/\\"/)) {
            const fixedContent = content.replace(/"/g, "'");
            return prefix + fixedContent + suffix;
          }
          return match;
        }
      );
      
      // Verify the fix worked
      try {
        JSON.parse(fixed);
        this.logger.debug('Successfully fixed JSON by replacing nested quotes');
        return fixed;
      } catch (secondError) {
        console.error('SERVICE FAILED:', secondError);
        this.logger.warn('Could not automatically fix JSON');
        throw error; // Throw original error
      }
    }
  }

  /**
   * Check if Gemini service is properly configured
   */
  isConfigured(): boolean {
    return !!this.config.get<string>('GEMINI_API_KEY');
  }
}

