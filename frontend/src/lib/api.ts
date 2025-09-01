// Get the API base URL for the current environment
export function getApiBaseUrl(): string {
  // In development, use the proxy (relative URL)
  if (import.meta.env.DEV) {
    return '';
  }
  
  // In production, use the environment variable
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  
  // If VITE_BACKEND_URL is not set, use the hardcoded fallback for Azure
  if (!backendUrl || backendUrl === '') {
    return 'https://raceiq-api.azurewebsites.net';
  }
  
  return backendUrl;
}

// Helper function to build full API URLs
export function buildApiUrl(endpoint: string): string {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${endpoint}`;
}
