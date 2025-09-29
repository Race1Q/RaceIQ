// Central API base resolution with runtime + build-time support.
// Order of precedence:
// 1. window.__API_BASE__ (runtime injected, allows same build for multiple envs)
// 2. import.meta.env.VITE_API_BASE_URL (build-time)
// 3. '' (dev proxy) when in dev mode
// 4. '/api' (last-chance fallback ONLY if explicitly asked via flag)
export function getApiBaseUrl(options: { allowRelativeInProd?: boolean } = {}): string {
  // Runtime (browser) global injection
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const runtime = (typeof window !== 'undefined' && (window as any).__API_BASE__) || '';
  const buildVar = import.meta.env.VITE_API_BASE_URL || '';
  const dev = import.meta.env.DEV;

  const base = (runtime || buildVar || (dev ? '' : '')) as string;

  // If we're in production and base is empty, optionally allow relative (for legacy behavior)
  if (!base && !dev && !options.allowRelativeInProd) {
    // We purposely do NOT return '/api' automatically because this causes the SPA
    // host to answer with index.html (HTML) leading to JSON parse errors.
    return '';
  }
  return base;
}

// Helper function to build full API URLs. Accepts endpoints with or without leading '/api'.
export function buildApiUrl(endpoint: string): string {
  const baseUrl = getApiBaseUrl({ allowRelativeInProd: true });

  // If endpoint is already absolute, keep it.
  if (/^https?:\/\//i.test(endpoint)) return endpoint;

  const normalizedBase = baseUrl.replace(/\/$/, '');
  let normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // Avoid duplicate /api segments (e.g., base ends with /api and endpoint starts with /api)
  if (/\/api$/i.test(normalizedBase) && /^\/api(\/|$)/i.test(normalizedEndpoint)) {
    normalizedEndpoint = normalizedEndpoint.replace(/^\/api/i, '');
    if (!normalizedEndpoint.startsWith('/')) normalizedEndpoint = `/${normalizedEndpoint}`;
  }

  if (!normalizedBase) return normalizedEndpoint; // dev proxy or relative
  return `${normalizedBase}${normalizedEndpoint}`;
}

// Unified fetch wrapper that provides better diagnostics when the API base is misconfigured.
export async function apiFetch<T = any>(endpoint: string, init: RequestInit = {}): Promise<T> {
  const url = buildApiUrl(endpoint);
  const res = await fetch(url, {
    credentials: 'include',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });

  const contentType = res.headers.get('content-type') || '';

  if (!res.ok) {
    let bodySnippet = '';
    try { bodySnippet = (await res.text()).slice(0, 180); } catch {}
    throw new Error(`Request failed ${res.status} ${res.statusText} for ${url}${bodySnippet ? ` :: ${bodySnippet}` : ''}`);
  }

  // If we expected JSON but got HTML, give a more helpful error.
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    if (/^\s*<!doctype html/i.test(text) || /^\s*<html/i.test(text)) {
      throw new Error(
        `Received HTML instead of JSON from ${url}. This usually means the frontend ` +
        `is calling itself (served index.html) because API base URL is not configured. ` +
        `Set VITE_API_BASE_URL at build time or inject window.__API_BASE__ at runtime.`
      );
    }
    // Attempt JSON parse just in case server omitted proper header
    try { return JSON.parse(text) as T; } catch { return text as unknown as T; }
  }

  return res.json() as Promise<T>;
}

// Convenience: safe POST with JSON body
export function apiPost<T = any>(endpoint: string, body: any, init: RequestInit = {}) {
  return apiFetch<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
    ...init,
  });
}
