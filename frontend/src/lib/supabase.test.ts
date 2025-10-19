import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock createClient before importing supabase
const mockCreateClient = vi.fn();
vi.mock('@supabase/supabase-js', () => ({
  createClient: (...args: any[]) => mockCreateClient(...args),
}));

describe('supabase configuration', () => {
  let originalEnv: any;
  let originalWindow: any;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...import.meta.env };
    originalWindow = { ...window };
    
    // Clear modules to force re-import
    vi.resetModules();
    mockCreateClient.mockClear();
    
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore original environment
    Object.assign(import.meta.env, originalEnv);
    vi.restoreAllMocks();
  });

  it('should use build-time environment variables when available', async () => {
    // Set build-time environment variables
    import.meta.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
    import.meta.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key-123';

    // Re-import to trigger initialization
    await import('./supabase');

    expect(mockCreateClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-anon-key-123'
    );
  });

  it('should use runtime window variables when build-time vars are missing', async () => {
    // Clear build-time variables
    delete import.meta.env.VITE_SUPABASE_URL;
    delete import.meta.env.VITE_SUPABASE_ANON_KEY;

    // Set runtime variables
    (window as any).VITE_SUPABASE_URL = 'https://runtime.supabase.co';
    (window as any).VITE_SUPABASE_ANON_KEY = 'runtime-key-456';

    // Re-import to trigger initialization
    await import('./supabase');

    expect(mockCreateClient).toHaveBeenCalledWith(
      'https://runtime.supabase.co',
      'runtime-key-456'
    );
  });

  it('should throw error when VITE_SUPABASE_URL is missing', async () => {
    // Clear all variables
    delete import.meta.env.VITE_SUPABASE_URL;
    delete import.meta.env.VITE_SUPABASE_ANON_KEY;
    delete (window as any).VITE_SUPABASE_URL;
    delete (window as any).VITE_SUPABASE_ANON_KEY;

    // Re-import should throw
    await expect(async () => {
      await import('./supabase?timestamp=' + Date.now());
    }).rejects.toThrow();
  });

  it('should throw error when VITE_SUPABASE_ANON_KEY is missing', async () => {
    // Clear all variables
    delete import.meta.env.VITE_SUPABASE_URL;
    delete import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    // Set only URL
    (window as any).VITE_SUPABASE_URL = 'https://test.supabase.co';
    delete (window as any).VITE_SUPABASE_ANON_KEY;

    // Re-import should throw
    await expect(async () => {
      await import('./supabase?timestamp=' + Date.now());
    }).rejects.toThrow();
  });

  it('should validate URL format', async () => {
    // Clear all variables
    delete import.meta.env.VITE_SUPABASE_URL;
    delete import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    // Set invalid URL
    (window as any).VITE_SUPABASE_URL = 'not-a-valid-url';
    (window as any).VITE_SUPABASE_ANON_KEY = 'test-key';

    // Re-import should throw
    await expect(async () => {
      await import('./supabase?timestamp=' + Date.now());
    }).rejects.toThrow();
  });

  it('should log when using build-time environment variables', async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    
    import.meta.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
    import.meta.env.VITE_SUPABASE_ANON_KEY = 'test-key';

    await import('./supabase?timestamp=' + Date.now());

    expect(consoleSpy).toHaveBeenCalledWith(
      'Using build-time environment variables'
    );
  });

  it('should log runtime environment info when using window variables', async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    
    delete import.meta.env.VITE_SUPABASE_URL;
    delete import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    (window as any).VITE_SUPABASE_URL = 'https://runtime.supabase.co';
    (window as any).VITE_SUPABASE_ANON_KEY = 'runtime-key';

    await import('./supabase?timestamp=' + Date.now());

    expect(consoleSpy).toHaveBeenCalledWith(
      'Runtime environment variables:',
      expect.objectContaining({
        url: 'https://runtime.supabase.co',
        key: '***',
      })
    );
  });

  it('should handle valid https URL', async () => {
    delete import.meta.env.VITE_SUPABASE_URL;
    delete import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    (window as any).VITE_SUPABASE_URL = 'https://valid.supabase.co';
    (window as any).VITE_SUPABASE_ANON_KEY = 'test-key';

    // Should not throw
    await expect(import('./supabase?timestamp=' + Date.now())).resolves.toBeDefined();
  });

  it('should handle valid http URL (for development)', async () => {
    delete import.meta.env.VITE_SUPABASE_URL;
    delete import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    (window as any).VITE_SUPABASE_URL = 'http://localhost:54321';
    (window as any).VITE_SUPABASE_ANON_KEY = 'test-key';

    // Should not throw
    await expect(import('./supabase?timestamp=' + Date.now())).resolves.toBeDefined();
  });

  it('should prefer build-time variables over runtime variables', async () => {
    // Set both build-time and runtime variables
    import.meta.env.VITE_SUPABASE_URL = 'https://buildtime.supabase.co';
    import.meta.env.VITE_SUPABASE_ANON_KEY = 'buildtime-key';
    
    (window as any).VITE_SUPABASE_URL = 'https://runtime.supabase.co';
    (window as any).VITE_SUPABASE_ANON_KEY = 'runtime-key';

    await import('./supabase?timestamp=' + Date.now());

    // Should use build-time variables
    expect(mockCreateClient).toHaveBeenCalledWith(
      'https://buildtime.supabase.co',
      'buildtime-key'
    );
  });

  it('should mask the anon key in runtime logs', async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    
    delete import.meta.env.VITE_SUPABASE_URL;
    delete import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    (window as any).VITE_SUPABASE_URL = 'https://test.supabase.co';
    (window as any).VITE_SUPABASE_ANON_KEY = 'super-secret-key-12345';

    await import('./supabase?timestamp=' + Date.now());

    // Key should be masked as '***'
    expect(consoleSpy).toHaveBeenCalledWith(
      'Runtime environment variables:',
      expect.objectContaining({
        key: '***',
      })
    );
  });

  it('should log MISSING for missing runtime URL', async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    
    delete import.meta.env.VITE_SUPABASE_URL;
    delete import.meta.env.VITE_SUPABASE_ANON_KEY;
    delete (window as any).VITE_SUPABASE_URL;
    delete (window as any).VITE_SUPABASE_ANON_KEY;

    try {
      await import('./supabase?timestamp=' + Date.now());
    } catch {
      // Expected to throw
    }

    expect(consoleSpy).toHaveBeenCalledWith(
      'Runtime environment variables:',
      expect.objectContaining({
        url: 'MISSING',
      })
    );
  });

  it('should log MISSING for missing runtime key', async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    
    delete import.meta.env.VITE_SUPABASE_URL;
    delete import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    (window as any).VITE_SUPABASE_URL = 'https://test.supabase.co';
    delete (window as any).VITE_SUPABASE_ANON_KEY;

    try {
      await import('./supabase?timestamp=' + Date.now());
    } catch {
      // Expected to throw
    }

    expect(consoleSpy).toHaveBeenCalledWith(
      'Runtime environment variables:',
      expect.objectContaining({
        key: 'MISSING',
      })
    );
  });
});

