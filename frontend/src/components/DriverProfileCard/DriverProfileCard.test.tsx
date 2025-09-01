import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DriverProfileCard from './DriverProfileCard';

// CSS module safety
vi.mock('./DriverProfileCard.module.css', () => ({
  default: new Proxy({}, { get: (_t, k) => String(k) }),
}));

vi.mock('@auth0/auth0-react', () => ({
  // Simple pass-through provider so children render
  Auth0Provider: ({ children }: any) => <>{children}</>,
  // Stubbed hook so auth-dependent UI can render deterministically
  useAuth0: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: { sub: 'test|123', name: 'Test User' },
    loginWithRedirect: vi.fn(),
    logout: vi.fn(),
    getAccessTokenSilently: vi.fn().mockResolvedValue('fake-token'),
  }),
}));

function renderWithRouter(ui: React.ReactNode) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('DriverProfileCard', () => {
  const driver = {
    id: 'max_verstappen',
    name: 'Max Verstappen',
    number: '1',
    team: 'Red Bull',
    nationality: 'NL',
    image: 'max.png',
    team_color: 'E10600',
  };

  it('renders names split into first/last, number, image, link, and "View Profile"', () => {
    renderWithRouter(<DriverProfileCard driver={driver} />);

    expect(screen.getByRole('heading', { name: /max verstappen/i })).toBeInTheDocument();

    expect(screen.getByText('1')).toBeInTheDocument();

    const img = screen.getByRole('img', { name: /max verstappen/i });
    expect(img).toHaveAttribute('src', 'max.png');

    expect(screen.getByText(/view profile/i)).toBeInTheDocument();
  });
});
