// frontend/src/lib/colorUtils.ts

/**
 * Helper function to calculate hue rotation for color filtering
 * This allows us to dynamically change the color of SVG elements using CSS filters
 */
export const getHueRotation = (hexColor: string): number => {
  // Convert hex to RGB
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  
  // Convert to HSL
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  
  if (max === min) {
    h = 0;
  } else if (max === r) {
    h = ((g - b) / (max - min)) % 6;
  } else if (max === g) {
    h = (b - r) / (max - min) + 2;
  } else {
    h = (r - g) / (max - min) + 4;
  }
  
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  
  // Calculate rotation needed to get from red (0deg) to target hue
  const redHue = 0; // Red is at 0 degrees
  let rotation = h - redHue;
  if (rotation < 0) rotation += 360;
  
  return rotation;
};

/**
 * Generate CSS filter string for dynamic logo coloring
 */
export const getLogoFilter = (accentColor: string): string => {
  return `brightness(0.8) hue-rotate(${getHueRotation(accentColor)}deg) saturate(1.5)`;
};

/**
 * Lighten a hex color by a percentage
 */
export const lightenColor = (hex: string, percent: number): string => {
  const cleanHex = hex.replace('#', '');
  const r = Math.min(255, parseInt(cleanHex.slice(0, 2), 16) + Math.round(255 * percent));
  const g = Math.min(255, parseInt(cleanHex.slice(2, 4), 16) + Math.round(255 * percent));
  const b = Math.min(255, parseInt(cleanHex.slice(4, 6), 16) + Math.round(255 * percent));
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

/**
 * Darken a hex color by a percentage
 */
export const darkenColor = (hex: string, percent: number): string => {
  const cleanHex = hex.replace('#', '');
  const r = Math.max(0, parseInt(cleanHex.slice(0, 2), 16) - Math.round(255 * percent));
  const g = Math.max(0, parseInt(cleanHex.slice(2, 4), 16) - Math.round(255 * percent));
  const b = Math.max(0, parseInt(cleanHex.slice(4, 6), 16) - Math.round(255 * percent));
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};