import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RoleProvider, useRole } from './RoleContext';

// Mock supabase client to avoid real network/env dependency in tests
vi.mock('../lib/supabase', () => {
  return {
    supabase: {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
  };
});

// Mock Auth0 so the provider can mount without real auth
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: false,
    isLoading: false,
    user: undefined,
    getAccessTokenSilently: vi.fn(),
  }),
}));

function Probe() {
  const { role, loading } = useRole();
  return <div>role:{String(role)} loading:{String(loading)}</div>;
}

describe('RoleProvider', () => {
  beforeEach(() => {
    // Ensure any env-based code has sane defaults during tests
    (process as any).env.VITE_SUPABASE_URL = (process as any).env.VITE_SUPABASE_URL || 'http://localhost';
    (process as any).env.VITE_SUPABASE_ANON_KEY = (process as any).env.VITE_SUPABASE_ANON_KEY || 'test-key';
  });

  it('renders without crashing and provides defaults', async () => {
    render(
      <RoleProvider>
        <Probe />
      </RoleProvider>
    );
    expect(await screen.findByText(/role:null/i)).toBeInTheDocument();
  });
});
