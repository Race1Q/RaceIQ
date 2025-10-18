import { useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { buildApiUrl } from '../lib/api';

export const useUserRegistration = () => {
  const { getAccessTokenSilently } = useAuth0();

  const ensureUserExists = useCallback(async () => {
    try {
      // REMOVED: The incorrect authorizationParams that limited the scope.
      // Now, it will use the default scope from your Auth0Provider, which includes the email.
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
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
      throw new Error('Internal server error'); // Throw a generic error for the UI
    }
  }, [getAccessTokenSilently]);

  return { ensureUserExists };
};
