import React, { createContext, useContext, useState, useCallback } from 'react';

interface ProfileUpdateContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const ProfileUpdateContext = createContext<ProfileUpdateContextType | undefined>(undefined);

export function ProfileUpdateProvider({ children }: { children: React.ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback(() => {
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
