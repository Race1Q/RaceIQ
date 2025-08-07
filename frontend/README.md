# RaceIQ - Frontend

A responsive React application for tracking F1 driver and team appearances across races.

## Features

### Homepage Components

1. **Navigation Bar**
   - RaceIQ logo
   - Navigation links: Home, About, API
   - Login/Logout buttons (Auth0 integration)

2. **Hero Section**
   - Large headline: "Track Every F1 Appearance"
   - Subtitle explaining the app's purpose
   - Call-to-action buttons: "View Public Data" and Login

3. **Public Data Preview**
   - Shows 3 most recent F1 races
   - Race information: name, date, winner, team, circuit
   - Responsive grid layout

4. **Personalized Feed** (for logged-in users)
   - Welcome message with user's name
   - Placeholder for personalized content

5. **Call to Action Section**
   - Encourages account creation
   - Only shown to non-authenticated users

6. **Footer**
   - Links to API Docs, Privacy Policy, Contact
   - Copyright information

### Design Features

- **Dark Theme**: F1-inspired black and red color palette
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Clean, professional appearance with hover effects
- **RaceIQ Branding**: Uses official F1 red (#e10600) for accents

### Technical Implementation

- **React 18** with TypeScript
- **Auth0** for authentication
- **CSS Grid & Flexbox** for responsive layouts
- **Service Layer** for RaceIQ API integration (placeholder)

## File Structure

```
src/
├── App.tsx              # Main application component
├── App.css              # Comprehensive styling
├── index.css            # Global styles
├── components/
│   ├── LoginButton.tsx  # Auth0 login component
│   └── LogoutButton.tsx # Auth0 logout component
└── services/
    └── f1Api.ts         # F1 API service (placeholder)
```

## API Integration

The application includes a service layer (`f1Api.ts`) with placeholder functions for RaceIQ:

- `getRecentRaces()` - Fetch recent race results
- `getDriverAppearances()` - Get driver appearance data
- `getTeamAppearances()` - Get team appearance data
- `getCurrentStandings()` - Current season standings
- `searchDrivers()` - Search for drivers
- `searchTeams()` - Search for teams

These functions are ready to be implemented with actual RaceIQ API endpoints.

## Responsive Breakpoints

- **Desktop**: 1200px+ (3-column race grid)
- **Tablet**: 768px-1199px (2-column race grid)
- **Mobile**: <768px (1-column race grid, stacked navigation)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure Auth0 environment variables:
   ```env
   VITE_AUTH0_DOMAIN=your-domain.auth0.com
   VITE_AUTH0_CLIENT_ID=your-client-id
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Future Enhancements

- Real RaceIQ API integration
- Driver/team search functionality
- Personalized dashboards
- Race result notifications
- Historical data visualization
- Social features (following drivers/teams)
