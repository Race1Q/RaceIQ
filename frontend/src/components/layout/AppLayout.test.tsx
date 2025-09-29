import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import AppLayout from './AppLayout';

// Mock Sidebar component
vi.mock('./Sidebar', () => ({
  default: ({ onWidthChange }: { onWidthChange?: (width: number) => void }) => {
    // Simulate width change on mount
    React.useEffect(() => {
      onWidthChange?.(80);
    }, [onWidthChange]);
    
    return <div data-testid="sidebar">Sidebar Component</div>;
  },
}));

function renderWithChakra(ui: React.ReactNode) {
  return render(
    <ChakraProvider>
      {ui}
    </ChakraProvider>
  );
}

describe('AppLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWithChakra(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders children correctly', () => {
    const testContent = 'Layout Test Content';
    renderWithChakra(
      <AppLayout>
        <div>{testContent}</div>
      </AppLayout>
    );
    
    expect(screen.getByText(testContent)).toBeInTheDocument();
  });

  it('renders Sidebar component', () => {
    renderWithChakra(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );
    
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('has correct container structure', () => {
    const { container } = renderWithChakra(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );
    
    // Check main container exists
    const mainContainer = container.firstChild;
    expect(mainContainer).toBeInTheDocument();
  });

  it('applies correct height to container', () => {
    const { container } = renderWithChakra(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );
    
    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveStyle('height: 100vh');
  });

  it('handles multiple children', () => {
    renderWithChakra(
      <AppLayout>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </AppLayout>
    );
    
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
    expect(screen.getByText('Child 3')).toBeInTheDocument();
  });

  it('handles empty children', () => {
    renderWithChakra(<AppLayout>{null}</AppLayout>);
    
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('handles undefined children', () => {
    renderWithChakra(<AppLayout>{undefined}</AppLayout>);
    
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('handles complex children structure', () => {
    renderWithChakra(
      <AppLayout>
        <div>
          <h1>Title</h1>
          <p>Description</p>
          <button>Action</button>
        </div>
      </AppLayout>
    );
    
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('maintains proper component structure', () => {
    renderWithChakra(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );
    
    // Check that sidebar and content area exist
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders consistently across multiple renders', () => {
    const { rerender } = renderWithChakra(
      <AppLayout>
        <div>Initial Content</div>
      </AppLayout>
    );
    
    expect(screen.getByText('Initial Content')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    
    rerender(
      <AppLayout>
        <div>Updated Content</div>
      </AppLayout>
    );
    
    expect(screen.getByText('Updated Content')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('handles component unmounting gracefully', () => {
    const { unmount } = renderWithChakra(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    
    unmount();
    
    expect(screen.queryByText('Test Content')).not.toBeInTheDocument();
  });

  it('handles React elements as children', () => {
    const TestComponent = () => <div>React Component</div>;
    
    renderWithChakra(
      <AppLayout>
        <TestComponent />
      </AppLayout>
    );
    
    expect(screen.getByText('React Component')).toBeInTheDocument();
  });

  it('handles string children', () => {
    renderWithChakra(
      <AppLayout>
        String Content
      </AppLayout>
    );
    
    expect(screen.getByText('String Content')).toBeInTheDocument();
  });

  it('handles number children', () => {
    renderWithChakra(
      <AppLayout>
        {42}
      </AppLayout>
    );
    
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('handles boolean children', () => {
    renderWithChakra(
      <AppLayout>
        {true && <div>Conditional Content</div>}
      </AppLayout>
    );
    
    expect(screen.getByText('Conditional Content')).toBeInTheDocument();
  });

  it('handles array of children', () => {
    renderWithChakra(
      <AppLayout>
        {[
          <div key="1">Item 1</div>,
          <div key="2">Item 2</div>,
          <div key="3">Item 3</div>
        ]}
      </AppLayout>
    );
    
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });
});
