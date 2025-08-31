# Team Logo Assets

This directory contains team logo files for the F1 Teams page.

## Current Status

- All teams currently use `/assets/placeholder.svg` as a fallback
- The placeholder shows a circular design with the team's first letter

## How to Add Real Team Logos

1. **File Format**: Use SVG or PNG files for best quality
2. **Naming Convention**: Update the paths in `frontend/src/lib/teamAssets.ts` to match your actual filenames
3. **Recommended Names**:
   - `mercedes.svg` (or `mercedes_AMG_Petronas_F1_logo.svg`)
   - `red-bull-racing.svg`
   - `ferrari.svg`
   - `mclaren.svg`
   - `aston-martin.svg`
   - `alpine.svg`
   - `williams.svg`
   - `haas.svg`
   - `sauber.svg`
   - `rb.svg`

## Example Update

```typescript
// In frontend/src/lib/teamAssets.ts
export const teamLogoMap: { [key: string]: string } = {
  Mercedes: '/assets/mercedes.svg', // Update this path
  'Red Bull Racing': '/assets/red-bull-racing.svg', // Update this path
  // ... etc
};
```

## Fallback Behavior

- If a logo fails to load, the TeamBanner component will show a placeholder
- The placeholder displays the first letter of the team name in a circular design
- This ensures the page always looks professional even without logos

## File Requirements

- **Size**: Recommended 200x200px minimum for good quality
- **Format**: SVG preferred for scalability, PNG acceptable
- **Background**: Transparent or white backgrounds work best
- **Color**: Logos will be automatically converted to white for contrast
