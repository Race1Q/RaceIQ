import React, { createContext, useContext, useState, useCallback } from 'react';
import { invalidateUserProfile } from '../lib/profileCache';

interface ProfileUpdateContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const ProfileUpdateContext = createContext<ProfileUpdateContextType | undefined>(undefined);

export function ProfileUpdateProvider({ children }: { children: React.ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback(() => {
    // Drop the shared cache first, so the re-render this bump causes refetches
    // instead of reading back the stale entry.
    invalidateUserProfile();
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <ProfileUpdateContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </ProfileUpdateContext.Provider>
  );
}

export function useProfileUpdate() {
  const context = useContext(ProfileUpdateContext);
  if (context === undefined) {
    throw new Error('useProfileUpdate must be used within a ProfileUpdateProvider');
  }
  return context;
}
