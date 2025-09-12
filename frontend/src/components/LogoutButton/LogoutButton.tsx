// frontend/src/components/LogoutButton/LogoutButton.tsx

import { useAuth0 } from "@auth0/auth0-react";
import { Button } from '@chakra-ui/react';

const LogoutButton = () => {
  const { logout } = useAuth0();

  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  };

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      borderColor="brand.red"
      color="brand.red"
      _hover={{ bg: 'brand.red', color: 'white' }}
      fontFamily="heading" // Polish: Added for font consistency
    >
      Log Out
    </Button>
  );
};

export default LogoutButton;