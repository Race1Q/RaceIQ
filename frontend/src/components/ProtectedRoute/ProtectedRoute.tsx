import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import F1LoadingSpinner from '../F1LoadingSpinner/F1LoadingSpinner';

type Props = { children: React.ReactNode; requirePermissions?: string[] };

export default function ProtectedRoute({ children, requirePermissions }: Props) {
  const { isAuthenticated, isLoading, loginWithRedirect, getAccessTokenSilently } = useAuth0();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!isAuthenticated) { await loginWithRedirect(); return; }
      if (!requirePermissions?.length) { setAllowed(true); return; }
      const token = await getAccessTokenSilently();
      const payload = JSON.parse(atob(token.split('.')[1] || ''));
      const setPerms = new Set([
        ...(payload.permissions || []),
        ...((payload.scope || '').split(' ').filter(Boolean)),
      ]);
      setAllowed(requirePermissions.every(p => setPerms.has(p)));
    };
    if (!isLoading) run();
  }, [isAuthenticated, isLoading, loginWithRedirect, getAccessTokenSilently, requirePermissions]);

  if (isLoading || allowed === null) {
    return <F1LoadingSpinner text="Authenticating" />;
  }
  if (allowed === false) return <Navigate to="/" replace />;
  return <>{children}</>;
}
