// frontend/src/components/LoginButton/LoginButton.tsx

import { useAuth0 } from "@auth0/auth0-react";
import { Button } from '@chakra-ui/react';
import { useThemeColor } from '../../context/ThemeColorContext';

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();
  const { accentColorWithHash, accentColorDark } = useThemeColor();

  const handleLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    loginWithRedirect({
      authorizationParams: {
        redirect_uri: window.location.origin,
      },
    });
  };

  return (
    <Button
      onClick={handleLogin}
      bg={accentColorWithHash}
      color="text-on-accent"
      _hover={{ bg: accentColorDark, transform: 'translateY(-2px)', boxShadow: 'lg' }}
      size="lg"
      fontWeight="bold"
      fontFamily="heading"
      transition="all 0.3s ease"
      type="button"
    >
      Login or Sign Up
    </Button>
  );
};

export default LoginButton;