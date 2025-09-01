import { useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { buildApiUrl } from '../lib/api';

export const useUserRegistration = () => {
  const { getAccessTokenSilently } = useAuth0();

  const ensureUserExists = useCallback(async () => {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { 
          audience: import.meta.env.VITE_AUTH0_AUDIENCE, 
          scope: "read:drivers" 
        },
      });

      const response = await fetch(buildApiUrl('/api/users/ensure-exists'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to ensure user exists');
      }

      const result = await response.json();
      console.log('User registration result:', result);
      return result;
    } catch (error) {
      console.error('Error ensuring user exists:', error);
      throw error;
    }
  }, [getAccessTokenSilently]);

  return { ensureUserExists };
};
