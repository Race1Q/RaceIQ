import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { supabase } from '../lib/supabase';

type Role = 'admin' | 'member' | 'guest' | null;

type RoleContextValue = {
  role: Role;
  loading: boolean;
  error?: string | null;
  refresh: () => Promise<void>;
};

const RoleContext = createContext<RoleContextValue>({ role: null, loading: true, error: null, refresh: async () => {} });

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user, getAccessTokenSilently } = useAuth0();
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRole = useMemo(() => async () => {
    try {
      setLoading(true);
      setError(null);

      if (!isAuthenticated || !user?.sub) {
        setRole(null);
        setLoading(false);
        return;
      }

      // Ensure we have a valid session/token in case RLS is enabled in the future
      try { await getAccessTokenSilently(); } catch {}

      // Requirement: user.sub maps to public.users.id (PK). Fallback to auth0_sub if needed.
      const userSub = user.sub;

      let { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userSub)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // Fallback for environments where auth0_sub is used instead of id
        const fallback = await supabase
          .from('users')
          .select('role')
          .eq('auth0_sub', userSub)
          .maybeSingle();
        if (fallback.error) throw fallback.error;
        data = fallback.data;
      }

      setRole((data?.role as Role) ?? null);
      setLoading(false);
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch role');
      setRole(null);
      setLoading(false);
    }
  }, [isAuthenticated, user?.sub, getAccessTokenSilently]);

  useEffect(() => {
    if (!isLoading) {
      fetchRole();
    }
  }, [isLoading, fetchRole]);

  const value = useMemo<RoleContextValue>(() => ({ role, loading, error, refresh: fetchRole }), [role, loading, error, fetchRole]);

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}


