import React, { useEffect } from 'react';
import { useColorMode, IconButton, Tooltip } from '@chakra-ui/react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggleButton = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  // Sync Chakra's color mode with our CSS data-theme attribute
  useEffect(() => {
    const root = document.documentElement;
    if (colorMode === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
    }
  }, [colorMode]);

  return (
    <Tooltip 
      label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
      placement="top"
    >
      <IconButton
        aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
        icon={colorMode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        onClick={toggleColorMode}
        variant="outline"
        size="md"
        borderColor="var(--color-border-gray)"
        color="var(--color-text-light)"
        bg="var(--color-surface-gray)"
        _hover={{
          bg: 'var(--color-surface-gray-light)',
          borderColor: 'var(--dynamic-accent-color, var(--color-primary-red))',
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 15px rgba(var(--dynamic-accent-rgb, 255, 24, 1), 0.2)'
        }}
        _active={{
          transform: 'translateY(0)',
          boxShadow: '0 2px 8px rgba(var(--dynamic-accent-rgb, 255, 24, 1), 0.3)'
        }}
        transition="all 0.3s ease"
      />
    </Tooltip>
  );
};

export default ThemeToggleButton;
