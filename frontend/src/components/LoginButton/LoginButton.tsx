// frontend/src/components/LoginButton/LoginButton.tsx

import { useAuth0 } from "@auth0/auth0-react";
import { Button } from '@chakra-ui/react';
import { useThemeColor } from '../../context/ThemeColorContext';

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();
  const { accentColorWithHash, accentColorDark } = useThemeColor();

  return (
    <Button
      onClick={() => loginWithRedirect()}
      bg={accentColorWithHash}
      color="white" // 'white' is fine, 'staticWhite' from your theme is also an option
      _hover={{ bg: accentColorDark, transform: 'translateY(-2px)', boxShadow: 'lg' }}
      size="lg"
      fontWeight="bold"
      fontFamily="heading" // Polish: Added for font consistency
      transition="all 0.3s ease"
    >
      Login or Sign Up
    </Button>
  );
};

export default LoginButton;