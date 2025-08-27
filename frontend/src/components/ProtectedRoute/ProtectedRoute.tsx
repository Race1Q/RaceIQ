import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import F1LoadingSpinner from '../F1LoadingSpinner/F1LoadingSpinner';
import { useRole } from '../../context/RoleContext';

type Props = { children: React.ReactNode; requirePermissions?: string[]; requireAdmin?: boolean };

export default function ProtectedRoute({ children, requirePermissions, requireAdmin }: Props) {
  const { isAuthenticated, isLoading, loginWithRedirect, getAccessTokenSilently } = useAuth0();
  const { role, loading: roleLoading } = useRole();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!isAuthenticated) { await loginWithRedirect(); return; }
      // Admin role check takes precedence if required
      if (requireAdmin) {
        if (roleLoading) return; // wait for role
        setAllowed(role === 'admin');
        return;
      }
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
  }, [isAuthenticated, isLoading, loginWithRedirect, getAccessTokenSilently, requirePermissions, requireAdmin, role, roleLoading]);

  if (isLoading || roleLoading || allowed === null) {
    return <F1LoadingSpinner text="Authenticating" />;
  }
  if (allowed === false) return <Navigate to="/" replace />;
  return <>{children}</>;
}
