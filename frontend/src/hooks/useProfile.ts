import { useAuth0 } from '@auth0/auth0-react';
import { useCallback, useState, useEffect } from 'react';
import { buildApiUrl } from '../lib/api';

type ThemePref = 'light' | 'dark';

interface ProfileResponse {
  id: number;
  auth0_sub: string;
  username: string | null;
  email: string | null;
  favorite_driver_id: number | null;
  favorite_constructor_id: number | null;
  theme_preference?: ThemePref | null;
}

export const useProfile = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(buildApiUrl('/api/profile'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = (await response.json()) as ProfileResponse;
      setProfile(data);
    } finally {
      setLoading(false);
    }
  }, [getAccessTokenSilently]);

  const updateProfile = useCallback(async (payload: Partial<ProfileResponse>) => {
    const token = await getAccessTokenSilently();
    const res = await fetch(buildApiUrl('/api/profile'), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to save profile');
    fetchProfile();
  }, [getAccessTokenSilently, fetchProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, updateProfile };
};


