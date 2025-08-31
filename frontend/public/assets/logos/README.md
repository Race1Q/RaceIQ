# Team Logo Assets

This directory contains SVG logos for F1 teams to avoid CORS issues from external hotlinks.

## Current Status

- `f1-logo.svg` - Fallback logo (already created)

## Required Logos

To complete the setup, you need to add the following SVG files:

1. `red-bull-racing.svg` - Red Bull Racing logo
2. `mercedes.svg` - Mercedes logo
3. `ferrari.svg` - Ferrari logo
4. `mclaren.svg` - McLaren logo
5. `aston-martin.svg` - Aston Martin logo
6. `alpine.svg` - Alpine logo
7. `williams.svg` - Williams logo
8. `haas.svg` - Haas F1 Team logo
9. `alphatauri.svg` - AlphaTauri logo
10. `alfaromeo.svg` - Alfa Romeo logo

## How to Add Logos

1. Download official SVG logos from team websites or use Wikimedia Commons
2. Place them in this directory with the exact filenames listed above
3. Ensure the SVGs are optimized and properly formatted
4. Test that they display correctly in the application

## Benefits

- No more CORS errors from external domains
- Faster loading times
- Consistent branding
- Offline capability
- Better user experience

## Fallback

If a team logo is missing, the system will automatically use `f1-logo.svg` as a fallback.
