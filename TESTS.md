# Testing Checklist

---

## About Page — Manual Test Checklist
This checklist is for manual, human-driven testing of the About page.

### Load & Stability
- [ ] Page renders without crashing (no blank screen)  
- [ ] Browser console has no errors/warnings  

### Hero
- [ ] Title shows: “Beyond the Finish Line”  
- [ ] Subtitle shows  
- [ ] Background image loads (no broken image icon)  

### "What We Offer" (Features)
- [ ] Section heading: "What We Offer"  
- [ ] Exactly 3 feature cards render  
- [ ] Each card has icon, title, and description  
- [ ] Card hover elevates (shadow + translateY)  

### "The Team"
- [ ] Section heading: "The Team"  
- [ ] Exactly 6 team members render (names + roles)  
- [ ] Cards are evenly spaced on desktop  
- [ ] On small screens, grid wraps cleanly (no overlap/cut-off)  

### "Powered By"
- [ ] Section heading: "Powered By"  
- [ ] Tech items visible: React, NestJS, Supabase, Auth0, OpenF1 API  
- [ ] For items with logos: images render and use correct alt  
- [ ] For OpenF1 API (no logo): icon renders (no console error)  

### Navigation & Consistency
- [ ] Page uses site font/colors (consistent with Home)  
- [ ] Header/footer links work as expected; logo returns to Home  

### Accessibility
- [ ] All images have alt text (except purely decorative)  
- [ ] You can Tab through interactive elements in a logical order  
- [ ] Text contrast is readable on dark background  

### Responsive (DevTools device toolbar)
- [ ] ~768px: headings shrink; grid reflows (no overflow)  
- [ ] ~480px: typography scales; nothing clipped off-screen  

---

## Drivers Page — Automated Test Checklist
This checklist outlines the automated tests you have implemented for the Drivers page. All of these tests are running successfully and are an integral part of your continuous integration and development process.

**Drivers.test.tsx**
- [x] **Loading and Success State**: The component shows a loading spinner initially and then successfully renders team tabs and driver cards after a successful API fetch.  
- [x] **Filtering Functionality**: Clicking a team tab correctly filters the displayed driver cards and updates the active tab's styling.  
- [x] **Error Handling**: When the API fetch fails, the component renders an error message and triggers a toast notification with the correct information.  
- [x] **Empty State Handling**: The component correctly renders a "No drivers found." message when the API returns an empty list of drivers.  

---

## Admin Page — Automated Test Checklist
The Admin page is mostly static UI, so automated tests focus on structure and CSS class consistency.

**Admin.test.tsx**
- [x] **Main Title and Section**: Renders the "Admin Dashboard" title and "System Overview" heading.  
- [x] **Statistics Grid**: Renders exactly 4 stat cards with the correct titles, values, and subtitles.  
- [x] **Admin Tools**: Renders the Quick Actions card with 3 action buttons: *Refresh Data Cache*, *View System Logs*, and *Manage Users*.  
- [x] **Recent Activity**: Renders the Recent Activity list with exactly 5 items.  
- [x] **Admin Features**: Renders the Admin Features section with one title and two description paragraphs, each using the correct `adminFeaturesDescription` class.  

---

## Components — Automated Test Checklist

### BackToTopButton.test.tsx
- [x] Button does not render when `scrollY <= 300`.  
- [x] Button appears when `scrollY > 300`.  
- [x] Button hides again when scrolling back above threshold.  
- [x] Clicking the button triggers `window.scrollTo` with `{ top: 0, behavior: "smooth" }`.  

### DashboardGrid.test.tsx
- [x] Renders `DriverDetailProfile` with correct driver props.  
- [x] Renders three `StatCard`s with Wins, Podiums, and Fastest Laps.  
- [x] Renders `WinsPerSeasonChart` and `LapByLapChart` with correct data and team color.  
- [x] Falls back to default team color (`#e10600`) when team is not found in map.  

### DriverList.test.tsx
- [x] Renders all drivers with number, name, and team.  
- [x] Highlights active driver (`selectedDriverId`) with correct CSS class and team color.  
- [x] Clicking a driver calls `setSelectedDriverId` with that driver’s id.  
- [x] Search filters list by name or team dynamically.  

### DriverProfileCard.test.tsx
- [x] Renders driver first name and last name split correctly with typography classes.  
- [x] Displays driver number and headshot (falls back to placeholder on error).  
- [x] Applies dynamic background gradient using team color and darkened shade.  
- [x] Shows nationality flag via `react-country-flag`.  
- [x] Renders bottom section with “View Profile” text and hover styling.  

### F1LoadingSpinner.test.tsx
- [x] Renders loading text passed via props.  
- [x] Displays speedometer container, dial, and animated needle.  
- [x] Renders 7 speedometer markings and 7 numbers.  
- [x] Spot-check: number “300” is visible.  

### FastestLapCard.test.tsx
- [x] Renders the title "Fastest Lap".  
- [x] Displays the provided lap time.  
- [x] Displays the driver name with Zap icon.  
- [x] Applies dynamic gradient background using `teamColor` (fallback to red).  

### FeaturedDriverCard.test.tsx
- [x] Renders title, driver name, team, and points.  
- [x] Displays driver image with correct `alt` and `src`.  
- [x] Renders ArrowUpRight icon button.  
- [x] Applies background with provided `accentColor`.  

### FlagsTimeline.test.tsx
- [x] Renders the title "Race Timeline".  
- [x] Displays lap labels (Lap 1 … Lap N).  
- [x] Segments are rendered with correct width, class, and title tooltip.  
- [x] Legend includes: Green Flag, Yellow Flag, Safety Car, Virtual Safety Car.  
- [x] Defaults unknown flag type to Green Flag (color + label).  

### ProfilePage.test.tsx
- [x] Shows warning toast when clicking **Delete Account**.  
- [x] Toggles email notifications switch on/off.  
- [x] Lets user change username, team, and driver fields, then saves via PATCH with correct headers, payload, and success toast.  


## 🛡️ Auth0 Configuration

This project uses **Auth0** for authentication.

### Local Development
- Create a `.env` file in `frontend/` with:
  ```bash
  VITE_AUTH0_DOMAIN=your-tenant.us.auth0.com
  VITE_AUTH0_CLIENT_ID=your-client-id
  VITE_AUTH0_AUDIENCE=your-api-audience
---

main.tsx — Automated Test Checklist

Goal: Ensure the root entry correctly composes providers and renders without side effects.

main.test.tsx (suggested)

 Renders Without Crashing: Rendering main.tsx bootstraps the app without throwing.

 Providers Wrap Correctly: Confirms the presence of provider effects (e.g., theme class on body, or a known element that only appears when providers mount).

 Auth0 Provider Config: Auth0Provider receives domain/clientId/audience from import.meta.env (or window.* on SWA) — validated by spying the module or injecting env vars before render.

 Router Boots: Root route renders expected content (e.g., landing hero, top nav).

 No Network on Boot: global.fetch is mocked; no unintended API calls run during initial mount.

 Responsive Determinism: window.matchMedia mocked to desktop to avoid layout-dependent flakiness.

 Portal Safety (If Used): If Chakra/portals are used globally, a portal container is present or mocked so modals/toasts don’t error.

 Accessibility Baseline: The first focusable element is reachable via Tab (smoke check using Testing Library focus utilities if desired).

Minimal smoke-test strategy:

Render main.tsx (or a Root component exported for testing) inside a JSDOM container.

Assert the app’s top-level landmark (e.g., role="banner" or a known heading) appears and no console errors are emitted.

App.tsx — Automated Test Checklist

Goal: Verify routing, top-level layout, auth-driven UI, and that gates/loaders don’t block the UI in tests.

App.test.tsx

 Unauthenticated Navbar: Navbar renders accessible links: Home, Drivers, Races, About.

 Login CTA Visible: When unauthenticated, at least one Log In button is present (navbar and/or hero).

 Hero Renders on Home: Home hero header renders (title + subtitle).

 Authenticated Navbar: When authenticated, navbar shows My Profile and Log Out (as button or link).

 Route Mounting: Navigating to /drivers mounts the Drivers page (assert via stable heading/nav active link).

 Responsive Stability: window.matchMedia is mocked to desktop so the nav isn’t hidden/collapsed in tests.

 Auth Gate Bypass: Any role/onboarding “setup” gate is mocked to ready (e.g., RoleContext mocked, fetch stubbed) so tests remain deterministic.

 Isolation: No real network access; services (e.g., f1ApiService.getRecentRaces) are mocked.

 Accessible Queries: Tests use getByRole/findByRole on visible controls; no brittle querySelector/class-based lookups.

Notes:

If the app uses a non-semantic container for nav, tests scope queries to a fallback container (e.g., role="banner" or document.body) rather than requiring <nav>.

jest-dom matchers are registered via expect.extend(matchers) (Vitest-compatible).