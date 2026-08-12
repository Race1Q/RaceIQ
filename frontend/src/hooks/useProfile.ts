import { useAuth0 } from '@auth0/auth0-react';
import { useCallback, useState, useEffect } from 'react';
import { buildApiUrl } from '../lib/api';
import { loadUserProfile, invalidateUserProfile } from '../lib/profileCache';

type ThemePref = 'light' | 'dark';

interface ProfileResponse {
  id: number;
  auth0_sub: string;
  username: string | null;
  email: string | null;
  favorite_driver_id: number | null;
  favorite_constructor_id: number | null;
  theme_preference?: ThemePref | null;
  use_custom_team_color?: boolean;
}

export const useProfile = () => {
  const { getAccessTokenSilently, user } = useAuth0();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (options: { force?: boolean } = {}) => {
    try {
      const data = await loadUserProfile<ProfileResponse>(
        user?.sub ?? 'anonymous',
        async () => {
          const token = await getAccessTokenSilently({
            authorizationParams: {
              audience: import.meta.env.VITE_AUTH0_AUDIENCE,
            },
          });
          const response = await fetch(buildApiUrl('/api/profile'), {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok) throw new Error('Failed to fetch profile');
          return (await response.json()) as ProfileResponse;
        },
        options,
      );
      setProfile(data);
    } finally {
      setLoading(false);
    }
  }, [getAccessTokenSilently, user?.sub]);

  const updateProfile = useCallback(async (payload: Partial<ProfileResponse>) => {
    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      },
    });
    const res = await fetch(buildApiUrl('/api/profile'), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to save profile');
    // We just changed the row every other consumer is holding.
    invalidateUserProfile();
    fetchProfile({ force: true });
  }, [getAccessTokenSilently, fetchProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, updateProfile };
};


