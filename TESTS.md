# Automated Test Catalog

## Frontend (Vitest)

- src/0.main.test.tsx: Bootstraps main entry with providers and verifies environment-driven Auth0 config and routing renders without errors.
- src/App/App.test.tsx: Checks unauthenticated vs authenticated navbar, and that clicking Drivers navigates to the Drivers page content.
- src/components/BackToTopButton/BackToTopButton.test.tsx: Ensures the button appears after scrolling threshold and clicking it initiates a scroll-to-top action.
- src/components/DashboardGrid/DashboardGrid.test.tsx: Renders profile and stat cards with provided data and falls back to a default team color when unknown.
- src/components/DriverList/DriversList.test.tsx: Renders a list of drivers with number/name/team and supports selection and filtering interactions.
- src/components/DriverProfileCard/DriverProfileCard.test.tsx: Splits full name into first/last and displays number, image, nationality flag, and a View Profile section.
- src/components/F1LoadingSpinner/F1LoadingSpinner.test.tsx: Shows loading text, dial, needle, and expected speed markings for a spinner component.
- src/components/FastestLapCard/FastestLapCard.test.tsx: Displays fastest lap title, time, driver name, and tolerates optional teamColor styling.
- src/components/FeaturedDriverCard/FeaturedDriverCard.test.tsx: Renders driver name, team, points, image, and an action icon with accent styling.
- src/components/FlagsTimeline/FlagsTimeline.test.tsx: Renders timeline title, legend, and segments with calculated widths for race flags (including default behavior).
- src/components/HeroSection/HeroSection.test.tsx: Renders title/subtitle or custom children and keeps/removes overlay based on the disableOverlay prop.
- src/components/HistoricalStatsTable/HistoricalStatsTable.test.tsx: Renders a small table with a title, headers, lap record, and previous winner rows.
- src/components/LoginButton/LoginButton.test.tsx: Shows the Log In control and integrates with Chakra rendering.
- src/components/LogoutButton/LogoutButton.test.tsx: Shows the Log Out control for authenticated users.
- src/components/UserRegistrationHandler/UserRegistrationHandler.test.tsx: Ensures user registration is attempted on auth, handles success, existing user, and transient error with retry.
- src/components/WeatherCard/WeatherCard.test.tsx: Renders race track stats and weather values, and selects appropriate weather icon based on condition.
- src/components/WinsPerSeasonChart/WinsPerSeasonChart.test.tsx: Renders a chart with expected series/labels based on provided wins-per-season data.
- src/pages/AboutUs/AboutUs.test.tsx: Renders About page headings and the expected number of team members.
- src/pages/Admin/Admin.test.tsx: Renders Admin page title/sections and a fixed set of stat cards.
- src/pages/Drivers/Drivers.test.tsx: Shows loading state, tabs per team, and driver cards for each team once data resolves.
- src/pages/ProfilePage/ProfilePage.test.tsx: Loads profile data, supports editing/toggling settings, and shows delete confirmation toast (network mocked).
- src/pages/Standings/ConstructorStandings.test.tsx: Fetches and displays constructor standings for a season and refetches when the season selection changes.
- src/theme.test.tsx: Verifies theme config presence, fonts, global styles object, and that a ChakraProvider can render with the theme.

## Backend (Jest)

- backend/test/main.bootstrap.spec.ts: Boots the NestJS testing application and ensures it initializes successfully.
- backend/src/app.controller.spec.ts: Verifies the root controller returns the expected greeting/health response.
- backend/src/auth/auth.module.spec.ts: Ensures the AuthModule compiles and wires up providers correctly.
- backend/src/auth/jwt-auth.guard.spec.ts: Asserts the JWT auth guard permits/denies access based on token validity/context.
- backend/src/auth/jwt.strategy.spec.ts: Ensures the JWT strategy validates tokens and extracts payload as expected.
- backend/src/auth/scopes.decorator.spec.ts: Confirms custom decorator attaches scope metadata to route handlers.
- backend/src/auth/scopes.guard.spec.ts: Checks scope guard enforces required scopes from metadata against request user scopes.
- backend/src/circuits/circuits.module.spec.ts: Ensures CircuitsModule compiles and its providers are available.
- backend/src/circuits/circuits.controller.spec.ts: Verifies circuits controller endpoints call service and return expected shapes.
- backend/src/circuits/circuits.entity.spec.ts: Validates Circuits entity schema/columns and basic construction.
- backend/src/circuits/circuits-ingest.service.spec.ts: Tests ingest service transforms and persists circuit data from external sources.
- backend/src/circuits/circuits.service.spec.ts: Verifies service methods fetch, map, and return circuit data.
- backend/src/countries/countries.module.spec.ts: Ensures CountriesModule compiles and providers resolve.
- backend/src/countries/countries.controller.spec.ts: Verifies countries controller routes and responses using service stubs.
- backend/src/countries/countries.entity.spec.ts: Validates Countries entity fields and instantiation.
- backend/src/countries/countries-ingest.service.spec.ts: Tests ingest logic for countries data normalization and storage.
- backend/src/countries/countries.service.spec.ts: Verifies countries service CRUD/query methods behavior.
- backend/src/drivers/drivers.controller.spec.ts: Verifies drivers controller endpoints delegate to service and return DTOs.
- backend/src/drivers/drivers.service.spec.ts: Tests driver service methods (lookup, standings, performance aggregation) with mocks.
- backend/src/drivers/dto/driver-details-response.dto.spec.ts: Ensures the driver details DTO builds correct response shape from entities.
- backend/src/drivers/dto/driver-performance-response.dto.spec.ts: Validates the performance DTO maps lap/time metrics into API format.
- backend/src/drivers/dto/driver-response.dto.spec.ts: Checks base driver DTO mapping of core fields.
- backend/src/drivers/dto/driver-standings-response.dto.spec.ts: Confirms standings DTO serialization for position/points/wins.
- backend/src/drivers/entities/driver.entity.spec.ts: Validates Driver entity fields, relations, and construction defaults.
- backend/src/supabase/supabase.module.spec.ts: Ensures SupabaseModule compiles and exports its service.
- backend/src/supabase/supabase.service.spec.ts: Tests Supabase service initializes client and wraps basic calls.
- backend/src/notifications/notifications.service.spec.ts: Verifies email notification retry strategy (success on later attempt) and failure after all attempts.
- backend/src/notifications/notifications.controller.spec.ts: Validates payload validation (400), success mapping (201), and error propagation.
- backend/src/raceResults/raceResults.service.spec.ts: Returns rows on success and throws on Supabase error for a session.
- backend/src/raceResults/raceResults.controller.spec.ts: GET by session returns rows, POST ingest returns created/updated summary.
- backend/src/seasons/seasons.service.spec.ts: Tests connection probe, list retrieval, and get-by-year including not-found and error cases.
- backend/src/seasons/seasons-ingest.service.spec.ts: Handles paginated fetch and counts created/updated via Supabase lookups and inserts.
- backend/src/seasons/seasons.controller.spec.ts: POST /seasons/ingest returns 201 with ingestion summary.
- backend/src/constructors/constructors.service.spec.ts: Ingest deduplicates and upserts constructors, lists all, and finds by API id.
- backend/src/constructors/constructors.controller.spec.ts: POST /constructors/ingest (201), GET list, and GET by-api-id with guards overridden.
- backend/src/constructorStandings/constructorStandings.service.spec.ts: Fetches/gets constructor standings and processes rows as created/updated/skipped.
- backend/src/constructorStandings/constructorStandings.controller.spec.ts: POST ingest (201) and GET :season return summary (per current controller behavior).
- backend/src/admin/admin.controller.spec.ts: Admin dashboard returns stats; admin/me returns token claim subset with guards overridden.
- backend/src/driverStandings/driverStandings.service.spec.ts: Tests connection, list, by-race/by-driver/by-season retrieval, and search behavior.
- backend/src/driverStandings/driverStandings.controller.spec.ts: POST ingest (201) and GET endpoints for all/test/race/driver/season/search return expected results.
