// frontend/src/components/ThemeToggleButton/ThemeToggleButton.tsx

import { useColorMode, IconButton } from '@chakra-ui/react';
import { Sun, Moon } from 'lucide-react'; // <-- Use lucide-react for consistency

interface ThemeToggleButtonProps {
  onToggle?: (theme: 'light' | 'dark') => void;
}

const ThemeToggleButton = ({ onToggle }: ThemeToggleButtonProps) => {
  const { colorMode, toggleColorMode } = useColorMode();

  const handleToggle = () => {
    const newTheme = colorMode === 'light' ? 'dark' : 'light';
    toggleColorMode();
    onToggle?.(newTheme);
  };

  return (
    <IconButton
      aria-label="Toggle theme"
      // Conditionally render the lucide-react icons
      icon={colorMode === 'light' ? <Moon /> : <Sun />}
      onClick={handleToggle}
      variant="ghost"
      color="text-secondary"
      _hover={{ bg: 'bg-surface' }}
    />
  );
};

export default ThemeToggleButton;