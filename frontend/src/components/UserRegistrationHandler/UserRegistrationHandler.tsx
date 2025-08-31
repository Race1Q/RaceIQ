import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useUserRegistration } from '../../hooks/useUserRegistration';
import { useToast } from '@chakra-ui/react';
import F1LoadingSpinner from '../F1LoadingSpinner/F1LoadingSpinner';

interface UserRegistrationHandlerProps {
  children: React.ReactNode;
}

const UserRegistrationHandler: React.FC<UserRegistrationHandlerProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth0();
  const { ensureUserExists } = useUserRegistration();
  const toast = useToast();
  const [isRegistering, setIsRegistering] = useState(false);
  const [hasRegistered, setHasRegistered] = useState(false);

  useEffect(() => {
    const handleUserRegistration = async () => {
      if (isAuthenticated && user && !isRegistering && !hasRegistered) {
        try {
          setIsRegistering(true);
          console.log('Ensuring user exists in database...');
          
          const result = await ensureUserExists();
          
          if (result.wasCreated) {
            console.log('New user created in database');
            toast({
              title: 'Welcome to RaceIQ!',
              description: 'Your account has been set up successfully.',
              status: 'success',
              duration: 3000,
              isClosable: true,
            });
          } else {
            console.log('Existing user found in database');
          }
          
          setHasRegistered(true);
        } catch (error) {
          console.error('Failed to ensure user exists:', error);
          toast({
            title: 'Registration Error',
            description: 'There was an issue setting up your account. Please try again.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        } finally {
          setIsRegistering(false);
        }
      }
    };

    if (!isLoading) {
      handleUserRegistration();
    }
  }, [isAuthenticated, user, isLoading, ensureUserExists, toast, isRegistering, hasRegistered]);

  // Show loading spinner while registering
  if (isRegistering) {
    return <F1LoadingSpinner text="Setting up your account..." />;
  }

  // Render children normally
  return <>{children}</>;
};

export default UserRegistrationHandler;
