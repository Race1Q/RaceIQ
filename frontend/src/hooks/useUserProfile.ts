import { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { buildApiUrl } from '../lib/api';
import { useProfileUpdate } from '../context/ProfileUpdateContext';

interface UserProfile {
  id: number;
  auth0_sub: string;
  username: string | null;
  email: string | null;
  favorite_constructor_id: number | null;
  favorite_driver_id: number | null;
  role: string;
  created_at: string;
}

interface Driver {
  id: number;
  full_name: string;
  driver_number: number | null;
  country_code: string | null;
  team_name: string;
}

interface Constructor {
  id: number;
  name: string;
}

export function useUserProfile() {
  const { user, getAccessTokenSilently, isLoading: authLoading } = useAuth0();
  const { refreshTrigger } = useProfileUpdate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [favoriteDriver, setFavoriteDriver] = useState<Driver | null>(null);
  const [favoriteConstructor, setFavoriteConstructor] = useState<Constructor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authedFetch = useCallback(async (url: string) => {
    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        scope: "read:drivers read:constructors read:users",
      },
    });

    const headers = new Headers();
    headers.set('Authorization', `Bearer ${token}`);
    
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }, [getAccessTokenSilently]);

  useEffect(() => {
    if (authLoading || !user?.sub) {
      setLoading(false);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user profile
        const profileData = await authedFetch(buildApiUrl('/api/users/profile'));
        setProfile(profileData);

        // Fetch favorite driver if set
        if (profileData.favorite_driver_id) {
          try {
            const driverData = await authedFetch(buildApiUrl(`/api/drivers/${profileData.favorite_driver_id}`));
            setFavoriteDriver(driverData);
          } catch (driverError) {
            console.warn('Could not fetch favorite driver:', driverError);
          }
        }

        // Fetch favorite constructor if set
        if (profileData.favorite_constructor_id) {
          try {
            const constructorData = await authedFetch(buildApiUrl(`/api/constructors/${profileData.favorite_constructor_id}`));
            setFavoriteConstructor(constructorData);
          } catch (constructorError) {
            console.warn('Could not fetch favorite constructor:', constructorError);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user?.sub, authLoading, authedFetch, refreshTrigger]);

  const refetch = useCallback(async () => {
    if (!user?.sub) return;
    
    try {
      setLoading(true);
      setError(null);

      // Fetch user profile
      const profileData = await authedFetch(buildApiUrl('/api/users/profile'));
      setProfile(profileData);

      // Fetch favorite driver if set
      if (profileData.favorite_driver_id) {
        try {
          const driverData = await authedFetch(buildApiUrl(`/api/drivers/${profileData.favorite_driver_id}`));
          setFavoriteDriver(driverData);
        } catch (driverError) {
          console.warn('Could not fetch favorite driver:', driverError);
          setFavoriteDriver(null);
        }
      } else {
        setFavoriteDriver(null);
      }

      // Fetch favorite constructor if set
      if (profileData.favorite_constructor_id) {
        try {
          const constructorData = await authedFetch(buildApiUrl(`/api/constructors/${profileData.favorite_constructor_id}`));
          setFavoriteConstructor(constructorData);
        } catch (constructorError) {
          console.warn('Could not fetch favorite constructor:', constructorError);
          setFavoriteConstructor(null);
        }
      } else {
        setFavoriteConstructor(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  }, [user?.sub, authedFetch]);

  return {
    profile,
    favoriteDriver,
    favoriteConstructor,
    loading,
    error,
    refetch
  };
}
