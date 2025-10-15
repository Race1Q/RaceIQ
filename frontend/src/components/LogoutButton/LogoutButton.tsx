// frontend/src/components/LogoutButton/LogoutButton.tsx

import { useAuth0 } from "@auth0/auth0-react";
import { Button } from '@chakra-ui/react';
import { useThemeColor } from '../../context/ThemeColorContext';

const LogoutButton = () => {
  const { logout } = useAuth0();
  const { accentColorWithHash } = useThemeColor();

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
      borderColor={accentColorWithHash}
      color={accentColorWithHash}
      _hover={{ bg: accentColorWithHash, color: 'text-on-accent' }}
      fontFamily="heading"
    >
      Log Out
    </Button>
  );
};

export default LogoutButton;