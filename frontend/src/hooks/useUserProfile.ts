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
  const { user, getAccessTokenSilently, loginWithRedirect, isLoading: authLoading } = useAuth0();
  const { refreshTrigger } = useProfileUpdate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [favoriteDriver, setFavoriteDriver] = useState<Driver | null>(null);
  const [favoriteConstructor, setFavoriteConstructor] = useState<Constructor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authedFetch = useCallback(async (url: string) => {
    console.log('🔐 [useUserProfile] Making authenticated request to:', url);

    let token: string | undefined;
    try {
      // Use provider defaults (audience/scope) to avoid scope mismatch
      token = await getAccessTokenSilently();
    } catch (err: any) {
      const message = String(err?.message || err);
      console.error('❌ [useUserProfile] getAccessTokenSilently error:', message);

      // If we are missing a refresh token, trigger an interactive login with consent to mint one
      if (message.includes('Missing Refresh Token')) {
        console.warn('⚠️ [useUserProfile] Missing refresh token. Forcing re-auth with consent to obtain refresh token...');
        await loginWithRedirect({
          authorizationParams: {
            prompt: 'consent',
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
            // Keep scopes aligned with Auth0Provider (includes offline_access)
            scope: 'openid profile email read:drivers read:standings read:constructors read:race-results read:races offline_access delete:users update:users read:users',
            redirect_uri: window.location.href,
          },
        });
        // After redirect back, the hook will re-run; throw to halt current flow.
        throw new Error('Auth refresh initiated');
      }

      throw err;
    }

    console.log('🔐 [useUserProfile] Got token:', token ? '✅ Present' : '❌ Missing');

    const headers = new Headers();
    headers.set('Authorization', `Bearer ${token}`);

    console.log('🔐 [useUserProfile] Making fetch request...');
    const response = await fetch(url, { headers });

    console.log('🔐 [useUserProfile] Response status:', response.status, response.statusText);
    console.log('🔐 [useUserProfile] Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [useUserProfile] API Error response:', errorText);
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('🔐 [useUserProfile] Response data:', data);
    return data;
  }, [getAccessTokenSilently, loginWithRedirect]);

  useEffect(() => {
    if (authLoading || !user?.sub) {
      setLoading(false);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 [useUserProfile] Starting profile fetch...');
        console.log('🔍 [useUserProfile] User sub:', user?.sub);
        console.log('🔍 [useUserProfile] API URL:', buildApiUrl('/api/profile'));

        // Fetch user profile
        const profileData = await authedFetch(buildApiUrl('/api/profile'));
        console.log('🔍 [useUserProfile] Raw profile data:', profileData);
        
        setProfile(profileData);

        // Set favorite driver and constructor from the relations returned by the API
        console.log('🔍 [useUserProfile] favoriteDriver relation:', profileData.favoriteDriver);
        console.log('🔍 [useUserProfile] favoriteConstructor relation:', profileData.favoriteConstructor);
        console.log('🔍 [useUserProfile] favorite_driver_id:', profileData.favorite_driver_id);
        console.log('🔍 [useUserProfile] favorite_constructor_id:', profileData.favorite_constructor_id);
        
        setFavoriteDriver(profileData.favoriteDriver || null);
        setFavoriteConstructor(profileData.favoriteConstructor || null);
        
        console.log('🔍 [useUserProfile] Set favoriteDriver to:', profileData.favoriteDriver || null);
        console.log('🔍 [useUserProfile] Set favoriteConstructor to:', profileData.favoriteConstructor || null);
      } catch (err) {
        console.error('❌ [useUserProfile] Error fetching profile:', err);
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

      console.log('🔄 [useUserProfile] Refetching profile...');
      
      // Fetch user profile (includes favoriteDriver and favoriteConstructor relations)
      const profileData = await authedFetch(buildApiUrl('/api/profile'));
      console.log('🔄 [useUserProfile] Refetch profile data:', profileData);
      
      setProfile(profileData);

      // Set favorite driver and constructor from the relations returned by the API
      setFavoriteDriver(profileData.favoriteDriver || null);
      setFavoriteConstructor(profileData.favoriteConstructor || null);
      
      console.log('🔄 [useUserProfile] Refetch - Set favorites:', {
        driver: profileData.favoriteDriver || null,
        constructor: profileData.favoriteConstructor || null
      });
    } catch (err) {
      console.error('❌ [useUserProfile] Refetch error:', err);
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
