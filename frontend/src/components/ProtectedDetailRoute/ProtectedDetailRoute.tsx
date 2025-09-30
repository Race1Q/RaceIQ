import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import LoginPrompt from '../LoginPrompt/LoginPrompt';

interface ProtectedDetailRouteProps {
  children: React.ReactNode;
  title?: string;
  message?: string;
}

const ProtectedDetailRoute: React.FC<ProtectedDetailRouteProps> = ({ 
  children, 
  title,
  message 
}) => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return null; // Let the parent handle loading state
  }

  if (!isAuthenticated) {
    return (
      <LoginPrompt 
        title={title}
        message={message}
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedDetailRoute;
