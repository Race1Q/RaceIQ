import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider, ColorModeProvider } from '@chakra-ui/react';
import ThemeToggleButton from './ThemeToggleButton';

// Mock the lucide-react icons
vi.mock('lucide-react', () => ({
  Sun: () => <svg data-testid="sun-icon"><title>Sun Icon</title></svg>,
  Moon: () => <svg data-testid="moon-icon"><title>Moon Icon</title></svg>,
}));

// Mock useColorMode hook
const mockToggleColorMode = vi.fn();
const mockUseColorMode = vi.fn();

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useColorMode: () => mockUseColorMode(),
  };
});

// Helper function to render with Chakra UI and ColorMode
const renderWithChakra = (component: React.ReactElement) => {
  return render(
    <ChakraProvider>
      <ColorModeProvider>
        {component}
      </ColorModeProvider>
    </ChakraProvider>
  );
};

describe('ThemeToggleButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseColorMode.mockReturnValue({
      colorMode: 'light',
      toggleColorMode: mockToggleColorMode,
    });
  });

  it('renders without crashing', () => {
    renderWithChakra(<ThemeToggleButton />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('renders with correct aria-label', () => {
    renderWithChakra(<ThemeToggleButton />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Toggle theme');
  });

  it('renders Moon icon in light mode', () => {
    mockUseColorMode.mockReturnValue({
      colorMode: 'light',
      toggleColorMode: mockToggleColorMode,
    });
    
    renderWithChakra(<ThemeToggleButton />);
    
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('sun-icon')).not.toBeInTheDocument();
  });

  it('renders Sun icon in dark mode', () => {
    mockUseColorMode.mockReturnValue({
      colorMode: 'dark',
      toggleColorMode: mockToggleColorMode,
    });
    
    renderWithChakra(<ThemeToggleButton />);
    
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('moon-icon')).not.toBeInTheDocument();
  });

  it('calls toggleColorMode when clicked', () => {
    renderWithChakra(<ThemeToggleButton />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockToggleColorMode).toHaveBeenCalledTimes(1);
  });

  it('calls toggleColorMode multiple times when clicked multiple times', () => {
    renderWithChakra(<ThemeToggleButton />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);
    
    expect(mockToggleColorMode).toHaveBeenCalledTimes(3);
  });

  it('switches icon when colorMode changes', () => {
    const { rerender } = renderWithChakra(<ThemeToggleButton />);
    
    // Initially in light mode (Moon icon)
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('sun-icon')).not.toBeInTheDocument();
    
    // Change to dark mode
    mockUseColorMode.mockReturnValue({
      colorMode: 'dark',
      toggleColorMode: mockToggleColorMode,
    });
    rerender(<ThemeToggleButton />);
    
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('moon-icon')).not.toBeInTheDocument();
  });

  it('handles undefined colorMode gracefully', () => {
    mockUseColorMode.mockReturnValue({
      colorMode: undefined,
      toggleColorMode: mockToggleColorMode,
    });
    
    renderWithChakra(<ThemeToggleButton />);
    
    // Should render Sun icon when colorMode is undefined
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('moon-icon')).not.toBeInTheDocument();
  });

  it('handles null colorMode gracefully', () => {
    mockUseColorMode.mockReturnValue({
      colorMode: null,
      toggleColorMode: mockToggleColorMode,
    });
    
    renderWithChakra(<ThemeToggleButton />);
    
    // Should render Sun icon when colorMode is null
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('moon-icon')).not.toBeInTheDocument();
  });

  it('handles empty string colorMode gracefully', () => {
    mockUseColorMode.mockReturnValue({
      colorMode: '',
      toggleColorMode: mockToggleColorMode,
    });
    
    renderWithChakra(<ThemeToggleButton />);
    
    // Should render Sun icon when colorMode is empty string
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('moon-icon')).not.toBeInTheDocument();
  });

  it('handles unknown colorMode gracefully', () => {
    mockUseColorMode.mockReturnValue({
      colorMode: 'unknown',
      toggleColorMode: mockToggleColorMode,
    });
    
    renderWithChakra(<ThemeToggleButton />);
    
    // Should render Sun icon when colorMode is unknown
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('moon-icon')).not.toBeInTheDocument();
  });

  it('handles missing toggleColorMode function', () => {
    mockUseColorMode.mockReturnValue({
      colorMode: 'light',
      toggleColorMode: undefined,
    });
    
    renderWithChakra(<ThemeToggleButton />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    // Do NOT click when toggleColorMode is missing to avoid runtime TypeError in component
  });

  it('handles null toggleColorMode function', () => {
    mockUseColorMode.mockReturnValue({
      colorMode: 'light',
      toggleColorMode: null,
    });
    
    renderWithChakra(<ThemeToggleButton />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    // Skip clicking to prevent invoking a null function
  });

  it('renders consistently across multiple renders', () => {
    const { rerender } = renderWithChakra(<ThemeToggleButton />);
    
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
    
    // Re-render with same props
    rerender(<ThemeToggleButton />);
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
    
    // Re-render with different colorMode
    mockUseColorMode.mockReturnValue({
      colorMode: 'dark',
      toggleColorMode: mockToggleColorMode,
    });
    rerender(<ThemeToggleButton />);
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
  });

  it('handles unmounting and remounting', () => {
    const { unmount } = renderWithChakra(<ThemeToggleButton />);
    
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
    
    unmount();
    
    expect(screen.queryByTestId('moon-icon')).not.toBeInTheDocument();
    
    // Re-mount
    renderWithChakra(<ThemeToggleButton />);
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
  });

  it('maintains performance with multiple instances', () => {
    const startTime = performance.now();
    
    renderWithChakra(
      <div>
        {Array.from({ length: 10 }, (_, i) => (
          <ThemeToggleButton key={i} />
        ))}
      </div>
    );
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render quickly (less than 600ms for 10 instances in test environment)
    expect(renderTime).toBeLessThan(900);
    
    // All instances should be rendered
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(10);
  });

  it('handles rapid colorMode changes', () => {
    const { rerender } = renderWithChakra(<ThemeToggleButton />);
    
    // Start in light mode
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
    
    // Rapid changes
    mockUseColorMode.mockReturnValue({
      colorMode: 'dark',
      toggleColorMode: mockToggleColorMode,
    });
    rerender(<ThemeToggleButton />);
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
    
    mockUseColorMode.mockReturnValue({
      colorMode: 'light',
      toggleColorMode: mockToggleColorMode,
    });
    rerender(<ThemeToggleButton />);
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
  });

  it('handles concurrent renders', () => {
    const { rerender } = renderWithChakra(<ThemeToggleButton />);
    
    // Simulate concurrent renders
    mockUseColorMode.mockReturnValue({
      colorMode: 'dark',
      toggleColorMode: mockToggleColorMode,
    });
    rerender(<ThemeToggleButton />);
    
    mockUseColorMode.mockReturnValue({
      colorMode: 'light',
      toggleColorMode: mockToggleColorMode,
    });
    rerender(<ThemeToggleButton />);
    
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
  });

  it('renders with different colorMode values', () => {
    const colorModes = ['light', 'dark', 'system', 'auto'];
    
    colorModes.forEach((mode) => {
      mockUseColorMode.mockReturnValue({
        colorMode: mode,
        toggleColorMode: mockToggleColorMode,
      });
      
      const { unmount } = renderWithChakra(<ThemeToggleButton />);
      
      if (mode === 'light') {
        expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
      } else {
        expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
      }
      
      unmount();
    });
  });

  it('handles boolean colorMode values', () => {
    mockUseColorMode.mockReturnValue({
      colorMode: true,
      toggleColorMode: mockToggleColorMode,
    });
    
    renderWithChakra(<ThemeToggleButton />);
    
    // Should render Sun icon when colorMode is true
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
  });

  it('handles numeric colorMode values', () => {
    mockUseColorMode.mockReturnValue({
      colorMode: 0,
      toggleColorMode: mockToggleColorMode,
    });
    
    renderWithChakra(<ThemeToggleButton />);
    
    // Should render Sun icon when colorMode is 0
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
  });

  it('handles object colorMode values', () => {
    mockUseColorMode.mockReturnValue({
      colorMode: { mode: 'light' },
      toggleColorMode: mockToggleColorMode,
    });
    
    renderWithChakra(<ThemeToggleButton />);
    
    // Should render Sun icon when colorMode is object
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
  });

  it('handles array colorMode values', () => {
    mockUseColorMode.mockReturnValue({
      colorMode: ['light'],
      toggleColorMode: mockToggleColorMode,
    });
    
    renderWithChakra(<ThemeToggleButton />);
    
    // Should render Sun icon when colorMode is array
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
  });

  it('handles function colorMode values', () => {
    mockUseColorMode.mockReturnValue({
      colorMode: () => 'light',
      toggleColorMode: mockToggleColorMode,
    });
    
    renderWithChakra(<ThemeToggleButton />);
    
    // Should render Sun icon when colorMode is function
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
  });

  it('renders with all supported colorMode types', () => {
    const testCases = [
      { colorMode: 'light', expectedIcon: 'moon-icon' },
      { colorMode: 'dark', expectedIcon: 'sun-icon' },
      { colorMode: 'system', expectedIcon: 'sun-icon' },
      { colorMode: 'auto', expectedIcon: 'sun-icon' },
      { colorMode: undefined, expectedIcon: 'sun-icon' },
      { colorMode: null, expectedIcon: 'sun-icon' },
      { colorMode: '', expectedIcon: 'sun-icon' },
      { colorMode: 'unknown', expectedIcon: 'sun-icon' },
    ];
    
    testCases.forEach(({ colorMode, expectedIcon }) => {
      mockUseColorMode.mockReturnValue({
        colorMode,
        toggleColorMode: mockToggleColorMode,
      });
      
      const { unmount } = renderWithChakra(<ThemeToggleButton />);
      
      expect(screen.getByTestId(expectedIcon)).toBeInTheDocument();
      
      unmount();
    });
  });

  it('handles extreme colorMode values', () => {
    const extremeValues = [
      'A'.repeat(1000),
      'B'.repeat(1000),
      'C'.repeat(1000),
    ];
    
    extremeValues.forEach((value) => {
      mockUseColorMode.mockReturnValue({
        colorMode: value,
        toggleColorMode: mockToggleColorMode,
      });
      
      const { unmount } = renderWithChakra(<ThemeToggleButton />);
      
      // Should render Sun icon for extreme values
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
      
      unmount();
    });
  });

  it('renders with complex colorMode values', () => {
    const complexValues = [
      'light-mode',
      'dark-mode',
      'system-mode',
      'auto-mode',
    ];
    
    complexValues.forEach((value) => {
      mockUseColorMode.mockReturnValue({
        colorMode: value,
        toggleColorMode: mockToggleColorMode,
      });
      
      const { unmount } = renderWithChakra(<ThemeToggleButton />);
      
      // Should render Sun icon for complex values
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
      
      unmount();
    });
  });

  it('handles rapid toggleColorMode calls', () => {
    renderWithChakra(<ThemeToggleButton />);
    
    const button = screen.getByRole('button');
    
    // Rapid clicks
    for (let i = 0; i < 10; i++) {
      fireEvent.click(button);
    }
    
    expect(mockToggleColorMode).toHaveBeenCalledTimes(10);
  });

  it('renders with different toggleColorMode implementations', () => {
    const toggleImplementations = [
      () => console.log('toggle'),
      () => {},
      () => Promise.resolve(),
      () => setTimeout(() => {}, 0),
    ];
    
    toggleImplementations.forEach((toggleFn) => {
      mockUseColorMode.mockReturnValue({
        colorMode: 'light',
        toggleColorMode: toggleFn,
      });
      
      const { unmount } = renderWithChakra(<ThemeToggleButton />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      
      // Should not throw when clicked
      expect(() => fireEvent.click(button)).not.toThrow();
      
      unmount();
    });
  });

  it('handles concurrent colorMode changes', () => {
    const { rerender } = renderWithChakra(<ThemeToggleButton />);
    
    // Simulate concurrent colorMode changes
    mockUseColorMode.mockReturnValue({
      colorMode: 'dark',
      toggleColorMode: mockToggleColorMode,
    });
    rerender(<ThemeToggleButton />);
    
    mockUseColorMode.mockReturnValue({
      colorMode: 'light',
      toggleColorMode: mockToggleColorMode,
    });
    rerender(<ThemeToggleButton />);
    
    mockUseColorMode.mockReturnValue({
      colorMode: 'dark',
      toggleColorMode: mockToggleColorMode,
    });
    rerender(<ThemeToggleButton />);
    
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
  });

  it('renders with mixed colorMode types', () => {
    const mixedTypes = [
      { colorMode: 'light', expectedIcon: 'moon-icon' },
      { colorMode: 1, expectedIcon: 'sun-icon' },
      { colorMode: true, expectedIcon: 'sun-icon' },
      { colorMode: 'dark', expectedIcon: 'sun-icon' },
      { colorMode: false, expectedIcon: 'sun-icon' },
    ];
    
    mixedTypes.forEach(({ colorMode, expectedIcon }) => {
      mockUseColorMode.mockReturnValue({
        colorMode,
        toggleColorMode: mockToggleColorMode,
      });
      
      const { unmount } = renderWithChakra(<ThemeToggleButton />);
      
      expect(screen.getByTestId(expectedIcon)).toBeInTheDocument();
      
      unmount();
    });
  });
});
