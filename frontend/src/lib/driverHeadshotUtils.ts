// frontend/src/lib/driverHeadshotUtils.ts

import { driverHeadshots } from './driverHeadshots';
import userIcon from '../assets/UserIcon.png';

/**
 * Normalize a driver name for tolerant lookups: strip diacritics and collapse
 * whitespace/case. Ensures e.g. API "Sergio Pérez" matches map key "Sergio Perez".
 */
function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove combining accent marks
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

// Build an accent-insensitive index of the headshot map once at module load.
const normalizedHeadshots: Record<string, string> = Object.entries(driverHeadshots).reduce(
  (acc, [name, url]) => {
    acc[normalizeName(name)] = url;
    return acc;
  },
  {} as Record<string, string>,
);

/**
 * Gets driver headshot URL with fallback chain:
 * 1. API-provided URL (from backend/database) - highest priority
 * 2. Hardcoded mapping (driverHeadshots.ts) - fallback for missing API data
 * 3. Default user icon - final fallback
 * 
 * This ensures all driver images are fetched consistently across the app,
 * matching the pattern used on the Drivers page.
 * 
 * @param apiImageUrl - The profile image URL from the API/database (can be null/undefined/empty)
 * @param driverFullName - The driver's full name for fallback lookup in driverHeadshots mapping
 * @returns A valid image URL string (never returns null/undefined)
 * 
 * @example
 * // With API URL (preferred)
 * getDriverHeadshot('https://example.com/image.png', 'Max Verstappen')
 * // Returns: 'https://example.com/image.png'
 * 
 * @example
 * // Without API URL, uses hardcoded mapping
 * getDriverHeadshot(null, 'Max Verstappen')
 * // Returns: URL from driverHeadshots['Max Verstappen']
 * 
 * @example
 * // No API URL and no mapping, uses default icon
 * getDriverHeadshot(null, 'Unknown Driver')
 * // Returns: userIcon path
 */
export function getDriverHeadshot(
  apiImageUrl: string | null | undefined,
  driverFullName?: string | null
): string {
  // Priority 1: Use API-provided URL from database (trim whitespace and check if non-empty)
  if (apiImageUrl && apiImageUrl.trim().length > 0) {
    return apiImageUrl.trim();
  }
  
  // Priority 2: Fallback to hardcoded mapping using driver's full name.
  // Try an exact match first, then an accent-insensitive match so names like
  // "Sergio Pérez" resolve against the "Sergio Perez" key.
  if (driverFullName && driverFullName.trim().length > 0) {
    const trimmedName = driverFullName.trim();
    if (driverHeadshots[trimmedName]) {
      return driverHeadshots[trimmedName];
    }
    const normalized = normalizedHeadshots[normalizeName(trimmedName)];
    if (normalized) {
      return normalized;
    }
  }
  
  // Priority 3: Default user icon (always returns a valid string)
  return userIcon;
}

