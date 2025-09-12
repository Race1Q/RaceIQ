// frontend/src/components/ThemeToggleButton/ThemeToggleButton.tsx

import { useColorMode, IconButton } from '@chakra-ui/react';
import { Sun, Moon } from 'lucide-react'; // <-- Use lucide-react for consistency

const ThemeToggleButton = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <IconButton
      aria-label="Toggle theme"
      // Conditionally render the lucide-react icons
      icon={colorMode === 'light' ? <Moon /> : <Sun />}
      onClick={toggleColorMode}
      variant="ghost"
      color="text-secondary"
      _hover={{ bg: 'bg-surface' }}
    />
  );
};

export default ThemeToggleButton;