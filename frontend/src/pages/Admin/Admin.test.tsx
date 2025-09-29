import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';
import Admin from './Admin';

// Mock Auth0 - simple approach like existing tests
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: {
      sub: 'auth0|123456789',
      name: 'Admin User',
      email: 'admin@example.com',
    },
    loginWithRedirect: vi.fn(),
    logout: vi.fn(),
  }),
}));

function renderPage(ui: React.ReactNode) {
  return render(
    <ChakraProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </ChakraProvider>
  );
}

describe('Admin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders admin dashboard main heading', () => {
    renderPage(<Admin />);

    expect(screen.getByRole('heading', { name: 'Admin Dashboard' })).toBeInTheDocument();
  });

  it('renders system overview section', () => {
    renderPage(<Admin />);

    expect(screen.getByRole('heading', { name: 'System Overview' })).toBeInTheDocument();
  });

  it('renders all statistics cards with correct data', () => {
    renderPage(<Admin />);

    // Check that all stat cards are present with correct titles and values
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('1,247')).toBeInTheDocument();
    expect(screen.getByText('+12% this week')).toBeInTheDocument();

    expect(screen.getByText('Active Sessions')).toBeInTheDocument();
    expect(screen.getByText('89')).toBeInTheDocument();
    expect(screen.getByText('Currently online')).toBeInTheDocument();

    expect(screen.getByText('API Calls')).toBeInTheDocument();
    expect(screen.getByText('45.2K')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();

    expect(screen.getByText('System Status')).toBeInTheDocument();
    expect(screen.getByText('Healthy')).toBeInTheDocument();
    expect(screen.getByText('All systems operational')).toBeInTheDocument();
  });

  it('renders quick actions section with all buttons', () => {
    renderPage(<Admin />);

    expect(screen.getByRole('heading', { name: 'Quick Actions' })).toBeInTheDocument();
    
    // Check for all quick action buttons
    expect(screen.getByRole('button', { name: 'Refresh Data Cache' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View System Logs' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Manage Users' })).toBeInTheDocument();
  });

  it('renders recent activity section with activity items', () => {
    renderPage(<Admin />);

    expect(screen.getByRole('heading', { name: 'Recent Activity' })).toBeInTheDocument();
    
    // Check for activity items
    expect(screen.getByText('• New user registration: John Doe')).toBeInTheDocument();
    expect(screen.getByText('• API rate limit exceeded for IP: 192.168.1.100')).toBeInTheDocument();
    expect(screen.getByText('• Database backup completed successfully')).toBeInTheDocument();
    expect(screen.getByText('• System maintenance scheduled for 2:00 AM')).toBeInTheDocument();
    expect(screen.getByText('• Cache cleared for race data')).toBeInTheDocument();
  });

  it('renders admin features section with proper content', () => {
    renderPage(<Admin />);

    expect(screen.getByRole('heading', { name: 'Admin Features' })).toBeInTheDocument();
    
    // Check for admin features description
    expect(screen.getByText('This admin dashboard provides system monitoring, user management, and configuration tools.')).toBeInTheDocument();
    expect(screen.getByText('Coming soon: Advanced analytics, automated alerts, and performance optimization tools.')).toBeInTheDocument();
  });

  it('renders proper heading structure', () => {
    renderPage(<Admin />);

    // Check that headings are properly structured
    const mainHeading = screen.getByRole('heading', { name: 'Admin Dashboard' });
    expect(mainHeading).toBeInTheDocument();
    expect(mainHeading.tagName).toBe('H1');

    const systemOverviewHeading = screen.getByRole('heading', { name: 'System Overview' });
    expect(systemOverviewHeading).toBeInTheDocument();
    expect(systemOverviewHeading.tagName).toBe('H2');

    const quickActionsHeading = screen.getByRole('heading', { name: 'Quick Actions' });
    expect(quickActionsHeading).toBeInTheDocument();
    expect(quickActionsHeading.tagName).toBe('H2');

    const recentActivityHeading = screen.getByRole('heading', { name: 'Recent Activity' });
    expect(recentActivityHeading).toBeInTheDocument();
    expect(recentActivityHeading.tagName).toBe('H2');

    const adminFeaturesHeading = screen.getByRole('heading', { name: 'Admin Features' });
    expect(adminFeaturesHeading).toBeInTheDocument();
    expect(adminFeaturesHeading.tagName).toBe('H2');
  });

  it('renders all main sections for authenticated admin users', () => {
    renderPage(<Admin />);

    // Check all main sections are present
    expect(screen.getByRole('heading', { name: 'Admin Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'System Overview' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Quick Actions' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Recent Activity' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Admin Features' })).toBeInTheDocument();
  });

  it('displays correct number of activity items', () => {
    renderPage(<Admin />);

    // Check that exactly 5 activity items are displayed
    const activityItems = screen.getAllByText(/• /);
    expect(activityItems).toHaveLength(5);
  });

  it('renders statistics grid with correct layout', () => {
    renderPage(<Admin />);

    // Check that all 4 stat cards are present
    const statTitles = ['Total Users', 'Active Sessions', 'API Calls', 'System Status'];
    statTitles.forEach(title => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
  });

  it('renders quick actions and recent activity in grid layout', () => {
    renderPage(<Admin />);

    // Both sections should be present as they're in the same grid
    expect(screen.getByRole('heading', { name: 'Quick Actions' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Recent Activity' })).toBeInTheDocument();
    
    // Quick actions should have 3 buttons
    const quickActionButtons = screen.getAllByRole('button').filter(button => 
      ['Refresh Data Cache', 'View System Logs', 'Manage Users'].includes(button.textContent || '')
    );
    expect(quickActionButtons).toHaveLength(3);
  });
});