import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import Admin from './Admin';

// Mock CSS module with a default export so className lookups don't crash
vi.mock('./Admin.module.css', () => ({
  default: {
    adminContainer: 'adminContainer',
    adminTitle: 'adminTitle',
    adminOverview: 'adminOverview',
    adminOverviewTitle: 'adminOverviewTitle',
    statGrid: 'statGrid',
    statCard: 'statCard',
    statCardTitle: 'statCardTitle',
    statCardValue: 'statCardValue',
    statCardValueSuccess: 'statCardValueSuccess',
    statCardSubtitle: 'statCardSubtitle',
    adminToolsGrid: 'adminToolsGrid',
    adminToolCard: 'adminToolCard',
    adminToolCardTitle: 'adminToolCardTitle',
    actionButtons: 'actionButtons',
    actionButton: 'actionButton',
    actionButtonPrimary: 'actionButtonPrimary',
    actionButtonSecondary: 'actionButtonSecondary',
    activityList: 'activityList',
    activityItem: 'activityItem',
    adminFeatures: 'adminFeatures',
    adminFeaturesTitle: 'adminFeaturesTitle',
    adminFeaturesDescription: 'adminFeaturesDescription',
  },
}), { virtual: true });

// Helper
const renderPage = () => render(<Admin />);

describe('Admin page (static UI)', () => {
  it('renders the main title and section heading', () => {
    renderPage();

    const pageTitle = screen.getByRole('heading', { name: /admin dashboard/i, level: 1 });
    expect(pageTitle).toBeInTheDocument();

    const overviewTitle = screen.getByRole('heading', { name: /system overview/i, level: 2 });
    expect(overviewTitle).toBeInTheDocument();
  });

  it('renders 4 stat cards with correct titles, values and subtitles', () => {
    renderPage();

    // Titles
    expect(screen.getByRole('heading', { name: /total users/i, level: 3 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /active sessions/i, level: 3 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /api calls/i, level: 3 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /system status/i, level: 3 })).toBeInTheDocument();

    // Values & subtitles
    expect(screen.getByText('1,247')).toBeInTheDocument();
    expect(screen.getByText('+12% this week')).toBeInTheDocument();

    expect(screen.getByText('89')).toBeInTheDocument();
    expect(screen.getByText(/currently online/i)).toBeInTheDocument();

    expect(screen.getByText('45.2K')).toBeInTheDocument();
    expect(screen.getByText(/today/i)).toBeInTheDocument();

    const status = screen.getByText('Healthy');
    expect(status).toBeInTheDocument();
    // Should have both base value class and success modifier class
    expect(status.className).toContain('statCardValue');
    expect(status.className).toContain('statCardValueSuccess');
    expect(screen.getByText(/all systems operational/i)).toBeInTheDocument();
  });

  it('renders the admin tools with 3 action buttons and correct labels', () => {
    renderPage();

    const quickActionsHeading = screen.getByRole('heading', { name: /quick actions/i, level: 3 });
    const quickActionsCard = quickActionsHeading.closest('div')!;
    const buttons = within(quickActionsCard).getAllByRole('button');
    expect(buttons).toHaveLength(3);

    expect(screen.getByRole('button', { name: /refresh data cache/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view system logs/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /manage users/i })).toBeInTheDocument();

    // Class hints present on buttons (ensures CSS classnames are wired)
    expect(screen.getByRole('button', { name: /refresh data cache/i }).className).toContain('actionButton');
    expect(screen.getByRole('button', { name: /refresh data cache/i }).className).toContain('actionButtonPrimary');
    expect(screen.getByRole('button', { name: /view system logs/i }).className).toContain('actionButtonSecondary');
    expect(screen.getByRole('button', { name: /manage users/i }).className).toContain('actionButtonSecondary');
  });

  it('renders the Recent Activity list with 5 items', () => {
    renderPage();

    const recentHeading = screen.getByRole('heading', { name: /recent activity/i, level: 3 });
    const recentCard = recentHeading.closest('div')!;
    // items are <p> elements; query by their text content
    const items = [
      /new user registration: john doe/i,
      /api rate limit exceeded for ip: 192\.168\.1\.100/i,
      /database backup completed successfully/i,
      /system maintenance scheduled for 2:00 am/i,
      /cache cleared for race data/i,
    ];
    items.forEach((re) => {
      expect(within(recentCard).getByText(re)).toBeInTheDocument();
    });
  });

  it('renders the Admin Features with title and descriptions', () => {
    render(<Admin />);
  
    const featuresHeading = screen.getByRole('heading', { name: /admin features/i, level: 3 });
    const featuresSection = featuresHeading.closest('div')!;
  
    // Text checks
    expect(
      within(featuresSection).getByText(/provides system monitoring, user management, and configuration tools/i)
    ).toBeInTheDocument();
    expect(
      within(featuresSection).getByText(/coming soon: advanced analytics, automated alerts, and performance optimization tools/i)
    ).toBeInTheDocument();
  
    // Section has the correct container class
    expect(featuresSection.className).toContain('adminFeatures');
  
    // Only assert on <p> elements (not the <h3>)
    const paragraphs = Array.from(featuresSection.querySelectorAll('p'));
    expect(paragraphs).toHaveLength(2);
    paragraphs.forEach(p => {
      expect(p.className).toContain('adminFeaturesDescription');
    });
  });
});
