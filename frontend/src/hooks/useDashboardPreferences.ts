// frontend/src/hooks/useDashboardPreferences.ts

import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';
import { buildApiUrl } from '../lib/api';
import type { Layouts } from 'react-grid-layout';

export interface WidgetVisibility {
  nextRace: boolean;
  standings: boolean;
  constructorStandings: boolean;
  lastPodium: boolean;
  fastestLap: boolean;
  favoriteDriver: boolean;
  favoriteTeam: boolean;
  headToHead: boolean;
  f1News: boolean;
}

export interface DashboardPreferences {
  dashboard_visibility?: WidgetVisibility;
  dashboard_layouts?: Layouts;
}

export interface UseDashboardPreferencesReturn {
  widgetVisibility: WidgetVisibility;
  setWidgetVisibility: (visibility: WidgetVisibility) => void;
  layouts: Layouts;
  setLayouts: (layouts: Layouts) => void;
  isLoading: boolean;
  isSaving: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  error: string | null;
  hasLoadedFromServer: boolean;
  savePreferences: () => Promise<void>;
}

const DEFAULT_VISIBILITY: WidgetVisibility = {
  nextRace: true,
  standings: true,
  constructorStandings: true,
  lastPodium: true,
  fastestLap: true,
  favoriteDriver: true,
  favoriteTeam: true,
  headToHead: true,
  f1News: true,
};

const DEFAULT_LAYOUTS: Layouts = {
  lg: [
    { i: 'nextRace', x: 0, y: 0, w: 2, h: 2, isResizable: false },
    { i: 'standings', x: 2, y: 0, w: 1, h: 2, isResizable: false },
    { i: 'constructorStandings', x: 3, y: 0, w: 1, h: 2, isResizable: false },
    { i: 'lastPodium', x: 0, y: 2, w: 1, h: 2, isResizable: false },
    { i: 'fastestLap', x: 1, y: 2, w: 1, h: 2, isResizable: false },
    { i: 'favoriteDriver', x: 2, y: 2, w: 1, h: 2, isResizable: false },
    { i: 'favoriteTeam', x: 3, y: 2, w: 1, h: 2, isResizable: false },
    { i: 'headToHead', x: 0, y: 4, w: 2, h: 2, isResizable: false },
    { i: 'f1News', x: 2, y: 4, w: 2, h: 2, isResizable: false },
  ]
};

export const useDashboardPreferences = (): UseDashboardPreferencesReturn => {
  const { getAccessTokenSilently } = useAuth0();
  const [widgetVisibility, setWidgetVisibility] = useState<WidgetVisibility>(DEFAULT_VISIBILITY);
  const [layouts, setLayouts] = useState<Layouts>(DEFAULT_LAYOUTS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedFromServer, setHasLoadedFromServer] = useState(false);
  // const [isInitialLoad, setIsInitialLoad] = useState(true); // Disabled for manual save

  const saveTimeoutRef = useRef<number | null>(null);
  const toast = useToast();

  // Load user preferences on mount
  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get the access token using Auth0
        const token = await getAccessTokenSilently();
        
        const response = await fetch(buildApiUrl('/api/profile'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to load profile: ${response.status} ${response.statusText}`);
        }

        const profile = await response.json();
        
        if (profile.dashboard_visibility) {
          setWidgetVisibility(profile.dashboard_visibility);
        }
        if (profile.dashboard_layouts) {
          setLayouts(profile.dashboard_layouts);
        }
        
        setHasLoadedFromServer(true);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard preferences';
        console.error('Failed to load dashboard preferences:', errorMessage);
        setError(errorMessage);
        
        // Show a subtle toast for loading errors
        toast({
          title: 'Could not load saved preferences',
          description: 'Using default dashboard layout.',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
        // setIsInitialLoad(false); // Disabled for manual save
      }
    };

    loadUserPreferences();
  }, [toast, getAccessTokenSilently]);

  // Save preferences with debouncing
  const savePreferences = useCallback(async (visibility: WidgetVisibility, layouts: Layouts) => {
    try {
      setIsSaving(true);
      setSaveStatus('saving');
      
      // Get the access token using Auth0
      const token = await getAccessTokenSilently();
      
      const response = await fetch(buildApiUrl('/api/profile'), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dashboard_visibility: visibility,
          dashboard_layouts: layouts,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save preferences: ${response.status} ${response.statusText}`);
      }

      setSaveStatus('saved');
      
      // Clear the saved status after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save preferences';
      console.error('Failed to save dashboard preferences:', errorMessage);
      setError(errorMessage);
      setSaveStatus('error');
      
      // Show error toast
      toast({
        title: 'Failed to save preferences',
        description: 'Your changes may not be saved.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      // Clear error status after 5 seconds
      setTimeout(() => setSaveStatus('idle'), 5000);
    } finally {
      setIsSaving(false);
    }
  }, [toast, getAccessTokenSilently]);

  // Debounced save effect - DISABLED for now, using manual save button instead
  // useEffect(() => {
  //   // Don't save during initial load or if we haven't loaded from server yet
  //   if (isInitialLoad || !hasLoadedFromServer) return;

  //   // Clear any existing timeout
  //   if (saveTimeoutRef.current) {
  //     clearTimeout(saveTimeoutRef.current);
  //   }

  //   // Set a new timeout for debounced saving
  //   saveTimeoutRef.current = window.setTimeout(() => {
  //     savePreferences(widgetVisibility, layouts);
  //   }, 2000); // 2-second delay

  //   // Cleanup function
  //   return () => {
  //     if (saveTimeoutRef.current) {
  //       clearTimeout(saveTimeoutRef.current);
  //     }
  //   };
  // }, [widgetVisibility, layouts, isInitialLoad, hasLoadedFromServer, savePreferences]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Manual save function for save button
  const manualSave = useCallback(async () => {
    await savePreferences(widgetVisibility, layouts);
  }, [widgetVisibility, layouts, savePreferences]);

  return {
    widgetVisibility,
    setWidgetVisibility,
    layouts,
    setLayouts,
    isLoading,
    isSaving,
    saveStatus,
    error,
    hasLoadedFromServer,
    savePreferences: manualSave,
  };
};
