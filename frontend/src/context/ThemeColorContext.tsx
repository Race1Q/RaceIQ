// frontend/src/context/ThemeColorContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useUserProfile } from '../hooks/useUserProfile';
import { getTeamColor } from '../lib/teamColors';
import { lightenColor, darkenColor } from '../lib/colorUtils';

// Extended interface to include the new field
interface ExtendedUserProfile {
  id: number;
  auth0_sub: string;
  username: string | null;
  email: string | null;
  favorite_constructor_id: number | null;
  favorite_driver_id: number | null;
  theme_preference?: 'dark' | 'light' | null;
  use_custom_team_color?: boolean;
  role: string;
  created_at: string;
  favoriteConstructor?: any;
  favoriteDriver?: any;
}

interface ThemeColorContextValue {
  accentColor: string; // hex without #
  accentColorWithHash: string; // hex with #
  accentColorLight: string; // lighter variant
  accentColorDark: string; // darker variant
  accentColorRgba: (alpha: number) => string; // rgba with custom alpha
  isLoading: boolean;
  useCustomTeamColor: boolean;
  toggleCustomTeamColor: () => void;
}

const ThemeColorContext = createContext<ThemeColorContextValue | undefined>(undefined);

// Helper function to convert hex to rgba
const hexToRgba = (hex: string, alpha: number): string => {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.slice(0, 2), 16);
  const g = parseInt(cleanHex.slice(2, 4), 16);
  const b = parseInt(cleanHex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};


export const ThemeColorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Hooks must be called unconditionally
  const { isAuthenticated } = useAuth0();
  const profileData = useUserProfile();
  
  // State for custom team color preference (stored in localStorage for now)
  const [useCustomTeamColor, setUseCustomTeamColor] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('useCustomTeamColor');
      return saved ? JSON.parse(saved) : true; // Default to true (use team colors)
    }
    return true;
  });
  
  // Safely access favoriteConstructor and profile
  const favoriteConstructor = profileData?.favoriteConstructor || null;
  const profile = profileData?.profile as ExtendedUserProfile | null || null;
  const loading = profileData?.loading || false;

  // Sync with profile preference if available
  useEffect(() => {
    if (profile?.use_custom_team_color !== undefined) {
      setUseCustomTeamColor(profile.use_custom_team_color);
    }
  }, [profile?.use_custom_team_color]);

  // Save to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('useCustomTeamColor', JSON.stringify(useCustomTeamColor));
    }
  }, [useCustomTeamColor]);

  // Toggle function
  const toggleCustomTeamColor = () => {
    setUseCustomTeamColor(prev => !prev);
  };

  // Get the accent color based on preference
  const favoriteTeamName = isAuthenticated && useCustomTeamColor ? favoriteConstructor?.name : null;
  const accentColor = favoriteTeamName ? getTeamColor(favoriteTeamName) : 'e10600';
  
  const value: ThemeColorContextValue = {
    accentColor,
    accentColorWithHash: `#${accentColor}`,
    accentColorLight: lightenColor(`#${accentColor}`, 0.2),
    accentColorDark: darkenColor(`#${accentColor}`, 0.15),
    accentColorRgba: (alpha: number) => hexToRgba(accentColor, alpha),
    isLoading: loading,
    useCustomTeamColor,
    toggleCustomTeamColor,
  };

  return (
    <ThemeColorContext.Provider value={value}>
      {children}
    </ThemeColorContext.Provider>
  );
};

// Export hook separately to avoid Fast Refresh issues
export function useThemeColor(): ThemeColorContextValue {
  const context = useContext(ThemeColorContext);
  if (context === undefined) {
    throw new Error('useThemeColor must be used within a ThemeColorProvider');
  }
  return context;
}

