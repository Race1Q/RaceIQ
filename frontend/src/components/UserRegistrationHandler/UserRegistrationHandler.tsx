// frontend/src/components/UserRegistrationHandler/UserRegistrationHandler.tsx

import React, { useEffect, useRef, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useUserRegistration } from '../../hooks/useUserRegistration';

interface UserRegistrationHandlerProps {
  children: React.ReactNode;
}

const UserRegistrationHandler: React.FC<UserRegistrationHandlerProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth0();
  const { ensureUserExists } = useUserRegistration();
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);
  const registrationAttempted = useRef(false); // Flag to prevent infinite loops

  useEffect(() => {
    const handleUserRegistration = async () => {
      // Only run if the user is authenticated and we haven't tried yet
      if (isAuthenticated && !registrationAttempted.current) {
        registrationAttempted.current = true; // Mark that we are trying
        console.log('Ensuring user exists in database...');
        try {
          await ensureUserExists();
          console.log('Existing user found in database');
        } catch (error) {
          console.error('Failed to ensure user exists:', error);
        } finally {
          setIsRegistrationComplete(true); // Allow the app to render
        }
      }
    };

    if (!isLoading) {
      handleUserRegistration();
    }
  }, [isAuthenticated, isLoading, ensureUserExists]);

  // Don't render the rest of the app until the user is authenticated
  // and the registration check is complete.
  if (isAuthenticated && !isRegistrationComplete) {
    return null; // Or a loading spinner
  }

  return <>{children}</>;
};

export default UserRegistrationHandler;
