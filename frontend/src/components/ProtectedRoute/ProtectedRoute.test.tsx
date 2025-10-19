import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useAuth0 } from '@auth0/auth0-react';
import { useRole } from '../../context/RoleContext';

// Mock supabase to prevent initialization errors
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      }))
    }))
  }
}));

// Mock dependencies
vi.mock('@auth0/auth0-react');
vi.mock('../../context/RoleContext');
vi.mock('../loaders/PageLoadingOverlay', () => ({
  default: ({ text }: { text: string }) => <div data-testid="loading-overlay">{text}</div>,
}));

// Mock Navigate component
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate">{to}</div>,
  };
});

describe('ProtectedRoute', () => {
  const mockLoginWithRedirect = vi.fn();
  const mockGetAccessTokenSilently = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderProtectedRoute = (children: React.ReactNode, props = {}) => {
    return render(
      <BrowserRouter>
        <ProtectedRoute {...props}>{children}</ProtectedRoute>
      </BrowserRouter>
    );
  };

  describe('loading states', () => {
    it('should show loading overlay when Auth0 is loading', () => {
      vi.mocked(useAuth0).mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        loginWithRedirect: mockLoginWithRedirect,
        getAccessTokenSilently: mockGetAccessTokenSilently,
      } as any);

      vi.mocked(useRole).mockReturnValue({
        role: null,
        loading: false,
      } as any);

      renderProtectedRoute(<div>Protected Content</div>);

      expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
      expect(screen.getByText('Authenticating')).toBeInTheDocument();
    });

    it('should show loading overlay when role is loading', () => {
      vi.mocked(useAuth0).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        loginWithRedirect: mockLoginWithRedirect,
        getAccessTokenSilently: mockGetAccessTokenSilently,
      } as any);

      vi.mocked(useRole).mockReturnValue({
        role: null,
        loading: true,
      } as any);

      renderProtectedRoute(<div>Protected Content</div>, { requireAdmin: true });

      expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
    });
  });

  describe('unauthenticated user', () => {
    it('should redirect to login when not authenticated', async () => {
      vi.mocked(useAuth0).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        loginWithRedirect: mockLoginWithRedirect,
        getAccessTokenSilently: mockGetAccessTokenSilently,
      } as any);

      vi.mocked(useRole).mockReturnValue({
        role: null,
        loading: false,
      } as any);

      renderProtectedRoute(<div>Protected Content</div>);

      await waitFor(() => {
        expect(mockLoginWithRedirect).toHaveBeenCalled();
      });
    });
  });

  describe('authenticated user without permissions', () => {
    it('should render children when no permissions required', async () => {
      vi.mocked(useAuth0).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        loginWithRedirect: mockLoginWithRedirect,
        getAccessTokenSilently: mockGetAccessTokenSilently,
      } as any);

      vi.mocked(useRole).mockReturnValue({
        role: 'user',
        loading: false,
      } as any);

      renderProtectedRoute(<div>Protected Content</div>);

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });

    it('should navigate to home when permissions are missing', async () => {
      const mockToken = btoa(JSON.stringify({
        permissions: [],
        scope: '',
      }));

      mockGetAccessTokenSilently.mockResolvedValue(`header.${mockToken}.signature`);

      vi.mocked(useAuth0).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        loginWithRedirect: mockLoginWithRedirect,
        getAccessTokenSilently: mockGetAccessTokenSilently,
      } as any);

      vi.mocked(useRole).mockReturnValue({
        role: 'user',
        loading: false,
      } as any);

      renderProtectedRoute(<div>Protected Content</div>, {
        requirePermissions: ['read:admin'],
      });

      await waitFor(() => {
        expect(screen.getByTestId('navigate')).toBeInTheDocument();
        expect(screen.getByText('/')).toBeInTheDocument();
      });
    });
  });

  describe('authenticated user with permissions', () => {
    it('should render children when user has required permissions', async () => {
      const mockToken = btoa(JSON.stringify({
        permissions: ['read:data', 'write:data'],
        scope: '',
      }));

      mockGetAccessTokenSilently.mockResolvedValue(`header.${mockToken}.signature`);

      vi.mocked(useAuth0).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        loginWithRedirect: mockLoginWithRedirect,
        getAccessTokenSilently: mockGetAccessTokenSilently,
      } as any);

      vi.mocked(useRole).mockReturnValue({
        role: 'user',
        loading: false,
      } as any);

      renderProtectedRoute(<div>Protected Content</div>, {
        requirePermissions: ['read:data'],
      });

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });

    it('should check permissions from scope field', async () => {
      const mockToken = btoa(JSON.stringify({
        permissions: [],
        scope: 'read:data write:data',
      }));

      mockGetAccessTokenSilently.mockResolvedValue(`header.${mockToken}.signature`);

      vi.mocked(useAuth0).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        loginWithRedirect: mockLoginWithRedirect,
        getAccessTokenSilently: mockGetAccessTokenSilently,
      } as any);

      vi.mocked(useRole).mockReturnValue({
        role: 'user',
        loading: false,
      } as any);

      renderProtectedRoute(<div>Protected Content</div>, {
        requirePermissions: ['read:data'],
      });

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });

    it('should require all specified permissions', async () => {
      const mockToken = btoa(JSON.stringify({
        permissions: ['read:data'],
        scope: '',
      }));

      mockGetAccessTokenSilently.mockResolvedValue(`header.${mockToken}.signature`);

      vi.mocked(useAuth0).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        loginWithRedirect: mockLoginWithRedirect,
        getAccessTokenSilently: mockGetAccessTokenSilently,
      } as any);

      vi.mocked(useRole).mockReturnValue({
        role: 'user',
        loading: false,
      } as any);

      renderProtectedRoute(<div>Protected Content</div>, {
        requirePermissions: ['read:data', 'write:data'],
      });

      await waitFor(() => {
        expect(screen.getByTestId('navigate')).toBeInTheDocument();
      });
    });

    it('should combine permissions from both permissions and scope fields', async () => {
      const mockToken = btoa(JSON.stringify({
        permissions: ['read:data'],
        scope: 'write:data delete:data',
      }));

      mockGetAccessTokenSilently.mockResolvedValue(`header.${mockToken}.signature`);

      vi.mocked(useAuth0).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        loginWithRedirect: mockLoginWithRedirect,
        getAccessTokenSilently: mockGetAccessTokenSilently,
      } as any);

      vi.mocked(useRole).mockReturnValue({
        role: 'user',
        loading: false,
      } as any);

      renderProtectedRoute(<div>Protected Content</div>, {
        requirePermissions: ['read:data', 'write:data'],
      });

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });
  });

  describe('admin role checks', () => {
    it('should render children when user is admin and admin required', async () => {
      vi.mocked(useAuth0).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        loginWithRedirect: mockLoginWithRedirect,
        getAccessTokenSilently: mockGetAccessTokenSilently,
      } as any);

      vi.mocked(useRole).mockReturnValue({
        role: 'admin',
        loading: false,
      } as any);

      renderProtectedRoute(<div>Admin Content</div>, { requireAdmin: true });

      await waitFor(() => {
        expect(screen.getByText('Admin Content')).toBeInTheDocument();
      });
    });

    it('should navigate to home when user is not admin but admin required', async () => {
      vi.mocked(useAuth0).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        loginWithRedirect: mockLoginWithRedirect,
        getAccessTokenSilently: mockGetAccessTokenSilently,
      } as any);

      vi.mocked(useRole).mockReturnValue({
        role: 'user',
        loading: false,
      } as any);

      renderProtectedRoute(<div>Admin Content</div>, { requireAdmin: true });

      await waitFor(() => {
        expect(screen.getByTestId('navigate')).toBeInTheDocument();
        expect(screen.getByText('/')).toBeInTheDocument();
      });
    });

    it('should wait for role to load when admin check is required', () => {
      vi.mocked(useAuth0).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        loginWithRedirect: mockLoginWithRedirect,
        getAccessTokenSilently: mockGetAccessTokenSilently,
      } as any);

      vi.mocked(useRole).mockReturnValue({
        role: null,
        loading: true,
      } as any);

      renderProtectedRoute(<div>Admin Content</div>, { requireAdmin: true });

      expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle empty permissions array', async () => {
      vi.mocked(useAuth0).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        loginWithRedirect: mockLoginWithRedirect,
        getAccessTokenSilently: mockGetAccessTokenSilently,
      } as any);

      vi.mocked(useRole).mockReturnValue({
        role: 'user',
        loading: false,
      } as any);

      renderProtectedRoute(<div>Protected Content</div>, {
        requirePermissions: [],
      });

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });

    it('should handle token with missing permissions field', async () => {
      const mockToken = btoa(JSON.stringify({
        scope: 'read:data',
      }));

      mockGetAccessTokenSilently.mockResolvedValue(`header.${mockToken}.signature`);

      vi.mocked(useAuth0).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        loginWithRedirect: mockLoginWithRedirect,
        getAccessTokenSilently: mockGetAccessTokenSilently,
      } as any);

      vi.mocked(useRole).mockReturnValue({
        role: 'user',
        loading: false,
      } as any);

      renderProtectedRoute(<div>Protected Content</div>, {
        requirePermissions: ['read:data'],
      });

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });

    it('should handle token with missing scope field', async () => {
      const mockToken = btoa(JSON.stringify({
        permissions: ['read:data'],
      }));

      mockGetAccessTokenSilently.mockResolvedValue(`header.${mockToken}.signature`);

      vi.mocked(useAuth0).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        loginWithRedirect: mockLoginWithRedirect,
        getAccessTokenSilently: mockGetAccessTokenSilently,
      } as any);

      vi.mocked(useRole).mockReturnValue({
        role: 'user',
        loading: false,
      } as any);

      renderProtectedRoute(<div>Protected Content</div>, {
        requirePermissions: ['read:data'],
      });

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });

    it('should handle scope with empty strings', async () => {
      const mockToken = btoa(JSON.stringify({
        permissions: [],
        scope: '  read:data   write:data  ',
      }));

      mockGetAccessTokenSilently.mockResolvedValue(`header.${mockToken}.signature`);

      vi.mocked(useAuth0).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        loginWithRedirect: mockLoginWithRedirect,
        getAccessTokenSilently: mockGetAccessTokenSilently,
      } as any);

      vi.mocked(useRole).mockReturnValue({
        role: 'user',
        loading: false,
      } as any);

      renderProtectedRoute(<div>Protected Content</div>, {
        requirePermissions: ['read:data'],
      });

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });
  });
});

