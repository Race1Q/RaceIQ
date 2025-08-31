Testing Checklist
About Page — Manual Test Checklist

This checklist is for manual, human-driven testing of the About page.

Load & Stability

 Page renders without crashing (no blank screen)

 Browser console has no errors/warnings

Hero

 Title shows: “Beyond the Finish Line”

 Subtitle shows

 Background image loads (no broken image icon)

"What We Offer" (Features)

 Section heading: "What We Offer"

 Exactly 3 feature cards render

 Each card has icon, title, and description

 Card hover elevates (shadow + translateY)

"The Team"

 Section heading: "The Team"

 Exactly 6 team members render (names + roles)

 Cards are evenly spaced on desktop

 On small screens, grid wraps cleanly (no overlap/cut-off)

"Powered By"

 Section heading: "Powered By"

 Tech items visible: React, NestJS, Supabase, Auth0, OpenF1 API

 For items with logos: images render and use correct alt

 For OpenF1 API (no logo): icon renders (no console error)

Navigation & Consistency

 Page uses site font/colors (consistent with Home)

 Header/footer links work as expected; logo returns to Home

Accessibility

 All images have alt text (except purely decorative)

 You can Tab through interactive elements in a logical order

 Text contrast is readable on dark background

Responsive (DevTools device toolbar)

 ~768px: headings shrink; grid reflows (no overflow)

 ~480px: typography scales; nothing clipped off-screen

Drivers Page — Automated Test Checklist

This checklist outlines the automated tests you have implemented for the Drivers page. All of these tests are running successfully and are an integral part of your continuous integration and development process.

Drivers.test.tsx

 Loading and Success State: The component shows a loading spinner initially and then successfully renders team tabs and driver cards after a successful API fetch.

 Filtering Functionality: Clicking a team tab correctly filters the displayed driver cards and updates the active tab's styling.

 Error Handling: When the API fetch fails, the component renders an error message and triggers a toast notification with the correct information.

 Empty State Handling: The component correctly renders a "No drivers found." message when the API returns an empty list of drivers.

Admin Page — Automated Test Checklist

The Admin page is mostly static UI, so automated tests focus on structure and CSS class consistency.

Admin.test.tsx

 Main Title and Section: Renders the "Admin Dashboard" title and "System Overview" heading.

 Statistics Grid: Renders exactly 4 stat cards with the correct titles, values, and subtitles.

 Admin Tools: Renders the Quick Actions card with 3 action buttons: Refresh Data Cache, View System Logs, and Manage Users.

 Recent Activity: Renders the Recent Activity list with exactly 5 items.

 Admin Features: Renders the Admin Features section with one title and two description paragraphs, each using the correct adminFeaturesDescription class.

main.tsx — Automated Test Checklist

Goal: Ensure the root entry correctly composes providers and renders without side effects.

main.test.tsx

 Renders Without Crashing: Rendering main.tsx bootstraps the app without throwing.

 Providers Wrap Correctly: Confirms the presence of provider effects (e.g., theme class on body, or a known element that only appears when providers mount).

 Auth0 Provider Config: Auth0Provider receives domain/clientId/audience from import.meta.env (or window.* on SWA).

 Router Boots: Root route renders expected content (e.g., landing hero, top nav).

 No Network on Boot: global.fetch is mocked; no unintended API calls run during initial mount.

 Responsive Determinism: window.matchMedia mocked to desktop to avoid layout-dependent flakiness.

 Portal Safety (If Used): Chakra portals (modals/toasts) render without error.

 Accessibility Baseline: First focusable element is reachable via Tab.

App.tsx — Automated Test Checklist

Goal: Verify routing, top-level layout, auth-driven UI, and that gates/loaders don’t block the UI in tests.

App.test.tsx

 Unauthenticated Navbar: Navbar renders links Home, Drivers, Races, About.

 Login CTA Visible: When unauthenticated, at least one Log In button is visible.

 Hero Renders on Home: Hero heading and subtitle render on root route.

 Authenticated Navbar: When authenticated, navbar shows My Profile and Log Out.

 Route Mounting: Navigating to /drivers mounts the Drivers page.

 Responsive Stability: window.matchMedia mocked to desktop so nav isn’t hidden.

 Auth Gate Bypass: Role/onboarding gates are mocked to ready (no “setting up your account” blockers).

 Isolation: API services (f1ApiService) mocked to prevent real network calls.

 Accessible Queries: Tests rely on getByRole / findByRole selectors (no brittle queries).

Components — Automated Test Checklist
HeroSection.test.tsx

 Default Render: Renders title and subtitle when provided via props.

 Children Override: Custom children replace the default title/subtitle.

 Background Image: Applies backgroundImage when backgroundColor is not provided.

 Background Color: Uses backgroundColor and disables image when provided.

 Overlay Disabled: disableOverlay=true sets overlay background to none.

 Overlay Enabled: Default overlay renders gradient background.

 Responsive Titles: Headings scale correctly under 768px and 480px (manual DevTools check).

HistoricalStatsTable.test.tsx

 Title & Headers: Renders “Historical Statistics” title and column headers Statistic / Value.

 Lap Record Row: Displays lap record time and driver subtext.

 Previous Winner Row: Displays previous winner name correctly.

 Row Count: Exactly 2 rows render in <tbody>.

 Icons: Clock and Trophy icons render inside their respective rows (smoke-checked via <svg> count).

BackToTopButton.test.tsx

 Button does not render when scrollY <= 300.

 Button appears when scrollY > 300.

 Button hides again when scrolling back above threshold.

 Clicking the button triggers window.scrollTo({ top: 0, behavior: "smooth" }).

DashboardGrid.test.tsx

 Renders DriverDetailProfile with correct driver props.

 Renders three StatCards with Wins, Podiums, and Fastest Laps.

 Renders WinsPerSeasonChart and LapByLapChart with correct data.

 Falls back to default team color (#e10600) if team not found.

DriverList.test.tsx

 Renders all drivers with number, name, and team.

 Highlights active driver with team color.

 Clicking a driver calls setSelectedDriverId.

 Search filters drivers by name/team.

DriverProfileCard.test.tsx

 Splits driver first/last name correctly.

 Displays driver number and headshot (placeholder fallback).

 Applies gradient background using team color.

 Shows nationality flag with react-country-flag.

 Renders bottom “View Profile” section with hover styling.

F1LoadingSpinner.test.tsx

 Renders loading text from props.

 Displays speedometer container, dial, and needle.

 Renders 7 markings and 7 numbers.

 Spot-check: “300” is visible.

FastestLapCard.test.tsx

 Renders title "Fastest Lap".

 Displays lap time and driver name.

 Shows Zap icon.

 Applies gradient background using teamColor (fallback red).

FeaturedDriverCard.test.tsx

 Renders title, driver name, team, points.

 Displays driver image with correct alt/src.

 Renders ArrowUpRight icon button.

 Applies background using accentColor.

FlagsTimeline.test.tsx

 Renders title "Race Timeline".

 Displays lap labels (Lap 1 … Lap N).

 Segments have correct width, class, tooltip.

 Legend includes Green, Yellow, Safety Car, VSC.

 Defaults unknown flag type to Green Flag.

ProfilePage.test.tsx

 Shows toast when clicking Delete Account.

 Toggles notifications switch on/off.

 Updates username, team, driver fields and saves via PATCH with correct payload and toast.

🛡️ Auth0 Configuration

This project uses Auth0 for authentication.

Local Development

Create a .env file in frontend/ with:

VITE_AUTH0_DOMAIN=your-tenant.us.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=your-api-audience