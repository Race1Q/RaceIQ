# F1LoadingSpinner Component

A reusable F1-themed loading spinner component that displays a speedometer animation with customizable text.

## Usage

```tsx
import F1LoadingSpinner from './components/F1LoadingSpinner';

// Basic usage
<F1LoadingSpinner text="Loading Drivers" />

// Different contexts
<F1LoadingSpinner text="Loading RaceIQ" />
<F1LoadingSpinner text="Authenticating" />
<F1LoadingSpinner text="Loading Data" />
<F1LoadingSpinner text="Processing..." />
```

## Props

| Prop   | Type     | Required | Description                               |
| ------ | -------- | -------- | ----------------------------------------- |
| `text` | `string` | Yes      | The text to display above the speedometer |

## Features

- **F1 Speedometer Animation**: Realistic speedometer needle that sweeps from 0 to 300 km/h
- **Glowing Text**: Large, glowing text with rounded border and pulsing animation
- **F1 Theme**: Uses F1 red (#e10600) colors and racing aesthetics
- **Responsive**: Works on all screen sizes
- **Consistent**: Same styling across all loading states

## Examples

### Loading Drivers Page

```tsx
if (loading) {
  return <F1LoadingSpinner text="Loading Drivers" />;
}
```

### Authentication Loading

```tsx
if (isLoading || allowed === null) {
  return <F1LoadingSpinner text="Authenticating" />;
}
```

### App Initialization

```tsx
if (isLoading) {
  return <F1LoadingSpinner text="Loading RaceIQ" />;
}
```

## Styling

The component uses the following CSS classes:

- `.loading-container` - Main container
- `.loading-text` - Text styling with glow effects
- `.speedometer` - Speedometer container
- `.speedometer-dial` - Speedometer background
- `.speedometer-needle` - Animated needle
- `.speedometer-markings` - Speed markings
- `.speedometer-numbers` - Speed numbers

All styling is defined in `App.css` and `Drivers.css`.
