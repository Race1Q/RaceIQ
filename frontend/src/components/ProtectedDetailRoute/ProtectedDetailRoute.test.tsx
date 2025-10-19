import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProtectedDetailRoute from './ProtectedDetailRoute';
import { useAuth0 } from '@auth0/auth0-react';

// Mock dependencies
vi.mock('@auth0/auth0-react');
vi.mock('../LoginPrompt/LoginPrompt', () => ({
  default: ({ title, message }: { title?: string; message?: string }) => (
    <div data-testid="login-prompt">
      {title && <div data-testid="login-title">{title}</div>}
      {message && <div data-testid="login-message">{message}</div>}
    </div>
  ),
}));

describe('ProtectedDetailRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderProtectedDetailRoute = (
    children: React.ReactNode,
    props?: { title?: string; message?: string }
  ) => {
    return render(
      <BrowserRouter>
        <ProtectedDetailRoute {...props}>{children}</ProtectedDetailRoute>
      </BrowserRouter>
    );
  };

  describe('loading state', () => {
    it('should return null when Auth0 is loading', () => {
      vi.mocked(useAuth0).mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
      } as any);

      const { container } = renderProtectedDetailRoute(<div>Protected Content</div>);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('unauthenticated user', () => {
    it('should show LoginPrompt when user is not authenticated', () => {
      vi.mocked(useAuth0).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
      } as any);

      renderProtectedDetailRoute(<div>Protected Content</div>);

      expect(screen.getByTestId('login-prompt')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should pass custom title to LoginPrompt', () => {
      vi.mocked(useAuth0).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
      } as any);

      renderProtectedDetailRoute(<div>Protected Content</div>, {
        title: 'Access Required',
      });

      expect(screen.getByTestId('login-prompt')).toBeInTheDocument();
      expect(screen.getByTestId('login-title')).toHaveTextContent('Access Required');
    });

    it('should pass custom message to LoginPrompt', () => {
      vi.mocked(useAuth0).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
      } as any);

      renderProtectedDetailRoute(<div>Protected Content</div>, {
        message: 'Please log in to view this content',
      });

      expect(screen.getByTestId('login-prompt')).toBeInTheDocument();
      expect(screen.getByTestId('login-message')).toHaveTextContent(
        'Please log in to view this content'
      );
    });

    it('should pass both title and message to LoginPrompt', () => {
      vi.mocked(useAuth0).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
      } as any);

      renderProtectedDetailRoute(<div>Protected Content</div>, {
        title: 'Login Required',
        message: 'This page requires authentication',
      });

      expect(screen.getByTestId('login-prompt')).toBeInTheDocument();
      expect(screen.getByTestId('login-title')).toHaveTextContent('Login Required');
      expect(screen.getByTestId('login-message')).toHaveTextContent(
        'This page requires authentication'
      );
    });

    it('should show LoginPrompt without title and message when not provided', () => {
      vi.mocked(useAuth0).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
      } as any);

      renderProtectedDetailRoute(<div>Protected Content</div>);

      expect(screen.getByTestId('login-prompt')).toBeInTheDocument();
      expect(screen.queryByTestId('login-title')).not.toBeInTheDocument();
      expect(screen.queryByTestId('login-message')).not.toBeInTheDocument();
    });
  });

  describe('authenticated user', () => {
    it('should render children when user is authenticated', () => {
      vi.mocked(useAuth0).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      } as any);

      renderProtectedDetailRoute(<div>Protected Content</div>);

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(screen.queryByTestId('login-prompt')).not.toBeInTheDocument();
    });

    it('should render children regardless of title and message props when authenticated', () => {
      vi.mocked(useAuth0).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      } as any);

      renderProtectedDetailRoute(<div>Protected Content</div>, {
        title: 'Login Required',
        message: 'This should not show',
      });

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(screen.queryByTestId('login-prompt')).not.toBeInTheDocument();
    });

    it('should render complex children when authenticated', () => {
      vi.mocked(useAuth0).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      } as any);

      renderProtectedDetailRoute(
        <div>
          <h1>Page Title</h1>
          <p>Page Content</p>
          <button>Action Button</button>
        </div>
      );

      expect(screen.getByText('Page Title')).toBeInTheDocument();
      expect(screen.getByText('Page Content')).toBeInTheDocument();
      expect(screen.getByText('Action Button')).toBeInTheDocument();
    });
  });

  describe('state transitions', () => {
    it('should handle transition from loading to authenticated', () => {
      // Initial loading state
      vi.mocked(useAuth0).mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
      } as any);

      const { rerender } = render(
        <BrowserRouter>
          <ProtectedDetailRoute>
            <div>Protected Content</div>
          </ProtectedDetailRoute>
        </BrowserRouter>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();

      // Authenticated state
      vi.mocked(useAuth0).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      } as any);
      
      rerender(
        <BrowserRouter>
          <ProtectedDetailRoute>
            <div>Protected Content</div>
          </ProtectedDetailRoute>
        </BrowserRouter>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should handle transition from loading to unauthenticated', () => {
      // Initial loading state
      vi.mocked(useAuth0).mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
      } as any);

      const { rerender } = render(
        <BrowserRouter>
          <ProtectedDetailRoute title="Login Required">
            <div>Protected Content</div>
          </ProtectedDetailRoute>
        </BrowserRouter>
      );

      expect(screen.queryByTestId('login-prompt')).not.toBeInTheDocument();

      // Unauthenticated state
      vi.mocked(useAuth0).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
      } as any);
      
      rerender(
        <BrowserRouter>
          <ProtectedDetailRoute title="Login Required">
            <div>Protected Content</div>
          </ProtectedDetailRoute>
        </BrowserRouter>
      );

      expect(screen.getByTestId('login-prompt')).toBeInTheDocument();
      expect(screen.getByTestId('login-title')).toHaveTextContent('Login Required');
    });
  });

  describe('edge cases', () => {
    it('should handle empty children when authenticated', () => {
      vi.mocked(useAuth0).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      } as any);

      const { container } = renderProtectedDetailRoute(<></>);

      expect(container).toBeTruthy();
    });

    it('should handle null children when authenticated', () => {
      vi.mocked(useAuth0).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      } as any);

      const { container } = renderProtectedDetailRoute(null as any);

      expect(container).toBeTruthy();
    });

    it('should handle empty string title', () => {
      vi.mocked(useAuth0).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
      } as any);

      renderProtectedDetailRoute(<div>Protected Content</div>, {
        title: '',
      });

      expect(screen.getByTestId('login-prompt')).toBeInTheDocument();
    });

    it('should handle empty string message', () => {
      vi.mocked(useAuth0).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
      } as any);

      renderProtectedDetailRoute(<div>Protected Content</div>, {
        message: '',
      });

      expect(screen.getByTestId('login-prompt')).toBeInTheDocument();
    });
  });
});

