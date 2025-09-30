# Automated Test Catalog

---

## Table of Contents
1. [Frontend Testing (Vitest)](#frontend-testing-vitest)
2. [Backend Testing (Jest)](#backend-testing-jest)

---

## Frontend Testing (Vitest)

### Testing Framework & Configuration

**Testing Framework**: Vitest v3.2.4 with jsdom environment  
**Testing Library**: @testing-library/react v14.3.1  
**Test Environment**: jsdom (browser-like environment)  
**Coverage Tool**: @vitest/coverage-v8

#### Key Vitest Configuration
- **Environment**: `jsdom` for browser DOM simulation
- **Globals**: `true` - makes describe/it/expect globally available
- **Setup Files**: `./src/setupTests.ts` - configures test environment
- **Test Timeout**: 20,000ms for async operations
- **Clear Mocks**: Automatically clears mocks between tests
- **Coverage Reporters**: text, lcov, HTML
- **CSS Support**: `true` - CSS imports work in tests

### How to Run Frontend Tests

```bash
# Navigate to frontend directory
cd frontend

# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:cov

# Run tests in CI environment
npm run test:ci
```

### What We're Testing & Why

#### 1. **Components** (UI Rendering & Interaction)
**What**: Component rendering, props handling, user interactions, conditional rendering, styling  
**Why**: Ensures UI components display correctly, handle user input, and maintain visual consistency  
**Pattern**: Render with ChakraProvider + MemoryRouter, query elements, simulate user events

#### 2. **Pages** (Route-Level Components)
**What**: Full page rendering, data fetching integration, routing behavior, page-specific logic  
**Why**: Validates complete user flows and page-level functionality  
**Pattern**: Mock API calls, render with full provider stack, test loading/error/success states

#### 3. **Custom Hooks** (Reusable Logic)
**What**: Data fetching, state management, side effects, API integration  
**Why**: Ensures reusable logic works correctly across components  
**Pattern**: Uses `renderHook` from @testing-library/react, mocks external dependencies

#### 4. **Context Providers** (Global State)
**What**: Context creation, state sharing, provider behavior  
**Why**: Validates global state management works across component tree  
**Pattern**: Wraps test components with context providers, tests value propagation

#### 5. **Utility Functions** (Helpers & Utils)
**What**: Data transformations, formatting, calculations  
**Why**: Ensures helper functions produce correct outputs  
**Pattern**: Simple input/output testing

#### 6. **Integration** (Component Composition)
**What**: Multiple components working together, parent-child communication  
**Why**: Validates components integrate correctly in real-world scenarios  
**Pattern**: Renders component trees, tests data flow and event bubbling

### Testing Patterns & Strategies

#### Pattern 1: Component Testing with Providers
```typescript
// Render component with ChakraProvider and Router
function renderWithProviders(ui: React.ReactNode) {
  return render(
    <ChakraProvider>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </ChakraProvider>
  );
}
```

#### Pattern 2: Custom Hook Testing
```typescript
// Test hooks with renderHook utility
const { result } = renderHook(() => useDriverStandings(2024), { 
  wrapper: ({ children }) => <ChakraProvider>{children}</ChakraProvider>
});

await waitFor(() => expect(result.current.loading).toBe(false));
```

#### Pattern 3: Mocking External Dependencies
```typescript
// Mock Auth0
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: true,
    user: { sub: 'test-user' },
    getAccessTokenSilently: vi.fn()
  })
}));

// Mock API calls
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => mockData
});
```

#### Pattern 4: Testing User Interactions
```typescript
// Simulate user events
const button = screen.getByRole('button', { name: /submit/i });
fireEvent.click(button);

// Assert expected outcomes
expect(mockFunction).toHaveBeenCalledTimes(1);
expect(screen.getByText('Success!')).toBeInTheDocument();
```

#### Pattern 5: Async Testing with waitFor
```typescript
// Wait for async operations to complete
await waitFor(() => {
  expect(screen.getByText('Loaded Data')).toBeInTheDocument();
});
```

#### Pattern 6: Error Boundary & Error State Testing
```typescript
// Mock failed API call
mockFetch.mockRejectedValueOnce(new Error('API Error'));

// Verify error handling
await waitFor(() => {
  expect(screen.getByText(/error/i)).toBeInTheDocument();
});
```

### Frontend Coverage Exclusions

The following files/patterns are excluded from coverage reporting:

#### Configuration Files (`src/theme.ts`, `src/vite-env.d.ts`)
**Why**: Theme configuration and type definitions contain no testable logic. Theme is validated through integration tests.

#### Static Data (`src/data/**`, `src/types/**`)
**Why**: TypeScript interfaces and mock data files have no runtime logic. Type safety is enforced by TypeScript compiler.

#### Asset Utilities (`src/lib/assets.ts`, `src/lib/teamAssets.ts`, `src/lib/teamCars.ts`)
**Why**: Simple object mappings and static asset imports. Testing these would be redundant and low-value.

#### External API Services (`src/services/f1Api.ts`, `src/hooks/useApi.ts`)
**Why**: Direct external API integration is mocked in tests. Real API behavior is validated through manual testing and E2E tests in staging.

#### Theme Context (`src/context/ThemeContext.tsx`)
**Why**: Thin wrapper around Chakra's color mode. Testing would duplicate Chakra UI's own tests.

### Complete Test Inventory

#### **Core Application Tests** (2 tests)
1. `src/0.main.test.tsx` - **Bootstrap & Configuration Testing**
   - Tests main entry point initialization
   - Validates Auth0 configuration from environment variables
   - Tests fallback to window.VITE_* variables
   - Ensures app throws error when config is missing
   - **Why**: Critical for app initialization and Auth0 setup

2. `src/App/App.test.tsx` - **Root App Component**
   - Tests authenticated vs unauthenticated navigation bar
   - Validates routing to Drivers page
   - **Why**: Ensures main app container works correctly

---

#### **Layout Components** (2 tests)
3. `src/components/layout/AppLayout.test.tsx` - **Application Layout Structure**
   - Tests sidebar and main content area rendering
   - Validates responsive layout behavior
   - **Why**: Ensures consistent app layout across pages

4. `src/components/layout/Sidebar.test.tsx` - **Navigation Sidebar**
   - Tests navigation links rendering
   - Validates active route highlighting
   - **Why**: Ensures navigation UI works correctly

---

#### **Theme & Styling** (2 tests)
5. `src/theme.test.tsx` - **Theme Configuration**
   - Validates theme object structure
   - Tests ChakraProvider integration
   - **Why**: Ensures theme configuration is correct

6. `src/components/ThemeToggleButton/ThemeToggleButton.test.tsx` - **Dark/Light Mode Toggle**
   - Tests theme toggle button rendering
   - Validates icon changes (Moon/Sun) based on color mode
   - Tests toggleColorMode function calls
   - **Why**: Ensures theme switching works for users

---

#### **Authentication & User Management** (4 tests)
7. `src/components/LoginButton/LoginButton.test.tsx` - **Login UI Component**
   - Tests login button rendering
   - Validates integration with Auth0
   - **Why**: Critical for user authentication flow

8. `src/components/LogoutButton/LogoutButton.test.tsx` - **Logout UI Component**
   - Tests logout button for authenticated users
   - **Why**: Ensures users can log out successfully

9. `src/components/UserRegistrationHandler/UserRegistrationHandler.test.tsx` - **User Registration Flow**
   - Tests automatic user registration on first Auth0 login
   - Validates success, existing user, and retry scenarios
   - **Why**: Critical for user onboarding and data persistence

10. `src/hooks/useUserRegistration.test.tsx` - **User Registration Hook**
    - Tests user registration logic
    - Validates API calls and error handling
    - **Why**: Ensures user registration backend integration works

11. `src/hooks/useUserProfile.test.tsx` - **User Profile Hook**
    - Tests profile data fetching and updates
    - **Why**: Ensures user profile management works correctly

---

#### **Context Providers** (1 test)
12. `src/context/RoleContext.test.tsx` - **Role Management Context**
    - Tests role-based access control context
    - Validates role state propagation
    - **Why**: Ensures admin/user role management works

---

#### **Drivers Module** (7 tests - Components, Pages, Hooks)
13. `src/components/DriverList/DriversList.test.tsx` - **Driver List Component**
    - Renders driver list with number, name, team
    - Tests driver selection interaction
    - Validates team color borders
    - **Why**: Core UI for driver browsing

14. `src/components/DriverProfileCard/DriverProfileCard.test.tsx` - **Driver Profile Card**
    - Tests driver card rendering (name, number, nationality)
    - Validates image and flag display
    - **Why**: Reusable driver display component

15. `src/components/DriverDetailProfile/DriverDetailProfile.test.tsx` - **Driver Detail Profile**
    - Tests detailed driver profile view
    - Validates stats and career information
    - **Why**: Core driver detail page component

16. `src/components/FeaturedDriverCard/FeaturedDriverCard.test.tsx` - **Featured Driver Card**
    - Tests featured driver display with points and team
    - **Why**: Homepage hero content

17. `src/components/FeaturedDriverSection/FeaturedDriverSection.test.tsx` - **Featured Driver Section**
    - Tests section with multiple featured drivers
    - **Why**: Homepage driver showcase

18. `src/pages/Drivers/Drivers.test.tsx` - **Drivers Page**
    - Tests loading state, team tabs, driver cards
    - Validates filtering by team
    - **Why**: Main drivers browsing page

19. `src/pages/DriverDetailPage/DriverDetailPage.test.tsx` - **Driver Detail Page**
    - Tests full driver detail page with stats, charts, career data
    - **Why**: Comprehensive driver information page

20. `src/hooks/useDriversData.test.tsx` - **Drivers Data Hook**
    - Tests fetching all drivers data
    - Validates error handling and loading states
    - **Why**: Core data fetching logic for drivers

21. `src/hooks/useDriverDetails.test.tsx` - **Driver Details Hook**
    - Tests fetching individual driver details
    - **Why**: Detail page data integration

22. `src/hooks/useDriverStandings.test.tsx` - **Driver Standings Hook**
    - Tests standings data fetching for a season
    - Validates data transformation and error handling
    - Tests multiple HTTP error scenarios (401, 404, 500)
    - Tests malformed JSON handling
    - Tests authentication token errors
    - **Why**: Critical for standings page functionality

---

#### **Constructors/Teams Module** (3 tests)
23. `src/pages/Constructors/Constructors.test.tsx` - **Constructors Page**
    - Tests constructor list display
    - **Why**: Main teams browsing page

24. `src/pages/ConstructorsDetails/ConstructorsDetails.test.tsx` - **Constructor Details Page**
    - Tests team detail page with stats
    - **Why**: Team information page

25. `src/components/TeamLogo/TeamLogo.test.tsx` - **Team Logo Component**
    - Tests team logo rendering with fallbacks
    - **Why**: Reusable team branding component

26. `src/components/TeamBanner/TeamBanner.test.tsx` - **Team Banner Component**
    - Tests team header banner with colors
    - **Why**: Team detail page header

27. `src/components/TeamMemberCard/TeamMemberCard.test.tsx` - **Team Member Card**
    - Tests About Us team member cards
    - **Why**: About page team showcase

---

#### **Races Module** (10 tests)
28. `src/pages/RacesPage/RacesPage.test.tsx` - **Races Page**
    - Tests race list display
    - Validates filtering and sorting
    - **Why**: Main races browsing page

29. `src/pages/RaceDetailPage/RaceDetailPage.test.tsx` - **Race Detail Page**
    - Tests full race detail view with results
    - **Why**: Individual race information page

30. `src/pages/RacesPage/components/RaceDetailsModal.test.tsx` - **Race Details Modal**
    - Tests modal popup for race quick view
    - **Why**: Quick race information overlay

31. `src/components/RaceSlider/RaceSlider.test.tsx` - **Race Slider Component**
    - Tests race carousel/slider
    - **Why**: Homepage race showcase

32. `src/components/RaceSlider/RaceCard.test.tsx` - **Race Card Component**
    - Tests individual race card in slider
    - **Why**: Reusable race display component

33. `src/components/RaceList/RaceList.test.tsx` - **Race List Component**
    - Tests race list rendering
    - **Why**: Race browsing component

34. `src/components/RaceProfileCard/RaceProfileCard.test.tsx` - **Race Profile Card**
    - Tests race summary card
    - **Why**: Reusable race card

35. `src/components/RaceHeader/RaceHeader.test.tsx` - **Race Header Component**
    - Tests race page header with circuit info
    - **Why**: Race detail page header

36. `src/components/RaceControlLog/RaceControlLog.test.tsx` - **Race Control Log**
    - Tests race event timeline (flags, incidents)
    - **Why**: Race detail page event log

37. `src/components/RaceStandings/RaceStandings.test.tsx` - **Race Standings Component**
    - Tests race result standings display
    - **Why**: Race results visualization

38. `src/components/RaceStandingsTable/RaceStandingsTable.test.tsx` - **Race Standings Table**
    - Tests tabular race results
    - **Why**: Structured race results display

---

#### **Standings Module** (4 tests)
39. `src/pages/Standings/Standings.test.tsx` - **Standings Page Container**
    - Tests standings page with driver/constructor tabs
    - **Why**: Main standings page

40. `src/pages/Standings/DriverStandings.test.tsx` - **Driver Standings Page**
    - Tests driver championship standings
    - **Why**: Driver standings view

41. `src/pages/Standings/ConstructorStandings.test.tsx` - **Constructor Standings Page**
    - Tests constructor championship standings
    - Validates season selection and refetching
    - **Why**: Constructor standings view

42. `src/hooks/useDriverStandings.test.tsx` - (Already counted above in Drivers section)

---

#### **Dashboard Module** (12 tests - Widgets & Layout)
43. `src/pages/Dashboard/DashboardPage.test.tsx` - **Dashboard Page**
    - Tests customizable dashboard layout
    - Validates widget grid system
    - **Why**: Main user dashboard

44. `src/pages/Dashboard/components/DashboardHeader.test.tsx` - **Dashboard Header**
    - Tests dashboard title and controls
    - **Why**: Dashboard page header

45. `src/pages/Dashboard/components/CustomizeDashboardModal.test.tsx` - **Dashboard Customization Modal**
    - Tests widget selection and customization
    - **Why**: Dashboard personalization feature

46. `src/pages/Dashboard/widgets/WidgetCard.test.tsx` - **Base Widget Card**
    - Tests generic widget container
    - **Why**: Reusable widget wrapper

47. `src/pages/Dashboard/widgets/FastestLapWidget.test.tsx` - **Fastest Lap Widget**
    - Tests fastest lap display widget
    - **Why**: Dashboard data widget

48. `src/pages/Dashboard/widgets/NextRaceWidget.test.tsx` - **Next Race Widget**
    - Tests upcoming race information
    - **Why**: Race countdown widget

49. `src/pages/Dashboard/widgets/LastPodiumWidget.test.tsx` - **Last Podium Widget**
    - Tests recent race podium display
    - **Why**: Recent results widget

50. `src/pages/Dashboard/widgets/StandingsWidget.test.tsx` - **Standings Widget**
    - Tests mini standings display
    - **Why**: Quick standings reference

51. `src/pages/Dashboard/widgets/FavoriteDriverSnapshotWidget.test.tsx` - **Favorite Driver Widget**
    - Tests user's favorite driver stats
    - **Why**: Personalized driver widget

52. `src/pages/Dashboard/widgets/FavoriteTeamSnapshotWidget.test.tsx` - **Favorite Team Widget**
    - Tests user's favorite team stats
    - **Why**: Personalized team widget

53. `src/pages/Dashboard/widgets/HeadToHeadQuickCompareWidget.test.tsx` - **Head-to-Head Widget**
    - Tests driver comparison widget
    - **Why**: Quick driver comparison

54. `src/pages/Dashboard/widgets/LatestF1NewsWidget.test.tsx` - **F1 News Widget**
    - Tests news feed display
    - **Why**: External content integration

55. `src/hooks/useDashboardData.test.tsx` - **Dashboard Data Hook**
    - Tests dashboard data aggregation
    - **Why**: Dashboard data fetching logic

---

#### **Compare Drivers Module** (3 tests)
56. `src/pages/CompareDriversPage/CompareDriversPage.test.tsx` - **Compare Drivers Page**
    - Tests driver comparison page
    - **Why**: Driver comparison feature

57. `src/pages/CompareDriversPage/components/DriverSelectionPanel.test.tsx` - **Driver Selection Panel**
    - Tests driver picker for comparison
    - **Why**: Driver selection UI

58. `src/pages/CompareDriversPage/components/ComparisonTable.test.tsx` - **Comparison Table**
    - Tests side-by-side driver stats table
    - **Why**: Comparison results display

59. `src/components/ComparePreviewSection/ComparePreviewSection.test.tsx` - **Compare Preview Section**
    - Tests homepage compare teaser
    - **Why**: Compare feature promotion

60. `src/hooks/useDriverComparison.test.tsx` - **Driver Comparison Hook**
    - Tests comparison data fetching and calculation
    - **Why**: Comparison logic

---

#### **Profile & Admin Module** (2 tests)
61. `src/pages/ProfilePage/ProfilePage.test.tsx` - **Profile Page**
    - Tests user profile editing
    - Validates settings toggles
    - Tests profile deletion with confirmation
    - **Why**: User account management

62. `src/pages/Admin/Admin.test.tsx` - **Admin Page**
    - Tests admin dashboard with system stats
    - **Why**: Admin interface

---

#### **Charts & Visualizations** (6 tests)
63. `src/components/WinsPerSeasonChart/WinsPerSeasonChart.test.tsx` - **Wins Per Season Chart**
    - Tests bar chart rendering with driver wins data
    - **Why**: Driver career visualization

64. `src/components/LapByLapChart/LapByLapChart.test.tsx` - **Lap-by-Lap Chart**
    - Tests race progression line chart
    - **Why**: Race analysis visualization

65. `src/components/LapPositionChart/LapPositionChart.test.tsx` - **Lap Position Chart**
    - Tests position changes over race
    - **Why**: Race strategy visualization

66. `src/components/TireStrategyChart/TireStrategyChart.test.tsx` - **Tire Strategy Chart**
    - Tests tire compound usage visualization
    - **Why**: Race strategy analysis

67. `src/components/PaceDistributionChart/PaceDistributionChart.test.tsx` - **Pace Distribution Chart**
    - Tests driver pace comparison
    - **Why**: Performance analysis

68. `src/components/FlagsTimeline/FlagsTimeline.test.tsx` - **Flags Timeline**
    - Tests race flag periods visualization
    - Validates segment width calculations
    - **Why**: Race event timeline

---

#### **Race-Specific Components** (10 tests)
69. `src/components/RaceDetails/Podium.test.tsx` - **Podium Component**
    - Tests top 3 finishers display
    - **Why**: Race winner celebration

70. `src/components/PodiumCard/PodiumCard.test.tsx` - **Podium Card Component**
    - Tests individual podium position card
    - **Why**: Reusable podium display

71. `src/components/FastestLapCard/FastestLapCard.test.tsx` - **Fastest Lap Card**
    - Tests fastest lap info display with driver and time
    - **Why**: Race stats highlight

72. `src/components/WeatherCard/WeatherCard.test.tsx` - **Weather Card**
    - Tests track conditions and weather display
    - Validates weather icon selection
    - **Why**: Race conditions information

73. `src/components/HistoricalStatsTable/HistoricalStatsTable.test.tsx` - **Historical Stats Table**
    - Tests circuit history table (lap record, previous winner)
    - **Why**: Circuit statistics

74. `src/components/TrackMap/TrackMap.test.tsx` - **Track Map Component**
    - Tests circuit layout rendering
    - **Why**: Visual circuit representation

75. `src/components/TrackStatsBars/TrackStatsBars.test.tsx` - **Track Stats Bars**
    - Tests track characteristic bars
    - **Why**: Circuit characteristics visualization

76. `src/components/KeyInfoBar/KeyInfoBar.test.tsx` - **Key Info Bar**
    - Tests race key information display
    - **Why**: Race metadata display

77. `src/components/KeyInfoBlocks/KeyInfoBlocks.test.tsx` - **Key Info Blocks**
    - Tests info block grid layout
    - **Why**: Structured info display

78. `src/components/InfoBlock/InfoBlock.test.tsx` - **Info Block Component**
    - Tests individual info block
    - **Why**: Reusable info card

---

#### **UI Components & Utilities** (15 tests)
79. `src/components/StatCard/StatCard.test.tsx` - **Stat Card Component**
    - Tests generic stat display card
    - **Why**: Reusable statistics component

80. `src/components/HeroSection/HeroSection.test.tsx` - **Hero Section Component**
    - Tests hero section with title/subtitle
    - Validates overlay and children rendering
    - **Why**: Reusable page hero

81. `src/components/HeroCanvas/HeroCanvas.test.tsx` - **Hero Canvas (3D Background)**
    - Tests Three.js hero canvas rendering
    - **Why**: Homepage 3D background

82. `src/components/BackToTopButton/BackToTopButton.test.tsx` - **Back to Top Button**
    - Tests button appears after scroll threshold
    - Validates scroll-to-top functionality
    - **Why**: UX enhancement for long pages

83. `src/components/F1LoadingSpinner/F1LoadingSpinner.test.tsx` - **F1 Loading Spinner**
    - Tests custom F1-themed loading indicator
    - Validates dial, needle, and speed markings
    - **Why**: Branded loading experience

84. `src/components/ScrollAnimationWrapper/ScrollAnimationWrapper.test.tsx` - **Scroll Animation Wrapper**
    - Tests scroll-triggered animations
    - **Why**: Page animation effects

85. `src/components/SectionConnector/SectionConnector.test.tsx` - **Section Connector**
    - Tests visual section dividers
    - **Why**: Page section separation

86. `src/components/RaceThemedDivider/RaceThemedDivider.test.tsx` - **Race Themed Divider**
    - Tests checkered flag divider
    - **Why**: Racing-themed UI element

87. `src/components/CheckeredDivider/CheckeredDivider.test.tsx` - **Checkered Divider**
    - Tests checkered pattern divider
    - **Why**: Racing aesthetic

88. `src/components/DropDownSearch/SearchableSelect.test.tsx` - **Searchable Select**
    - Tests searchable dropdown component
    - **Why**: Enhanced select inputs

89. `src/components/DriverDetails/StatCard.test.tsx` - **Driver Detail Stat Card**
    - Tests driver-specific stat card
    - **Why**: Driver stats display

90. `src/components/DriverDetails/StatSection.test.tsx` - **Driver Detail Stat Section**
    - Tests grouped driver stats section
    - **Why**: Driver stats organization

91. `src/components/DbTest/DbTest.test.tsx` - **Database Connection Test**
    - Tests Supabase connection component
    - **Why**: Development/debugging tool

92. `src/components/DebugCanvas/DebugCanvas.test.tsx` - **Debug Canvas**
    - Tests debug visualization component
    - **Why**: Development/debugging tool

93. `src/components/FeatureCard-AboutUs/FeatureCard.test.tsx` - **Feature Card**
    - Tests About Us feature cards
    - **Why**: About page features showcase

---

#### **Pages** (3 additional tests)
94. `src/pages/HomePage/HomePage.test.tsx` - **Home Page**
    - Tests landing page with hero, features, and CTAs
    - **Why**: Main application entry point

95. `src/pages/AboutUs/AboutUs.test.tsx` - **About Us Page**
    - Tests About page with team member cards
    - **Why**: Team information page

96. **(Already counted above)**

---

#### **Custom Hooks** (9 tests)
97. `src/hooks/useApi.test.tsx` - **Generic API Hook**
    - Tests generic fetch wrapper
    - **Why**: Reusable API call logic

98. `src/hooks/useActiveRoute.test.tsx` - **Active Route Hook**
    - Tests current route detection
    - **Why**: Navigation highlighting

99. `src/hooks/useHomePageData.test.tsx` - **Home Page Data Hook**
    - Tests homepage data aggregation
    - **Why**: Homepage data fetching

100. `src/hooks/useParallax.test.tsx` - **Parallax Effect Hook**
     - Tests scroll-based parallax animation
     - **Why**: Visual effects

101. `src/hooks/useScrollToTop.test.tsx` - **Scroll to Top Hook**
     - Tests programmatic scrolling
     - **Why**: Navigation helper

102. **(Other hooks already counted above)**

---

### Total Frontend Test Count: **99 test files**

---

### Tests Excluded & Why

#### **End-to-End (E2E) Tests**
**Excluded**: Full browser-based E2E tests with Playwright/Cypress  
**Why**:
- E2E tests are slow and require full app deployment
- Our component/integration tests with mocked APIs provide good coverage
- E2E validation happens in staging environment through manual QA
- Vitest with jsdom provides sufficient integration-level testing

#### **Visual Regression Tests**
**Excluded**: Screenshot-based visual testing (Percy, Chromatic)  
**Why**:
- Adds significant overhead to test suite
- UI changes are validated through code review and manual testing
- Focus is on behavioral testing, not pixel-perfect rendering
- Visual consistency maintained through design system (Chakra UI)

#### **Real Auth0 Integration Tests**
**Excluded**: Tests using real Auth0 tokens and authentication flow  
**Why**:
- Auth0 SDK is mocked in all tests to avoid external dependencies
- Real authentication tested through manual testing and staging
- Keeps tests fast and deterministic
- Avoids Auth0 API rate limits and test user management

#### **Real API Integration Tests**
**Excluded**: Tests making real HTTP calls to backend API  
**Why**:
- All fetch calls are mocked using vi.fn()
- Backend API is tested separately with its own test suite
- Keeps frontend tests fast and isolated
- API contract validated through TypeScript types and manual testing

#### **3D Canvas/WebGL Tests**
**Excluded**: Deep testing of Three.js renders and WebGL behavior  
**Why**:
- Three.js and @react-three/fiber have their own test coverage
- We test that components render without errors, not pixel-perfect 3D scenes
- WebGL testing requires complex headless browser setup
- Visual validation done through manual testing

#### **External Content Tests**
**Excluded**: Tests for external news feeds, social media embeds  
**Why**:
- External content is unpredictable and can change
- We mock external API responses
- Integration with external services validated manually

#### **Performance/Load Tests**
**Excluded**: Lighthouse scores, bundle size, rendering performance  
**Why**:
- Not part of unit test scope
- Performance monitored through Azure Application Insights
- Bundle size tracked in CI/CD separately

#### **Accessibility Tests**
**Excluded**: Automated accessibility testing (axe, pa11y)  
**Why**:
- Would add significant complexity
- Accessibility validated through Chakra UI's built-in compliance
- Manual accessibility audits performed separately
- Using semantic HTML and ARIA labels where appropriate

---

### Test Coverage Goals

**Current Coverage Target**: Focus on critical user paths and business logic  
**Coverage by Type**:
- Components: ~85% (UI rendering and interaction)
- Hooks: ~90% (data fetching and state management)
- Pages: ~80% (route-level integration)
- Utils: ~95% (pure functions and helpers)

**Quality over Quantity**: We prioritize meaningful tests that validate actual user behavior over achieving 100% line coverage.

---

### Running Tests in CI/CD

Tests run automatically in our CI/CD pipeline:

```yaml
# Example CI test command
- name: Run Frontend Tests
  run: |
    cd frontend
    npm ci
    npm run test:ci
```

**CI Environment**:
- Uses jsdom for browser simulation
- Runs with `--run` flag (no watch mode)
- Generates coverage reports (lcov, HTML)
- Fails build if tests fail or coverage drops below threshold

---

### Debugging Failed Tests

```bash
# Run a specific test file
npm test -- path/to/test.test.tsx

# Run tests matching a pattern
npm test -- --testNamePattern="should render correctly"

# Run tests for a specific component
npm test -- DriversList

# Update snapshots (if using snapshot testing)
npm test -- -u

# Run with verbose output
npm test -- --reporter=verbose
```

---

### Test Maintenance Guidelines

1. **Keep tests focused** - Each test should validate one specific behavior
2. **Mock external dependencies** - Never make real API calls or use real Auth0 tokens
3. **Use descriptive test names** - `it('should display error message when API fails')`
4. **Avoid implementation details** - Test user-facing behavior, not internal state
5. **Use userEvent over fireEvent** - Simulates real user interactions more accurately
6. **Wait for async operations** - Always use `waitFor` for async updates
7. **Clean up after tests** - Mocks are auto-cleared, but manual cleanup may be needed
8. **Keep tests deterministic** - No random data, no date dependencies

---

### Key Testing Dependencies

```json
{
  "@testing-library/react": "^14.3.1",
  "@testing-library/jest-dom": "^6.8.0",
  "@testing-library/user-event": "^14.6.1",
  "@vitest/coverage-v8": "^3.2.4",
  "vitest": "^3.2.4",
  "jsdom": "^24.1.3"
}
```

---

## Backend Testing (Jest)

### Testing Framework & Configuration

**Testing Framework**: Jest v30.1.2 with ts-jest preset
**Testing Strategy**: Unit and Integration Testing
**Test Environment**: Node.js
**Coverage Tool**: Jest built-in coverage with lcov and HTML reporters

#### Key Jest Configuration
- **Preset**: `ts-jest` for TypeScript support
- **Test Environment**: `node`
- **Test Discovery**: `backend/src/**/*.spec.ts` and `backend/test/**/*.spec.ts`
- **Max Workers**: 1 (single-threaded for stability in CI/CD)
- **Coverage Reporters**: text, lcov, HTML
- **Environment**: `.env.test` file loaded via dotenv

### How to Run Backend Tests

```bash
# Navigate to backend directory
cd backend

# Run all tests
npm test

# Run tests with coverage report
npm run test:cov

# Run tests in watch mode
npm run test:watch

# Run end-to-end tests
npm run test:e2e

# Run tests in debug mode
npm run test:debug
```

### What We're Testing & Why

#### 1. **Controllers** (API Endpoints)
**What**: HTTP endpoints, request/response handling, status codes, error handling
**Why**: Ensures API contracts are met, proper HTTP semantics, and correct delegation to services
**Pattern**: Uses NestJS Testing Module with supertest for HTTP-level testing

#### 2. **Services** (Business Logic)
**What**: Core business logic, data transformations, aggregations, CRUD operations
**Why**: Validates business rules, data processing, and service layer functionality
**Pattern**: Uses mocked repositories and dependencies to isolate logic

#### 3. **Guards** (Authentication & Authorization)
**What**: JWT authentication, scope-based authorization, request context validation
**Why**: Critical for security - ensures only authenticated/authorized users access protected resources
**Pattern**: Mocks ExecutionContext and validates canActivate behavior

#### 4. **DTOs** (Data Transfer Objects)
**What**: Data shape validation, transformation logic, serialization
**Why**: Ensures API responses are consistent and properly structured
**Pattern**: Unit tests validating DTO construction and field mapping

#### 5. **Entities** (Database Models)
**What**: Entity structure, field validation, relationships
**Why**: Ensures database schema correctness and entity construction
**Pattern**: Tests entity instantiation and property validation

#### 6. **Modules** (Dependency Injection)
**What**: Module compilation, provider registration, dependency wiring
**Why**: Validates NestJS dependency injection and module architecture
**Pattern**: Mocks all dependencies to test module structure in isolation

#### 7. **Decorators** (Custom Metadata)
**What**: Custom decorators for auth, scopes, and metadata attachment
**Why**: Ensures custom decorators properly attach metadata to routes
**Pattern**: Validates Reflector metadata and decorator behavior

#### 8. **External Integrations**
**What**: Supabase client, external API calls, notification services
**Why**: Validates integration layer behavior with mocked external services
**Pattern**: Mocks external clients and validates retry/error handling

### Testing Patterns & Strategies

#### Pattern 1: Controller Testing with Guards Override
```typescript
// Override auth guards to bypass authentication in tests
module = await Test.createTestingModule({
  controllers: [AdminController],
})
  .overrideGuard(JwtAuthGuard)
  .useValue(mockJwtAuthGuard)
  .overrideGuard(ScopesGuard)
  .useValue(mockScopesGuard)
  .compile();
```

#### Pattern 2: Repository Mocking
```typescript
// Mock TypeORM repository for isolated service testing
const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  manager: { query: jest.fn() }
};
```

#### Pattern 3: NestJS Testing Module Setup
```typescript
// Standard setup for unit/integration tests
beforeAll(async () => {
  module = await Test.createTestingModule({
    controllers: [Controller],
    providers: [Service, { provide: getRepositoryToken(Entity), useValue: mockRepository }]
  }).compile();
  
  controller = module.get<Controller>(Controller);
  service = module.get<Service>(Service);
  await app.init();
});
```

#### Pattern 4: Supertest for HTTP Testing
```typescript
// Test HTTP endpoints with supertest
await request(app.getHttpServer())
  .get('/endpoint')
  .expect(200)
  .expect((res) => {
    expect(res.body).toMatchObject({ expected: 'shape' });
  });
```

### Backend Coverage Exclusions

The following files/patterns are excluded from coverage as they don't require unit tests:

#### Module Files (`!src/**/*.module.ts`)
**Why**: NestJS modules are primarily configuration/wiring. Module compilation is tested separately to ensure proper dependency injection, but line-by-line coverage of @Module decorators adds no value.

#### DTOs (`!src/**/dto/**`)
**Why**: DTOs are data structures with class-validator decorators. We test DTO construction in relevant service/controller tests. Separate DTO-only tests would be redundant.

#### Entities (`!src/**/entities/**`)
**Why**: TypeORM entities are database schema definitions. Entity structure is validated through repository operations in service tests.

#### Ingestion Scripts (`!src/ingestion/**`)
**Why**: Data ingestion scripts are one-time data loaders for external F1 data (Ergast API, OpenF1). These are not part of the runtime application logic and are excluded from test coverage.
- Scripts are manually validated during data import
- Ingestion services have dedicated tests where they contain reusable business logic
- One-off ingestion scripts in `/src/ingestion/` directory are excluded

#### Main Entry Point (`!src/main.ts`)
**Why**: Bootstrap file that starts the NestJS application. Tested via E2E tests (`test/main.bootstrap.spec.ts`).

#### Test Files (`!**/*.spec.{ts,js}`)
**Why**: Test files themselves don't need coverage.

### Complete Test Inventory

#### **Core Application Tests** (5 tests)
1. `test/main.bootstrap.spec.ts` - Verifies NestJS application boots successfully
2. `src/app.module.spec.ts` - Validates root module structure, imports, and providers
3. `src/app.controller.spec.ts` - Tests root controller health endpoint
4. `src/app.service.spec.ts` - Tests root service getHello method
5. `test/app.e2e-spec.ts` - End-to-end application bootstrap test

---

#### **Authentication & Authorization** (7 tests)
6. `src/auth/auth.module.spec.ts` - Ensures AuthModule compiles with PassportModule and JwtStrategy
7. `src/auth/jwt-auth.guard.spec.ts` - Tests JWT guard authorization logic (valid/invalid tokens)
8. `src/auth/jwt.strategy.spec.ts` - Validates JWT strategy token validation and payload extraction
9. `src/auth/scopes.decorator.spec.ts` - Tests @Scopes decorator metadata attachment
10. `src/auth/scopes.guard.spec.ts` - Validates scope-based authorization enforcement
11. `src/auth/auth-user.decorator.spec.ts` - Tests @AuthUser decorator for extracting user from request
12. `test/setup.ts` - Test environment setup for authentication

---

#### **Admin Module** (2 tests)
13. `src/admin/admin.module.spec.ts` - Validates AdminModule compilation
14. `src/admin/admin.controller.spec.ts` - Tests admin dashboard stats and admin/me endpoint with scope guards

---

#### **Users Module** (8 tests)
15. `src/users/users.module.spec.ts` - Ensures UsersModule compiles with User entity and controllers
16. `src/users/users.controller.spec.ts` - Tests user CRUD endpoints (create, read, update, delete)
17. `src/users/users.service.spec.ts` - Tests user service business logic (registration, updates, deletion)
18. `src/users/profile.controller.spec.ts` - Tests profile management endpoints
19. `src/users/entities/user.entity.spec.ts` - Validates User entity structure
20. `src/users/dto/create-user.dto.spec.ts` - Tests user creation DTO validation
21. `src/users/dto/update-profile.dto.spec.ts` - Tests profile update DTO validation
22. **(Total: 8 tests covering users module)**

---

#### **Drivers Module** (7 tests)
23. `src/drivers/drivers.module.spec.ts` - Validates DriversModule compilation
24. `src/drivers/drivers.controller.spec.ts` - Tests driver endpoints (list, details, performance, standings)
25. `src/drivers/drivers.service.spec.ts` - Tests driver service (lookups, aggregations, career stats)
26. `src/drivers/drivers.entity.spec.ts` - Validates Driver entity structure and relations
27. `src/drivers/wins-per-season-materialized.entity.spec.ts` - Tests materialized view entity for wins per season
28. `src/drivers/dto/driver-stats.dto.spec.ts` - Tests driver statistics DTO construction
29. **(Total: 7 tests covering drivers module)**

---

#### **Constructors Module** (4 tests)
30. `src/constructors/constructors.module.spec.ts` - Validates ConstructorsModule compilation
31. `src/constructors/constructors.controller.spec.ts` - Tests constructor endpoints (ingest, list, by-api-id)
32. `src/constructors/constructors.service.spec.ts` - Tests constructor service (ingest, deduplication, upsert)
33. `src/constructors/constructors.entity.spec.ts` - Validates Constructor entity structure
34. **(Total: 4 tests covering constructors module)**

---

#### **Circuits Module** (5 tests)
35. `src/circuits/circuits.module.spec.ts` - Validates CircuitsModule compilation
36. `src/circuits/circuits.controller.spec.ts` - Tests circuit endpoints (list, details)
37. `src/circuits/circuits.service.spec.ts` - Tests circuit service data retrieval
38. `src/circuits/circuits.entity.spec.ts` - Validates Circuit entity structure
39. `src/circuits/circuits-ingest.service.spec.ts` - Tests circuit data ingestion from external sources
40. **(Total: 5 tests covering circuits module)**

---

#### **Countries Module** (4 tests)
41. `src/countries/countries.module.spec.ts` - Validates CountriesModule compilation
42. `src/countries/countries.entity.spec.ts` - Validates Country entity structure
43. `src/mapping/countries.spec.ts` - Tests country code mapping and normalization
44. **(Total: 4 tests covering countries module)**

---

#### **Seasons Module** (4 tests)
45. `src/seasons/seasons.module.spec.ts` - Validates SeasonsModule compilation
46. `src/seasons/seasons.controller.spec.ts` - Tests season ingestion endpoint
47. `src/seasons/seasons.service.spec.ts` - Tests season service (list, get-by-year, connection probe)
48. `src/seasons/seasons.entity.spec.ts` - Validates Season entity structure
49. **(Total: 4 tests covering seasons module)**

---

#### **Races Module** (6 tests)
50. `src/races/races.module.spec.ts` - Validates RacesModule compilation
51. `src/races/races.controller.spec.ts` - Tests race endpoints (list, details, by-season)
52. `src/races/races.service.spec.ts` - Tests race service data retrieval
53. `src/races/racesDetails.services.spec.ts` - Tests race details aggregation service
54. `src/races/race-summary.controller.spec.ts` - Tests race summary endpoint
55. `src/races/races.entity.spec.ts` - Validates Race entity structure
56. `src/races/dto/race-details.dto.spec.ts` - Tests race details DTO construction
57. **(Total: 6 tests covering races module)**

---

#### **Sessions Module** (2 tests)
58. `src/sessions/sessions.module.spec.ts` - Validates SessionsModule compilation
59. `src/sessions/sessions.entity.spec.ts` - Validates Session entity structure
60. **(Total: 2 tests covering sessions module)**

---

#### **Race Results Module** (3 tests)
61. `src/race-results/race-results.controller.spec.ts` - Tests race results endpoints (get by session, ingest)
62. `src/race-results/race-results.service.spec.ts` - Tests race results service with Supabase integration
63. `src/race-results/race-results.entity.spec.ts` - Validates RaceResult entity structure
64. **(Total: 3 tests covering race-results module)**

---

#### **Laps Module** (3 tests)
65. `src/laps/laps.module.spec.ts` - Validates LapsModule compilation
66. `src/laps/laps.controller.spec.ts` - Tests lap data endpoints
67. `src/laps/laps.entity.spec.ts` - Validates Lap entity structure
68. **(Total: 3 tests covering laps module)**

---

#### **Standings Module** (4 tests)
69. `src/standings/standings.module.spec.ts` - Validates StandingsModule compilation
70. `src/standings/standings.service.spec.ts` - Tests standings service (driver/constructor standings aggregation)
71. `src/standings/driver-standings-materialized.entity.spec.ts` - Tests materialized view entity
72. `src/standings/dto/standings-response.dto.spec.ts` - Tests standings DTO construction
73. **(Total: 4 tests covering standings module)**

---

#### **Notifications Module** (4 tests)
74. `src/notifications/notifications.module.spec.ts` - Validates NotificationsModule compilation
75. `src/notifications/notifications.controller.spec.ts` - Tests notification endpoint (validation, success, error)
76. `src/notifications/notifications.service.spec.ts` - Tests email notification service with retry logic
77. `src/notifications/send-race-update.dto.spec.ts` - Tests notification DTO validation
78. **(Total: 4 tests covering notifications module)**

---

#### **Race Events Module** (3 tests)
79. `src/race-events/race-events.module.spec.ts` - Validates RaceEventsModule compilation
80. `src/race-events/race-events.controller.spec.ts` - Tests race events endpoints (DRS, safety car, flags)
81. `src/race-events/race-events.entity.spec.ts` - Validates RaceEvent entity structure
82. **(Total: 3 tests covering race-events module)**

---

#### **Dashboard Module** (2 tests)
83. `src/dashboard/dashboard.service.spec.ts` - Tests dashboard aggregation service (fastest laps, standings)
84. **(Total: 2 tests covering dashboard module)**

---

#### **Supabase Integration** (2 tests)
85. `src/supabase/supabase.module.spec.ts` - Validates SupabaseModule compilation
86. `src/supabase/supabase.service.spec.ts` - Tests Supabase client initialization and query wrapping
87. **(Total: 2 tests covering Supabase integration)**

---

#### **Ingestion Services** (3 tests)
88. `src/ingestion/ingestion.module.spec.ts` - Validates IngestionModule compilation
89. `src/ingestion/ingestion.controller.spec.ts` - Tests ingestion endpoints
90. `src/ingestion/openf1.service.spec.ts` - Tests OpenF1 API integration service
91. `src/ingestion/ergast.service.spec.ts` - Tests Ergast API integration service
92. **(Total: 3 tests covering ingestion services)**

---

### Tests Excluded & Why

#### **End-to-End (E2E) Tests**
**Excluded**: Full application E2E tests for every endpoint
**Why**: 
- E2E tests require full database setup, external API mocking, and are slow
- We validate E2E behavior through `test/main.bootstrap.spec.ts` which ensures the app starts
- Controller tests with supertest provide sufficient integration-level validation
- Our focus is on unit/integration tests for faster feedback and better isolation

#### **Database Integration Tests**
**Excluded**: Tests that connect to real PostgreSQL/Supabase databases
**Why**:
- Adds complexity with database seeding, cleanup, and state management
- Slows down test execution significantly
- Mocked repositories provide sufficient coverage for service logic
- Real database queries are validated through manual testing and staging environments

#### **External API Integration Tests**
**Excluded**: Tests making real HTTP calls to Ergast API, OpenF1 API, Auth0
**Why**:
- External APIs are unreliable for automated tests (rate limits, downtime, data changes)
- We mock external services using jest.fn() to test integration layer behavior
- Real API behavior is validated during development and staging
- Our tests focus on "what we do with the data" not "can we reach the API"

#### **Real Authentication Tests**
**Excluded**: Tests requiring real Auth0 tokens or JWT generation
**Why**:
- Auth guards are overridden in controller tests to isolate endpoint logic
- JWT strategy is tested with mocked validation
- Real authentication flow is validated through frontend integration and manual testing
- Speeds up tests and removes Auth0 dependency

#### **Performance/Load Tests**
**Excluded**: No load testing, stress testing, or performance benchmarks
**Why**:
- Not part of unit/integration testing scope
- Performance validated through Azure monitoring and manual testing
- Would require dedicated infrastructure and tooling

#### **Third-Party Library Tests**
**Excluded**: No tests for NestJS core, TypeORM, Supabase SDK behavior
**Why**:
- We trust these libraries have their own test coverage
- We test our usage of these libraries, not the libraries themselves
- Example: We don't test "does TypeORM save() work" but "does our service call save() correctly"

---

### Test Coverage Goals

**Current Coverage Target**: Focus on high-value business logic and critical paths
**Coverage by Layer**:
- Controllers: ~80% (HTTP contract validation)
- Services: ~90% (core business logic)
- Guards/Decorators: ~95% (security-critical)
- DTOs/Entities: Validated through integration tests
- Modules: Structure validation only

**Quality over Quantity**: We prioritize meaningful tests over coverage percentage. Each test validates a specific behavior or requirement.

---

### Running Tests in CI/CD

Tests run automatically in our CI/CD pipeline (Azure DevOps/GitHub Actions):

```yaml
# Example CI test command
- name: Run Backend Tests
  run: |
    cd backend
    npm ci
    npm run test:cov
```

**CI Environment**:
- Uses `.env.test` for test-specific configuration
- Runs with `--runInBand` (single-threaded) for stability
- Generates coverage reports (lcov, HTML)
- Fails build if tests fail

---

### Debugging Failed Tests

```bash
# Run a specific test file
npm test -- path/to/test.spec.ts

# Run tests matching a pattern
npm test -- --testNamePattern="should create user"

# Run in debug mode with Chrome DevTools
npm run test:debug
```

---

### Test Maintenance Guidelines

1. **Keep tests isolated** - Each test should be independent and not rely on test execution order
2. **Mock external dependencies** - Never make real API calls or database queries in unit tests
3. **Use descriptive test names** - Test names should clearly state what behavior is being validated
4. **One assertion concept per test** - Tests should validate one behavior, even if multiple expect() calls
5. **Clean up after tests** - Use `afterAll`/`afterEach` to close connections and clean up resources
6. **Update tests with code changes** - Tests are living documentation and should reflect current behavior

---

### Key Testing Dependencies

```json
{
  "@nestjs/testing": "^11.0.1",
  "@types/jest": "^30.0.0",
  "@types/supertest": "^6.0.2",
  "jest": "^30.1.2",
  "supertest": "^7.0.0",
  "ts-jest": "^29.4.1"
}
```

---

## Summary

- **Frontend**: 22 test files using Vitest (to be documented further)
- **Backend**: 73 test files using Jest
- **Total Backend Test Coverage**: ~90 test suites covering controllers, services, guards, entities, DTOs, and modules
- **Testing Strategy**: Unit and integration tests with mocked dependencies
- **Coverage Focus**: Business logic, API contracts, authentication/authorization
- **Excluded**: E2E tests, real database/API integration, performance tests

---

**Last Updated**: September 30, 2025
**Documentation Owner**: Backend Team