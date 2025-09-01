// Get the API base URL for the current environment
export function getApiBaseUrl(): string {
  // In development, use the proxy (relative URL)
  if (import.meta.env.DEV) {
    return '';
  }
  
  // In production, use the configured API base URL
  // @ts-ignore - window.env is injected by config.js
  const configUrl = window.env?.VITE_API_BASE_URL;
  
  if (configUrl) {
    return configUrl;
  }
  
  // Fallback to current origin if no config
  return window.location.origin;
}

// Helper function to build full API URLs
export function buildApiUrl(endpoint: string): string {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${endpoint}`;
}
