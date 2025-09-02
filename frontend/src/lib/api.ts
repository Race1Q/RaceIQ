// Get the API base URL for the current environment
export function getApiBaseUrl(): string {
  // In development, use the proxy (relative URL)
  if (import.meta.env.DEV) {
    // Prefer explicit base URL if provided (e.g., http://localhost:3000)
    return import.meta.env.VITE_API_BASE_URL || '';
  }
  
  // In production, use the environment variable
  return import.meta.env.VITE_API_BASE_URL || '';
}

// Helper function to build full API URLs
export function buildApiUrl(endpoint: string): string {
  const baseUrl = getApiBaseUrl();

  // If endpoint is already an absolute URL, return it as-is
  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint;
  }

  // Normalize to avoid duplicate "/api" segments and double slashes
  const normalizedBase = baseUrl.replace(/\/$/, '');
  let normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // If base already includes "/api" and endpoint starts with "/api", drop one copy
  if (/\/api$/i.test(normalizedBase) && /^\/api(\/|$)/i.test(normalizedEndpoint)) {
    normalizedEndpoint = normalizedEndpoint.replace(/^\/api/i, '');
    if (!normalizedEndpoint.startsWith('/')) normalizedEndpoint = `/${normalizedEndpoint}`;
  }

  return `${normalizedBase}${normalizedEndpoint}` || normalizedEndpoint;
}
