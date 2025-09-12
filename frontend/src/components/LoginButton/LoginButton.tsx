// frontend/src/components/LoginButton/LoginButton.tsx

import { useAuth0 } from "@auth0/auth0-react";
import { Button } from '@chakra-ui/react';

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <Button
      onClick={() => loginWithRedirect()}
      bg="brand.red"
      color="white" // 'white' is fine, 'staticWhite' from your theme is also an option
      _hover={{ bg: 'brand.redDark', transform: 'translateY(-2px)', boxShadow: 'lg' }}
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