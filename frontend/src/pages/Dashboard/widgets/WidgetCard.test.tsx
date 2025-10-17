import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { vi, describe, it, expect } from 'vitest';
import WidgetCard from './WidgetCard';
import { ThemeColorProvider } from '../../../context/ThemeColorContext';

// Mock Auth0
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: false,
    user: null,
    isLoading: false,
  }),
}));

// Mock useUserProfile
vi.mock('../../../hooks/useUserProfile', () => ({
  useUserProfile: () => ({
    profile: null,
    favoriteConstructor: null,
    favoriteDriver: null,
    loading: false,
  }),
}));

const testTheme = extendTheme({
  colors: {
    brand: {
      red: '#dc2626',
    },
  },
  space: {
    md: '1rem',
  },
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider theme={testTheme}>
      <ThemeColorProvider>
        {ui}
      </ThemeColorProvider>
    </ChakraProvider>
  );
};

describe('WidgetCard', () => {
  it('renders children correctly', () => {
    renderWithProviders(
      <WidgetCard>
        <div data-testid="test-content">Test Content</div>
      </WidgetCard>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders multiple children', () => {
    renderWithProviders(
      <WidgetCard>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <span data-testid="child-3">Child 3</span>
      </WidgetCard>
    );

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
    expect(screen.getByTestId('child-3')).toBeInTheDocument();
  });

  it('renders complex nested content', () => {
    renderWithProviders(
      <WidgetCard>
        <div>
          <h2>Widget Title</h2>
          <p>Widget description</p>
          <div>
            <span>Nested content</span>
          </div>
        </div>
      </WidgetCard>
    );

    expect(screen.getByText('Widget Title')).toBeInTheDocument();
    expect(screen.getByText('Widget description')).toBeInTheDocument();
    expect(screen.getByText('Nested content')).toBeInTheDocument();
  });

  it('renders with correct structure and styling', () => {
    const { container } = renderWithProviders(
      <WidgetCard>
        <div>Test</div>
      </WidgetCard>
    );

    // Check for the main widget card container
    const widgetCard = container.firstChild as HTMLElement;
    expect(widgetCard).toBeInTheDocument();
    
    // Should have flex column layout
    expect(widgetCard).toHaveStyle({
      display: 'flex',
      'flex-direction': 'column',
    });
  });

  it('handles empty children gracefully', () => {
    renderWithProviders(<WidgetCard></WidgetCard>);

    // Should not crash with empty children
    expect(document.body).toBeInTheDocument();
  });

  it('handles null and undefined children', () => {
    renderWithProviders(
      <WidgetCard>
        {null}
        <div data-testid="valid-child">Valid Child</div>
        {undefined}
      </WidgetCard>
    );

    expect(screen.getByTestId('valid-child')).toBeInTheDocument();
  });

  it('renders with proper accessibility structure', () => {
    renderWithProviders(
      <WidgetCard>
        <div role="main">Main content</div>
        <button>Action button</button>
      </WidgetCard>
    );

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('maintains flex column layout for proper content stacking', () => {
    const { container } = renderWithProviders(
      <WidgetCard>
        <div style={{ height: '50px' }}>Top content</div>
        <div style={{ height: '50px' }}>Middle content</div>
        <div style={{ height: '50px' }}>Bottom content</div>
      </WidgetCard>
    );

    const widgetCard = container.firstChild as HTMLElement;
    expect(widgetCard).toHaveStyle({
      display: 'flex',
      'flex-direction': 'column',
    });
  });

  it('renders without crashing with various React element types', () => {
    expect(() => {
      renderWithProviders(
        <WidgetCard>
          <h1>Heading</h1>
          <p>Paragraph</p>
          <div>Div</div>
          <span>Span</span>
          <button>Button</button>
          <input type="text" placeholder="Input" />
        </WidgetCard>
      );
    }).not.toThrow();

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Paragraph')).toBeInTheDocument();
    expect(screen.getByText('Div')).toBeInTheDocument();
    expect(screen.getByText('Span')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
