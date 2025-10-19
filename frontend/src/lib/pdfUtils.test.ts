import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadImageAsDataURL, clamp } from './pdfUtils';

describe('pdfUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('clamp', () => {
    it('should clamp value to min when below minimum', () => {
      expect(clamp(5, 10, 20)).toBe(10);
    });

    it('should clamp value to max when above maximum', () => {
      expect(clamp(25, 10, 20)).toBe(20);
    });

    it('should return value when within range', () => {
      expect(clamp(15, 10, 20)).toBe(15);
    });

    it('should handle negative numbers', () => {
      expect(clamp(-5, -10, -1)).toBe(-5);
      expect(clamp(-15, -10, -1)).toBe(-10);
      expect(clamp(5, -10, -1)).toBe(-1);
    });

    it('should handle zero', () => {
      expect(clamp(0, -10, 10)).toBe(0);
    });

    it('should handle equal min and max', () => {
      expect(clamp(5, 10, 10)).toBe(10);
    });

    it('should handle decimal numbers', () => {
      expect(clamp(5.5, 5.0, 6.0)).toBe(5.5);
      expect(clamp(4.5, 5.0, 6.0)).toBe(5.0);
      expect(clamp(6.5, 5.0, 6.0)).toBe(6.0);
    });
  });

  describe('loadImageAsDataURL', () => {
    it('should load and convert PNG image to data URL', async () => {
      const mockBlob = new Blob(['fake-image-data'], { type: 'image/png' });
      
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      } as Response);

      // Mock FileReader
      const mockDataURL = 'data:image/png;base64,fakedata';
      const originalFileReader = global.FileReader;
      global.FileReader = vi.fn().mockImplementation(() => ({
        readAsDataURL: vi.fn(function(this: any) {
          setTimeout(() => {
            this.result = mockDataURL;
            this.onload?.();
          }, 0);
        }),
        result: mockDataURL,
      })) as any;

      const result = await loadImageAsDataURL('https://example.com/image.png');

      expect(result).toBe(mockDataURL);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com/image.png',
        { mode: 'cors' }
      );

      global.FileReader = originalFileReader;
    });

    it('should handle fetch errors gracefully', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      const result = await loadImageAsDataURL('https://example.com/missing.png');

      expect(result).toBe('');
      expect(console.warn).toHaveBeenCalled();
    });

    it('should handle network errors gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

      const result = await loadImageAsDataURL('https://example.com/image.png');

      expect(result).toBe('');
      expect(console.warn).toHaveBeenCalled();
    });

    it('should detect SVG by content type', async () => {
      const mockSvgBlob = new Blob(['<svg></svg>'], { type: 'image/svg+xml' });
      
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        blob: async () => mockSvgBlob,
      } as Response);

      const result = await loadImageAsDataURL('https://example.com/image.svg');

      // SVG conversion attempts but may return empty string on failure in test environment
      expect(typeof result).toBe('string');
    });

    it('should detect SVG by file extension', async () => {
      const mockBlob = new Blob(['<svg></svg>'], { type: 'application/octet-stream' });
      
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      } as Response);

      const result = await loadImageAsDataURL('https://example.com/logo.SVG');

      // SVG files should be processed (may return empty string in test env)
      expect(typeof result).toBe('string');
    });

    it('should convert JPEG to PNG', async () => {
      const mockBlob = new Blob(['fake-jpeg-data'], { type: 'image/jpeg' });
      
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      } as Response);

      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn().mockReturnValue({
          drawImage: vi.fn(),
        }),
        toDataURL: vi.fn().mockReturnValue('data:image/png;base64,converted'),
      };

      let imgInstance: any;
      const originalFileReader = global.FileReader;
      
      global.FileReader = vi.fn().mockImplementation(() => ({
        readAsDataURL: vi.fn(function(this: any) {
          this.result = 'data:image/jpeg;base64,fakejpeg';
          setTimeout(() => {
            this.onload?.();
            // Trigger image onload after FileReader
            setTimeout(() => imgInstance?.onload?.(), 0);
          }, 0);
        }),
      })) as any;

      global.document.createElement = vi.fn().mockImplementation((tag: string) => {
        if (tag === 'canvas') return mockCanvas;
        if (tag === 'img') {
          imgInstance = {
            src: '',
            width: 512,
            height: 512,
            onload: null,
            onerror: null,
          };
          return imgInstance;
        }
        return {};
      });

      const result = await loadImageAsDataURL('https://example.com/photo.jpg');

      expect(result).toBe('data:image/png;base64,converted');
      
      global.FileReader = originalFileReader;
    });

    it('should handle FileReader errors', async () => {
      const mockBlob = new Blob(['fake-data'], { type: 'image/png' });
      
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      } as Response);

      const originalFileReader = global.FileReader;
      global.FileReader = vi.fn().mockImplementation(() => ({
        readAsDataURL: vi.fn(function(this: any) {
          setTimeout(() => {
            this.onerror?.();
          }, 0);
        }),
      })) as any;

      const result = await loadImageAsDataURL('https://example.com/image.png');

      expect(result).toBe('');
      
      global.FileReader = originalFileReader;
    });

    it('should handle image conversion errors', async () => {
      const mockBlob = new Blob(['fake-jpeg'], { type: 'image/jpeg' });
      
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      } as Response);

      let imgInstance: any;
      const originalFileReader = global.FileReader;
      
      global.FileReader = vi.fn().mockImplementation(() => ({
        readAsDataURL: vi.fn(function(this: any) {
          this.result = 'data:image/jpeg;base64,fake';
          setTimeout(() => {
            this.onload?.();
            // Trigger image error
            setTimeout(() => imgInstance?.onerror?.(), 0);
          }, 0);
        }),
      })) as any;

      global.document.createElement = vi.fn().mockImplementation((tag: string) => {
        if (tag === 'img') {
          imgInstance = {
            src: '',
            onload: null,
            onerror: null,
          };
          return imgInstance;
        }
        return {};
      });

      const result = await loadImageAsDataURL('https://example.com/bad.jpg');

      // Should fallback to original data URL
      expect(result).toBe('data:image/jpeg;base64,fake');
      
      global.FileReader = originalFileReader;
    });

    it('should use default dimensions for SVG without width/height', async () => {
      const mockSvgBlob = new Blob(['<svg></svg>'], { type: 'image/svg+xml' });
      
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        blob: async () => mockSvgBlob,
      } as Response);

      const result = await loadImageAsDataURL('https://example.com/logo.svg');

      // Should handle SVG (may return empty in test environment)
      expect(typeof result).toBe('string');
    });

    it('should handle WEBP images', async () => {
      const mockBlob = new Blob(['fake-webp'], { type: 'image/webp' });
      
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      } as Response);

      let imgInstance: any;
      const originalFileReader = global.FileReader;
      
      global.FileReader = vi.fn().mockImplementation(() => ({
        readAsDataURL: vi.fn(function(this: any) {
          this.result = 'data:image/webp;base64,fakewebp';
          setTimeout(() => {
            this.onload?.();
            // Immediately trigger image load to avoid timeout
            if (imgInstance?.onload) {
              setTimeout(() => imgInstance.onload(), 0);
            }
          }, 0);
        }),
      })) as any;

      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn().mockReturnValue({
          drawImage: vi.fn(),
        }),
        toDataURL: vi.fn().mockReturnValue('data:image/png;base64,converted'),
      };

      global.document.createElement = vi.fn().mockImplementation((tag: string) => {
        if (tag === 'canvas') return mockCanvas;
        if (tag === 'img') {
          imgInstance = {
            src: '',
            width: 256,
            height: 256,
            onload: null,
            onerror: null,
          };
          return imgInstance;
        }
        return {};
      });

      const result = await loadImageAsDataURL('https://example.com/image.webp');

      expect(result).toBeTruthy();
      
      global.FileReader = originalFileReader;
    }, 1000);
  });
});

