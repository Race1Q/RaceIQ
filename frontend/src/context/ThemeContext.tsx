// frontend/src/context/ThemeContext.tsx

import React, { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';

// Helper function to convert hex to an "R, G, B" string
const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '255, 24, 1'; // Fallback to F1 Red's RGB values
};

interface ThemeContextType {
  themeColor: string; // The hex color
  themeRgbColor: string; // The "R, G, B" string
  setThemeColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const defaultColor = '#FF1801';
  const [themeColor, _setThemeColor] = useState<string>(defaultColor);
  const [themeRgbColor, setThemeRgbColor] = useState<string>(hexToRgb(defaultColor));

  const setThemeColor = (color: string) => {
    _setThemeColor(color);
    setThemeRgbColor(hexToRgb(color));
  };

  return (
    <ThemeContext.Provider value={{ themeColor, themeRgbColor, setThemeColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
