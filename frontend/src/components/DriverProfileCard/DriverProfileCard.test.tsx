import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';
import DriverProfileCard from './DriverProfileCard';

// Mock CSS module to stable classNames
vi.mock('./DriverProfileCard.module.css', () => ({
  default: {
    cardLink: 'cardLink',
    card: 'card',
    cardTop: 'cardTop',
    driverInfo: 'driverInfo',
    driverName: 'driverName',
    firstName: 'firstName',
    lastName: 'lastName',
    driverNumber: 'driverNumber',
    driverImage: 'driverImage',
    flagWrapper: 'flagWrapper',
    flagImage: 'flagImage',
    cardBottom: 'cardBottom',
  },
}), { virtual: true });

// Mock the country flag to a simple div exposing props
vi.mock('react-country-flag', () => ({
  default: ({ countryCode, title }: any) => (
    <div data-testid="flag" data-code={countryCode} data-title={title} />
  ),
}));

// Mock asset import for userIcon
vi.mock('../../assets/UserIcon.png', () => ({
  default: 'fallback.png',
}), { virtual: true });

// Mock country code map used by the component
vi.mock('../../lib/countryCodeUtils', () => ({
  countryCodeMap: {
    NLD: 'NL',
    ESP: 'ES',
  },
}));

// Note: getTextColorForBackground is imported but not used in the component;
// no need to mock it unless your bundler complains.

// Helper render with router (Link needs Router context)
function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

const baseDriver = {
  id: 'max_verstappen',
  name: 'Max Verstappen',
  number: '1',
  team: 'Red Bull Racing',
  nationality: 'NLD',   // will map to "NL"
  image: 'max.png',
  team_color: 'E10600', // Ferrari red hex without '#'
};

describe('DriverProfileCard', () => {
  it('renders names split into first/last, number, link target, and "View Profile"', () => {
    renderWithRouter(<DriverProfileCard driver={baseDriver as any} />);

    // First/last name spans exist with classes
    expect(screen.getByText('Max')).toBeInTheDocument();
    expect(screen.getByText('Verstappen')).toBeInTheDocument();

    const first = screen.getByText('Max');
    const last = screen.getByText('Verstappen');
    expect(first.className).toContain('firstName');
    expect(last.className).toContain('lastName');

    // Driver number
    expect(screen.getByText('1')).toBeInTheDocument();

    // Link points to /drivers/:id
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/drivers/max_verstappen');

    // Bottom CTA text
    expect(screen.getByText(/view profile/i)).toBeInTheDocument();
  });

  it('applies CSS custom properties for team colors and 20% darken', () => {
    renderWithRouter(<DriverProfileCard driver={baseDriver as any} />);

    // The root "card" div has the inline CSS custom properties
    const card = document.querySelector('.card') as HTMLElement;
    expect(card).toBeTruthy();

    // Start color should be "#E10600"
    expect(card.style.getPropertyValue('--team-color-start')).toBe('#E10600');

    // 20% darker should be #b40500 (E1*0.8=~B4, 06*0.8=~05, 00*0.8=00)
    expect(card.style.getPropertyValue('--team-color-end')).toBe('#b40500');
  });

  it('renders flag using mapped 2-letter code from nationality', () => {
    renderWithRouter(<DriverProfileCard driver={baseDriver as any} />);
    const flag = screen.getByTestId('flag');
    expect(flag).toHaveAttribute('data-code', 'NL'); // NLD -> NL
    expect(flag).toHaveAttribute('data-title', 'NLD');
  });

  it('falls back to user icon when image fails to load', () => {
    renderWithRouter(<DriverProfileCard driver={{ ...baseDriver, image: 'broken.png' } as any} />);
    const img = screen.getByAltText(baseDriver.name) as HTMLImageElement;

    // Simulate error event
    fireEvent.error(img);

    // Should swap to mocked fallback
    expect(img.src).toContain('fallback.png');
  });

  it('uses default #666666 when team_color is missing and darkens correctly', () => {
    const driverNoColor = { ...baseDriver, team_color: '' };
    renderWithRouter(<DriverProfileCard driver={driverNoColor as any} />);

    const card = document.querySelector('.card') as HTMLElement;
    expect(card).toBeTruthy();

    // Fallback start color "#666666"
    expect(card.style.getPropertyValue('--team-color-start')).toBe('#666666');

    // Darken 20%: 0x66 (102)*0.8 ≈ 81.6 -> 82 (0x52) => "#525252"
    expect(card.style.getPropertyValue('--team-color-end')).toBe('#525252');
  });
});
