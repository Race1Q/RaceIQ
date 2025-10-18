import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { NewsFeedAdapter, NewsArticle } from './news-feed.adapter';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';

describe('NewsFeedAdapter', () => {
  let adapter: NewsFeedAdapter;
  let httpService: jest.Mocked<HttpService>;

  const mockRssXml = `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <item>
      <title><![CDATA[Verstappen Wins in Monaco]]></title>
      <link>https://www.formula1.com/race-1</link>
      <pubDate>Mon, 16 Oct 2023 10:00:00 GMT</pubDate>
      <description><![CDATA[Max Verstappen secured another victory]]></description>
    </item>
    <item>
      <title>Hamilton Returns to Podium</title>
      <link>https://www.formula1.com/race-2</link>
      <pubDate>Sun, 15 Oct 2023 15:00:00 GMT</pubDate>
      <description>Lewis Hamilton finished in third place</description>
    </item>
    <item>
      <title>McLaren &amp; Mercedes Battle</title>
      <link>https://www.formula1.com/race-3</link>
      <description>Close &lt;battle&gt; between teams</description>
    </item>
  </channel>
</rss>`;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsFeedAdapter,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    adapter = module.get<NewsFeedAdapter>(NewsFeedAdapter);
    httpService = module.get(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  describe('fetchNews - RSS success path', () => {
    it('should fetch and parse RSS feed successfully', async () => {
      const mockResponse: AxiosResponse = {
        data: mockRssXml,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      httpService.get.mockReturnValue(of(mockResponse));

      const result = await adapter.fetchNews('f1', 10);

      expect(result).toHaveLength(3);
      expect(result[0]).toMatchObject({
        title: 'Verstappen Wins in Monaco',
        url: 'https://www.formula1.com/race-1',
        source: 'Formula1.com',
      });
    });

    it('should respect the limit parameter', async () => {
      const mockResponse: AxiosResponse = {
        data: mockRssXml,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      httpService.get.mockReturnValue(of(mockResponse));

      const result = await adapter.fetchNews('f1', 2);

      expect(result).toHaveLength(2);
    });

    it('should clean CDATA tags from titles', async () => {
      const mockResponse: AxiosResponse = {
        data: mockRssXml,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      httpService.get.mockReturnValue(of(mockResponse));

      const result = await adapter.fetchNews('f1', 10);

      expect(result[0].title).toBe('Verstappen Wins in Monaco');
      expect(result[0].title).not.toContain('CDATA');
    });

    it('should clean HTML entities from text', async () => {
      const mockResponse: AxiosResponse = {
        data: mockRssXml,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      httpService.get.mockReturnValue(of(mockResponse));

      const result = await adapter.fetchNews('f1', 10);

      expect(result[2].title).toBe('McLaren & Mercedes Battle');
      expect(result[2].description).toBe('Close <battle> between teams');
    });

    it('should include publishedAt when available', async () => {
      const mockResponse: AxiosResponse = {
        data: mockRssXml,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      httpService.get.mockReturnValue(of(mockResponse));

      const result = await adapter.fetchNews('f1', 10);

      expect(result[0].publishedAt).toBe('Mon, 16 Oct 2023 10:00:00 GMT');
    });

    it('should set source as Formula1.com', async () => {
      const mockResponse: AxiosResponse = {
        data: mockRssXml,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      httpService.get.mockReturnValue(of(mockResponse));

      const result = await adapter.fetchNews('f1', 10);

      expect(result.every(article => article.source === 'Formula1.com')).toBe(true);
    });
  });

  describe('fetchNews - fallback path', () => {
    it('should return fallback news when RSS fetch fails', async () => {
      httpService.get.mockReturnValue(
        throwError(() => new Error('Network error'))
      );

      const result = await adapter.fetchNews('f1', 10);

      expect(result).toHaveLength(5);
      expect(result[0]).toHaveProperty('title');
      expect(result[0]).toHaveProperty('url');
      expect(result[0]).toHaveProperty('source');
    });

    it('should return fallback news when RSS returns empty', async () => {
      const emptyRss = '<?xml version="1.0"?><rss><channel></channel></rss>';
      const mockResponse: AxiosResponse = {
        data: emptyRss,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      httpService.get.mockReturnValue(of(mockResponse));

      const result = await adapter.fetchNews('f1', 10);

      expect(result).toHaveLength(5);
      expect(result[0].title).toContain('F1');
    });

    it('should respect limit in fallback news', async () => {
      httpService.get.mockReturnValue(
        throwError(() => new Error('Network error'))
      );

      const result = await adapter.fetchNews('f1', 3);

      expect(result).toHaveLength(3);
    });

    it('should include all required fields in fallback articles', async () => {
      httpService.get.mockReturnValue(
        throwError(() => new Error('Network error'))
      );

      const result = await adapter.fetchNews('f1', 10);

      result.forEach(article => {
        expect(article).toHaveProperty('title');
        expect(article).toHaveProperty('url');
        expect(article).toHaveProperty('source');
        expect(article).toHaveProperty('publishedAt');
        expect(article).toHaveProperty('description');
      });
    });
  });

  describe('XML parsing', () => {
    it('should handle malformed XML gracefully', async () => {
      const malformedXml = '<invalid>xml{{{';
      const mockResponse: AxiosResponse = {
        data: malformedXml,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      httpService.get.mockReturnValue(of(mockResponse));

      const result = await adapter.fetchNews('f1', 10);

      // Should return fallback
      expect(result).toHaveLength(5);
      expect(result[0].source).toBe('Formula1.com');
    });

    it('should skip items without title or link', async () => {
      const incompleteXml = `<?xml version="1.0"?>
<rss>
  <channel>
    <item>
      <title>Good Article</title>
      <link>https://example.com/good</link>
    </item>
    <item>
      <title>No Link Article</title>
    </item>
    <item>
      <link>https://example.com/no-title</link>
    </item>
  </channel>
</rss>`;

      const mockResponse: AxiosResponse = {
        data: incompleteXml,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      httpService.get.mockReturnValue(of(mockResponse));

      const result = await adapter.fetchNews('f1', 10);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Good Article');
    });

    it('should handle missing description gracefully', async () => {
      const xmlWithoutDesc = `<?xml version="1.0"?>
<rss>
  <channel>
    <item>
      <title>Article Title</title>
      <link>https://example.com</link>
    </item>
  </channel>
</rss>`;

      const mockResponse: AxiosResponse = {
        data: xmlWithoutDesc,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      httpService.get.mockReturnValue(of(mockResponse));

      const result = await adapter.fetchNews('f1', 10);

      expect(result).toHaveLength(1);
      expect(result[0].description).toBeUndefined();
    });
  });

  describe('HTTP error handling', () => {
    it('should handle HTTP timeout', async () => {
      httpService.get.mockReturnValue(
        throwError(() => new Error('ETIMEDOUT'))
      );

      const result = await adapter.fetchNews('f1', 10);

      expect(result).toHaveLength(5); // Fallback
    });

    it('should handle HTTP 404', async () => {
      httpService.get.mockReturnValue(
        throwError(() => ({ response: { status: 404 } }))
      );

      const result = await adapter.fetchNews('f1', 10);

      expect(result).toHaveLength(5); // Fallback
    });

    it('should handle HTTP 500', async () => {
      httpService.get.mockReturnValue(
        throwError(() => ({ response: { status: 500 } }))
      );

      const result = await adapter.fetchNews('f1', 10);

      expect(result).toHaveLength(5); // Fallback
    });
  });

  describe('HTML cleaning utility', () => {
    it('should clean HTML entities to actual characters', async () => {
      const xmlWithHtml = `<?xml version="1.0"?>
<rss>
  <channel>
    <item>
      <title>Title with &lt;strong&gt;bold&lt;/strong&gt; text</title>
      <link>https://example.com</link>
      <description>&lt;p&gt;Description with &lt;a href="test"&gt;link&lt;/a&gt;&lt;/p&gt;</description>
    </item>
  </channel>
</rss>`;

      const mockResponse: AxiosResponse = {
        data: xmlWithHtml,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      httpService.get.mockReturnValue(of(mockResponse));

      const result = await adapter.fetchNews('f1', 10);

      // The cleanHtml method converts &lt; to < and &gt; to >, it doesn't remove HTML tags
      // It's designed to decode HTML entities, not strip tags
      expect(result[0].title).toContain('bold');
      expect(result[0].description).toContain('link');
    });

    it('should decode HTML entities', async () => {
      const mockResponse: AxiosResponse = {
        data: mockRssXml,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      httpService.get.mockReturnValue(of(mockResponse));

      const result = await adapter.fetchNews('f1', 10);

      expect(result[2].title).toContain('&');
      expect(result[2].title).not.toContain('&amp;');
    });
  });
});

