import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface NewsArticle {
  title: string;
  url: string;
  source: string;
  publishedAt?: string;
  description?: string;
}

@Injectable()
export class NewsFeedAdapter {
  private readonly logger = new Logger(NewsFeedAdapter.name);
  
  // F1 RSS feed endpoint
  private readonly F1_RSS_URL = 'https://www.formula1.com/content/fom-website/en/latest/all.xml';
  
  constructor(private readonly httpService: HttpService) {}

  /**
   * Fetch latest F1 news articles
   * @param topic News topic filter (not used with F1 RSS, but kept for future extensibility)
   * @param limit Maximum number of articles to fetch
   */
  async fetchNews(topic: string = 'f1', limit: number = 10): Promise<NewsArticle[]> {
    try {
      this.logger.log(`Fetching F1 news for topic: ${topic}`);
      
      // Try to fetch from F1 RSS feed first
      const articles = await this.fetchFromRSS(limit);
      
      if (articles.length > 0) {
        this.logger.log(`Fetched ${articles.length} articles from F1 RSS feed`);
        return articles;
      }

      // Fallback to mock data if RSS fails (for development/testing)
      this.logger.warn('RSS feed failed, returning fallback mock news');
      return this.getFallbackNews(limit);
      
    } catch (error) {
      this.logger.error(`Failed to fetch news: ${error.message}`);
      // Return fallback data rather than throwing
      return this.getFallbackNews(limit);
    }
  }

  // Fetch news from F1's RSS feed
  private async fetchFromRSS(limit: number): Promise<NewsArticle[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(this.F1_RSS_URL, {
          timeout: 10000,
          headers: {
            'User-Agent': 'RaceIQ/1.0',
          },
        })
      );

      const xmlData = response.data;
      
      // Simple XML parsing for RSS (in production, consider using an XML parser library)
      const articles: NewsArticle[] = [];
      const itemMatches = xmlData.matchAll(/<item>([\s\S]*?)<\/item>/g);
      
      for (const match of itemMatches) {
        if (articles.length >= limit) break;
        
        const itemXml = match[1];
        const title = this.extractXmlTag(itemXml, 'title');
        const link = this.extractXmlTag(itemXml, 'link');
        const pubDate = this.extractXmlTag(itemXml, 'pubDate');
        const description = this.extractXmlTag(itemXml, 'description');
        
        if (title && link) {
          articles.push({
            title: this.cleanHtml(title),
            url: link,
            source: 'Formula1.com',
            publishedAt: pubDate || undefined,
            description: description ? this.cleanHtml(description) : undefined,
          });
        }
      }
      
      return articles;
    } catch (error) {
      this.logger.warn(`RSS fetch failed: ${error.message}`);
      return [];
    }
  }

  // Extract content from XML tag
  private extractXmlTag(xml: string, tagName: string): string | null {
    const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\/${tagName}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1].trim() : null;
  }

  // Clean HTML tags and entities from text
  private cleanHtml(text: string): string {
    return text
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  // Fallback news for when RSS fails (development/testing)
  private getFallbackNews(limit: number): NewsArticle[] {
    const fallbackArticles: NewsArticle[] = [
      {
        title: 'F1 Announces 2025 Calendar Updates',
        url: 'https://www.formula1.com',
        source: 'Formula1.com',
        publishedAt: new Date().toISOString(),
        description: 'The FIA has confirmed updates to the 2025 Formula 1 calendar.',
      },
      {
        title: 'Championship Battle Intensifies',
        url: 'https://www.formula1.com',
        source: 'Formula1.com',
        publishedAt: new Date().toISOString(),
        description: 'The fight for the championship continues with close competition.',
      },
      {
        title: 'New Technical Regulations Announced',
        url: 'https://www.formula1.com',
        source: 'Formula1.com',
        publishedAt: new Date().toISOString(),
        description: 'FIA announces new technical regulations for future seasons.',
      },
      {
        title: 'Team Announces Driver Lineup Changes',
        url: 'https://www.formula1.com',
        source: 'Formula1.com',
        publishedAt: new Date().toISOString(),
        description: 'Major team announces changes to their driver lineup.',
      },
      {
        title: 'Tyre Strategy Innovations Continue',
        url: 'https://www.formula1.com',
        source: 'Formula1.com',
        publishedAt: new Date().toISOString(),
        description: 'Teams continue to innovate with tyre strategies across different circuits.',
      },
    ];

    return fallbackArticles.slice(0, limit);
  }
}

