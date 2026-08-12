// frontend/src/components/UserRegistrationHandler/UserRegistrationHandler.tsx

import React, { useEffect, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useUserRegistration } from '../../hooks/useUserRegistration';

interface UserRegistrationHandlerProps {
  children: React.ReactNode;
}

/**
 * Fires the one-time "make sure this Auth0 user has a row in `users`" call.
 *
 * This does NOT gate rendering. It used to return null until the POST resolved,
 * which meant a blank page for the full duration of an API cold start before a
 * single pixel of the app appeared. GET /api/profile now creates the row itself
 * if it is missing, so nothing downstream depends on this call having finished —
 * it is a warm-up, not a prerequisite.
 */
const UserRegistrationHandler: React.FC<UserRegistrationHandlerProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth0();
  const { ensureUserExists } = useUserRegistration();
  const registrationAttempted = useRef(false); // Flag to prevent infinite loops

  useEffect(() => {
    const handleUserRegistration = async () => {
      // Only run if the user is authenticated and we haven't tried yet
      if (isAuthenticated && !registrationAttempted.current) {
        registrationAttempted.current = true; // Mark that we are trying
        try {
          await ensureUserExists();
        } catch (error) {
          // Non-fatal: GET /api/profile self-heals a missing row.
          console.error('Failed to ensure user exists:', error);
        }
      }
    };

    if (!isLoading) {
      handleUserRegistration();
    }
  }, [isAuthenticated, isLoading, ensureUserExists]);

  return <>{children}</>;
};

export default UserRegistrationHandler;
