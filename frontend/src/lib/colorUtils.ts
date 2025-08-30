// frontend/src/lib/colorUtils.ts
export function getTextColorForBackground(hexColor: string): 'light' | 'dark' {
  if (!hexColor) return 'light';

  const cleanHex = hexColor.startsWith('#') ? hexColor.slice(1) : hexColor;
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // Formula to determine perceived brightness (luminance)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Use dark text on light backgrounds, light text on dark backgrounds
  return luminance > 0.5 ? 'dark' : 'light';
}
