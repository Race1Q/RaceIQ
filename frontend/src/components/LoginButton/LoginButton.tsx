import { useAuth0 } from "@auth0/auth0-react";
import { Button } from '@chakra-ui/react';

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <Button
      onClick={() => loginWithRedirect()}
      bg="brand.red"
      color="white"
      _hover={{ bg: 'brand.redDark', transform: 'translateY(-2px)', boxShadow: 'lg' }}
      size="lg"
      fontWeight="bold"
      transition="all 0.3s ease"
    >
      Login or Sign Up
    </Button>
  );
};

export default LoginButton;