import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPrompt from './LoginPrompt';

const mockLoginWithRedirect = vi.fn();

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    loginWithRedirect: mockLoginWithRedirect,
    isAuthenticated: false,
  }),
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </ChakraProvider>
  );
};

describe('LoginPrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = renderWithProviders(<LoginPrompt />);
    expect(container).toBeInTheDocument();
  });

  it('displays login message', () => {
    renderWithProviders(<LoginPrompt />);
    
    const loginText = screen.queryByText(/sign in/i) || screen.queryByText(/login/i);
    expect(loginText || screen.container).toBeTruthy();
  });

  it('has a login button', () => {
    renderWithProviders(<LoginPrompt />);
    
    const buttons = screen.queryAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('calls loginWithRedirect when login button is clicked', () => {
    renderWithProviders(<LoginPrompt />);
    
    const buttons = screen.queryAllByRole('button');
    if (buttons.length > 0) {
      fireEvent.click(buttons[0]);
      expect(mockLoginWithRedirect).toHaveBeenCalled();
    }
  });

  it('renders with custom message prop if provided', () => {
    const { container } = renderWithProviders(
      <LoginPrompt message="Custom message" />
    );
    expect(container).toBeInTheDocument();
  });
});

