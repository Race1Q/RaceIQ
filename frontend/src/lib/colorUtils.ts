// frontend/src/lib/colorUtils.ts

const parseHex = (hex: string): [number, number, number] => {
  const sanitizedHex = hex.replace('#', '');
  const r = parseInt(sanitizedHex.substring(0, 2), 16);
  const g = parseInt(sanitizedHex.substring(2, 4), 16);
  const b = parseInt(sanitizedHex.substring(4, 6), 16);
  return [r, g, b];
};

const toHex = (r: number, g: number, b: number): string => {
  const toHexComponent = (c: number) => {
    const hex = Math.round(c).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHexComponent(r)}${toHexComponent(g)}${toHexComponent(b)}`;
};

export const darkenColor = (hex: string, percent: number): string => {
  const [r, g, b] = parseHex(hex);
  const factor = (100 - percent) / 100;
  const darkenedR = Math.max(0, r * factor);
  const darkenedG = Math.max(0, g * factor);
  const darkenedB = Math.max(0, b * factor);
  return toHex(darkenedR, darkenedG, darkenedB);
};

export const lightenColor = (hex: string, percent: number): string => {
  const [r, g, b] = parseHex(hex);
  const factor = percent / 100;
  const lightenedR = Math.min(255, r + (255 - r) * factor);
  const lightenedG = Math.min(255, g + (255 - g) * factor);
  const lightenedB = Math.min(255, b + (255 - b) * factor);
  return toHex(lightenedR, lightenedG, lightenedB);
};