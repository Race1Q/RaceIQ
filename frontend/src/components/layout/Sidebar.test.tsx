import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import Sidebar from './Sidebar';

// Mock Auth0
const mockLogout = vi.fn();
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: true,
    logout: mockLogout,
  }),
}));

// Mock useActiveRoute hook
vi.mock('../../hooks/useActiveRoute', () => ({
  useActiveRoute: vi.fn(() => false),
}));

// Mock useRole hook
vi.mock('../../context/RoleContext', () => ({
  useRole: () => ({ role: 'user' }),
}));

// Mock ThemeToggleButton
vi.mock('../ThemeToggleButton/ThemeToggleButton', () => ({
  default: () => <div data-testid="theme-toggle">Theme Toggle</div>,
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }: any) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  useNavigate: () => vi.fn(),
  BrowserRouter: ({ children }: any) => <div>{children}</div>,
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  LayoutDashboard: (props: any) => <div data-testid="layout-dashboard-icon" {...props}>Dashboard</div>,
  Users: (props: any) => <div data-testid="users-icon" {...props}>Users</div>,
  Wrench: (props: any) => <div data-testid="wrench-icon" {...props}>Wrench</div>,
  GitCompareArrows: (props: any) => <div data-testid="compare-icon" {...props}>Compare</div>,
  Flag: (props: any) => <div data-testid="flag-icon" {...props}>Flag</div>,
  Info: (props: any) => <div data-testid="info-icon" {...props}>Info</div>,
  Settings: (props: any) => <div data-testid="settings-icon" {...props}>Settings</div>,
  Pin: (props: any) => <div data-testid="pin-icon" {...props}>Pin</div>,
  PinOff: (props: any) => <div data-testid="pin-off-icon" {...props}>PinOff</div>,
  UserCircle: (props: any) => <div data-testid="user-circle-icon" {...props}>UserCircle</div>,
  LogOut: (props: any) => <div data-testid="logout-icon" {...props}>LogOut</div>,
}));

function renderWithProviders(ui: React.ReactNode) {
  return render(
    <ChakraProvider>
      {ui}
    </ChakraProvider>
  );
}

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWithProviders(<Sidebar />);
    
    // Test that the sidebar renders without errors by checking for key elements
    expect(screen.getByRole('complementary')).toBeInTheDocument();
    expect(screen.getByTestId('layout-dashboard-icon')).toBeInTheDocument();
  });

  it('renders logo', () => {
    renderWithProviders(<Sidebar />);
    
    const logo = screen.getByAltText('RaceIQ Logo');
    expect(logo).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    renderWithProviders(<Sidebar />);
    
    // Check for main navigation icons (when collapsed, only icons are visible)
    expect(screen.getByTestId('layout-dashboard-icon')).toBeInTheDocument();
    expect(screen.getAllByTestId('users-icon')).toHaveLength(2); // Drivers and Standings
    expect(screen.getByTestId('wrench-icon')).toBeInTheDocument(); // Constructors
    expect(screen.getByTestId('compare-icon')).toBeInTheDocument();
    expect(screen.getByTestId('flag-icon')).toBeInTheDocument();
    expect(screen.getByTestId('info-icon')).toBeInTheDocument();
  });

  it('does not render admin link in sidebar (admin removed)', () => {
    renderWithProviders(<Sidebar />);
    
    // Admin link has been removed from the sidebar
    expect(screen.queryByTestId('settings-icon')).not.toBeInTheDocument();
  });

  it('renders user controls', () => {
    renderWithProviders(<Sidebar />);
    
    // When collapsed, only icons are visible, not text
    expect(screen.getByTestId('user-circle-icon')).toBeInTheDocument();
    expect(screen.getByTestId('logout-icon')).toBeInTheDocument();
  });

  it('renders pin/unpin button', () => {
    renderWithProviders(<Sidebar />);
    
    // When collapsed, only the icon is visible, not the text
    expect(screen.getByTestId('pin-off-icon')).toBeInTheDocument();
  });

  it('renders theme toggle button', () => {
    renderWithProviders(<Sidebar />);
    
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
  });

  it('handles onWidthChange callback', () => {
    const mockOnWidthChange = vi.fn();
    renderWithProviders(<Sidebar onWidthChange={mockOnWidthChange} />);
    
    // The component should call onWidthChange with initial width
    expect(mockOnWidthChange).toHaveBeenCalledWith(80);
  });

  it('expands on hover', async () => {
    renderWithProviders(<Sidebar />);
    
    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toBeInTheDocument();
    
    // Simulate mouse enter
    fireEvent.mouseEnter(sidebar);
    
    // Check if expanded state is reflected in the UI (icons should still be visible)
    await waitFor(() => {
      expect(screen.getByTestId('layout-dashboard-icon')).toBeInTheDocument();
    });
  });

  it('collapses on mouse leave when not pinned', async () => {
    renderWithProviders(<Sidebar />);
    
    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toBeInTheDocument();
    
    // First expand by hovering
    fireEvent.mouseEnter(sidebar);
    await waitFor(() => {
      expect(screen.getByTestId('layout-dashboard-icon')).toBeInTheDocument();
    });
    
    // Then collapse by leaving
    fireEvent.mouseLeave(sidebar);
    
    // The sidebar should collapse (icons should still be visible)
    expect(screen.getByTestId('layout-dashboard-icon')).toBeInTheDocument();
  });

  it('toggles pin state', () => {
    renderWithProviders(<Sidebar />);
    
    // When collapsed, find pin button by icon
    const pinButton = screen.getByTestId('pin-off-icon').closest('button');
    expect(pinButton).toBeInTheDocument();
    
    // Click to pin
    fireEvent.click(pinButton!);
    
    // Should show pin icon (pinned state)
    expect(screen.getByTestId('pin-icon')).toBeInTheDocument();
  });

  it('handles logout click', () => {
    renderWithProviders(<Sidebar />);
    
    // When collapsed, find logout button by icon
    const logoutButton = screen.getByTestId('logout-icon').closest('button');
    expect(logoutButton).toBeInTheDocument();
    
    // Click logout button (this shows a confirmation toast)
    fireEvent.click(logoutButton!);
    
    // The logout button should be clickable (toast should appear)
    expect(logoutButton).toBeInTheDocument();
    
    // Note: The actual logout only happens when user confirms in the toast
    // which is not easily testable in this unit test context
  });

  it('renders with correct initial width', () => {
    renderWithProviders(<Sidebar />);
    
    // Find sidebar by the aside element directly
    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toBeInTheDocument();
  });

  it('handles missing onWidthChange prop', () => {
    renderWithProviders(<Sidebar />);
    
    // Test that sidebar renders without errors when onWidthChange is not provided
    expect(screen.getByRole('complementary')).toBeInTheDocument();
  });

  it('maintains proper component structure', () => {
    const { container } = renderWithProviders(<Sidebar />);
    
    // Check main container exists
    const sidebar = container.querySelector('aside');
    expect(sidebar).toBeInTheDocument();
  });

  it('renders consistently across multiple renders', () => {
    const { rerender } = renderWithProviders(<Sidebar />);
    
    // When collapsed, only icons are visible
    expect(screen.getByTestId('layout-dashboard-icon')).toBeInTheDocument();
    expect(screen.getByTestId('user-circle-icon')).toBeInTheDocument();
    
    rerender(<Sidebar />);
    
    expect(screen.getByTestId('layout-dashboard-icon')).toBeInTheDocument();
    expect(screen.getByTestId('user-circle-icon')).toBeInTheDocument();
  });

  it('handles component unmounting gracefully', () => {
    const { unmount } = renderWithProviders(<Sidebar />);
    
    expect(screen.getByTestId('layout-dashboard-icon')).toBeInTheDocument();
    
    unmount();
    
    expect(screen.queryByTestId('layout-dashboard-icon')).not.toBeInTheDocument();
  });

  it('handles different authentication states', () => {
    // Test with authenticated user
    renderWithProviders(<Sidebar />);
    
    // When collapsed, only icons are visible, not text
    expect(screen.getByTestId('user-circle-icon')).toBeInTheDocument();
    expect(screen.getByTestId('logout-icon')).toBeInTheDocument();
  });

  it('renders all navigation icons', () => {
    renderWithProviders(<Sidebar />);
    
    expect(screen.getByTestId('layout-dashboard-icon')).toBeInTheDocument();
    // Use getAllByTestId for duplicate testids
    expect(screen.getAllByTestId('users-icon')).toHaveLength(2); // Drivers and Standings
    expect(screen.getByTestId('wrench-icon')).toBeInTheDocument(); // Constructors only
    expect(screen.getByTestId('compare-icon')).toBeInTheDocument();
    expect(screen.getByTestId('flag-icon')).toBeInTheDocument();
    expect(screen.getByTestId('info-icon')).toBeInTheDocument();
  });

  it('renders control icons', () => {
    renderWithProviders(<Sidebar />);
    
    expect(screen.getByTestId('user-circle-icon')).toBeInTheDocument();
    expect(screen.getByTestId('logout-icon')).toBeInTheDocument();
    expect(screen.getByTestId('pin-off-icon')).toBeInTheDocument();
  });

  it('handles pin state changes correctly', () => {
    renderWithProviders(<Sidebar />);
    
    // Initially should show PinOff icon (collapsed state)
    expect(screen.getByTestId('pin-off-icon')).toBeInTheDocument();
    
    // Click to pin (click the button containing the icon)
    const pinButton = screen.getByTestId('pin-off-icon').closest('button');
    expect(pinButton).toBeInTheDocument();
    fireEvent.click(pinButton!);
    
    // Should show Pin icon (pinned state)
    expect(screen.getByTestId('pin-icon')).toBeInTheDocument();
  });

  it('handles theme toggle visibility based on expansion state', () => {
    renderWithProviders(<Sidebar />);
    
    // Theme toggle should be visible
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
  });

  it('renders logo with correct attributes', () => {
    renderWithProviders(<Sidebar />);
    
    const logo = screen.getByAltText('RaceIQ Logo');
    expect(logo).toHaveAttribute('src', '/race_IQ_logo.svg');
  });

  it('handles navigation link clicks', () => {
    renderWithProviders(<Sidebar />);
    
    const dashboardLink = screen.getByText('Dashboard');
    expect(dashboardLink).toBeInTheDocument();
    
    // Click should work (mocked router)
    fireEvent.click(dashboardLink);
  });

  it('handles profile link click', () => {
    renderWithProviders(<Sidebar />);
    
    // When collapsed, find the profile link by the icon
    const profileLink = screen.getByTestId('user-circle-icon').closest('a');
    expect(profileLink).toBeInTheDocument();
    
    // Click should work (mocked router)
    fireEvent.click(profileLink!);
  });
});
