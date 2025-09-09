import { useAuth0 } from '@auth0/auth0-react';
import { useCallback } from 'react';
import { buildApiUrl } from '../lib/api';

export interface AuthedFetchOptions extends RequestInit {}

export function useApi() {
  const { getAccessTokenSilently } = useAuth0();

  const authedFetch = useCallback(
    async <T = any>(path: string, options?: AuthedFetchOptions): Promise<T> => {
      const url = buildApiUrl(path);

      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        },
      });

      const headers = new Headers(options?.headers);
      headers.set('Authorization', `Bearer ${token}`);

      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`API Error: ${response.status} ${response.statusText} ${errorText}`);
      }
      return response.json() as Promise<T>;
    },
    [getAccessTokenSilently]
  );

  return { authedFetch };
}


