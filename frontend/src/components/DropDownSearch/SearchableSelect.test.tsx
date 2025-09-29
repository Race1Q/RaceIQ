import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ChakraProvider } from '@chakra-ui/react';
import SearchableSelect, { type SelectOption } from './SearchableSelect';

// Mock chakra-react-select
vi.mock('chakra-react-select', () => ({
  Select: ({ options, value, onChange, placeholder, isClearable, isLoading, isDisabled, chakraStyles, focusBorderColor, ...props }: any) => {
    const [selectedValue, setSelectedValue] = React.useState(value);
    
    const handleChange = (newValue: any) => {
      setSelectedValue(newValue);
      onChange?.(newValue);
    };

    const handleClear = () => {
      setSelectedValue(null);
      onChange?.(null);
    };

    return (
      <div data-testid="searchable-select" {...props}>
        <div data-testid="select-placeholder">{placeholder}</div>
        {isLoading && <div data-testid="select-loading">Loading...</div>}
        {selectedValue && (
          <div data-testid="selected-value">
            {selectedValue.label || selectedValue}
          </div>
        )}
        {isClearable && selectedValue && (
          <button data-testid="clear-button" onClick={handleClear}>
            Clear
          </button>
        )}
        <div data-testid="select-options">
          {options?.map((option: SelectOption) => (
            <div
              key={option.value}
              data-testid={`option-${option.value}`}
              onClick={() => handleChange(option)}
              style={{ 
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: isDisabled ? 0.5 : 1
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
        <div data-testid="select-disabled" style={{ display: isDisabled ? 'block' : 'none' }}>
          Disabled
        </div>
        <div data-testid="focus-border-color">{focusBorderColor}</div>
      </div>
    );
  },
}));

// Mock Chakra UI components
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    FormControl: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="form-control">{children}</div>
    ),
    FormLabel: ({ children, color }: { children: React.ReactNode; color?: string }) => (
      <label data-testid="form-label" style={{ color }}>{children}</label>
    ),
  };
});

// Helper function to render with Chakra UI
function renderWithProviders(ui: React.ReactNode) {
  return render(
    <ChakraProvider>
      {ui}
    </ChakraProvider>
  );
}

describe('SearchableSelect Component', () => {
  const mockOptions: SelectOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  const defaultProps = {
    label: 'Test Label',
    options: mockOptions,
    value: null,
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders without crashing', () => {
    renderWithProviders(<SearchableSelect {...defaultProps} />);
    
    expect(screen.getByTestId('form-control')).toBeInTheDocument();
    expect(screen.getByTestId('searchable-select')).toBeInTheDocument();
  });

  it('renders label correctly', () => {
    renderWithProviders(<SearchableSelect {...defaultProps} />);
    
    const label = screen.getByTestId('form-label');
    expect(label).toBeInTheDocument();
    expect(label).toHaveTextContent('Test Label');
    expect(label.tagName).toBe('LABEL');
  });

  it('renders placeholder correctly', () => {
    renderWithProviders(<SearchableSelect {...defaultProps} />);
    
    expect(screen.getByTestId('select-placeholder')).toHaveTextContent('Search and select...');
  });

  it('renders custom placeholder when provided', () => {
    renderWithProviders(
      <SearchableSelect {...defaultProps} placeholder="Choose an option..." />
    );
    
    expect(screen.getByTestId('select-placeholder')).toHaveTextContent('Choose an option...');
  });

  it('renders all options correctly', () => {
    renderWithProviders(<SearchableSelect {...defaultProps} />);
    
    mockOptions.forEach((option) => {
      expect(screen.getByTestId(`option-${option.value}`)).toBeInTheDocument();
      expect(screen.getByTestId(`option-${option.value}`)).toHaveTextContent(option.label);
    });
  });

  it('handles option selection', async () => {
    const mockOnChange = vi.fn();
    renderWithProviders(
      <SearchableSelect {...defaultProps} onChange={mockOnChange} />
    );
    
    const option1 = screen.getByTestId('option-option1');
    fireEvent.click(option1);
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(mockOptions[0]);
    });
  });

  it('displays selected value correctly', () => {
    const selectedValue = mockOptions[0];
    renderWithProviders(
      <SearchableSelect {...defaultProps} value={selectedValue} />
    );
    
    expect(screen.getByTestId('selected-value')).toHaveTextContent(selectedValue.label);
  });

  it('shows loading state correctly', () => {
    renderWithProviders(<SearchableSelect {...defaultProps} isLoading={true} />);
    
    expect(screen.getByTestId('select-loading')).toBeInTheDocument();
    expect(screen.getByTestId('select-loading')).toHaveTextContent('Loading...');
  });

  it('shows disabled state correctly', () => {
    renderWithProviders(<SearchableSelect {...defaultProps} isDisabled={true} />);
    
    expect(screen.getByTestId('select-disabled')).toBeVisible();
    
    // Check that options are disabled
    mockOptions.forEach((option) => {
      const optionElement = screen.getByTestId(`option-${option.value}`);
      expect(optionElement).toHaveStyle({ cursor: 'not-allowed', opacity: 0.5 });
    });
  });

  it('disables select when loading', () => {
    renderWithProviders(<SearchableSelect {...defaultProps} isLoading={true} />);
    
    expect(screen.getByTestId('select-disabled')).toBeVisible();
  });

  it('shows clear button when clearable and value is selected', () => {
    const selectedValue = mockOptions[0];
    renderWithProviders(
      <SearchableSelect {...defaultProps} value={selectedValue} isClearable={true} />
    );
    
    expect(screen.getByTestId('clear-button')).toBeInTheDocument();
  });

  it('does not show clear button when not clearable', () => {
    const selectedValue = mockOptions[0];
    renderWithProviders(
      <SearchableSelect {...defaultProps} value={selectedValue} isClearable={false} />
    );
    
    expect(screen.queryByTestId('clear-button')).not.toBeInTheDocument();
  });

  it('handles clear functionality', async () => {
    const mockOnChange = vi.fn();
    const selectedValue = mockOptions[0];
    renderWithProviders(
      <SearchableSelect 
        {...defaultProps} 
        value={selectedValue} 
        onChange={mockOnChange}
        isClearable={true}
      />
    );
    
    const clearButton = screen.getByTestId('clear-button');
    fireEvent.click(clearButton);
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(null);
    });
  });

  it('applies custom focus border color', () => {
    renderWithProviders(<SearchableSelect {...defaultProps} />);
    
    expect(screen.getByTestId('focus-border-color')).toHaveTextContent('brand.red');
  });

  it('passes through additional props', () => {
    renderWithProviders(
      <SearchableSelect {...defaultProps} data-testid="custom-test-id" />
    );
    
    // The custom test id should be applied to the select component
    expect(screen.getByTestId('custom-test-id')).toBeInTheDocument();
  });
});

describe('SearchableSelect Edge Cases', () => {
  it('handles empty options array', () => {
    renderWithProviders(
      <SearchableSelect 
        label="Test Label" 
        options={[]} 
        value={null} 
        onChange={vi.fn()} 
      />
    );
    
    expect(screen.getByTestId('searchable-select')).toBeInTheDocument();
    expect(screen.getByTestId('select-options')).toBeInTheDocument();
  });

  it('handles undefined options', () => {
    renderWithProviders(
      <SearchableSelect 
        label="Test Label" 
        options={undefined} 
        value={null} 
        onChange={vi.fn()} 
      />
    );
    
    expect(screen.getByTestId('searchable-select')).toBeInTheDocument();
  });

  it('handles options with numeric values', () => {
    const numericOptions: SelectOption[] = [
      { value: 1, label: 'Option 1' },
      { value: 2, label: 'Option 2' },
    ];
    
    renderWithProviders(
      <SearchableSelect 
        label="Test Label" 
        options={numericOptions} 
        value={null} 
        onChange={vi.fn()} 
      />
    );
    
    expect(screen.getByTestId('option-1')).toBeInTheDocument();
    expect(screen.getByTestId('option-2')).toBeInTheDocument();
  });

  it('handles long option labels', () => {
    const longOptions: SelectOption[] = [
      { value: 'long', label: 'This is a very long option label that might wrap to multiple lines' },
    ];
    
    renderWithProviders(
      <SearchableSelect 
        label="Test Label" 
        options={longOptions} 
        value={null} 
        onChange={vi.fn()} 
      />
    );
    
    expect(screen.getByTestId('option-long')).toBeInTheDocument();
    expect(screen.getByTestId('option-long')).toHaveTextContent('This is a very long option label that might wrap to multiple lines');
  });

  it('handles special characters in option labels', () => {
    const specialOptions: SelectOption[] = [
      { value: 'special', label: 'Option with special chars: !@#$%^&*()' },
      { value: 'unicode', label: 'Unicode: 中文, 日本語, 한국어' },
    ];
    
    renderWithProviders(
      <SearchableSelect 
        label="Test Label" 
        options={specialOptions} 
        value={null} 
        onChange={vi.fn()} 
      />
    );
    
    expect(screen.getByTestId('option-special')).toBeInTheDocument();
    expect(screen.getByTestId('option-unicode')).toBeInTheDocument();
  });

  it('handles empty label', () => {
    renderWithProviders(
      <SearchableSelect 
        label="" 
        options={[]} 
        value={null} 
        onChange={vi.fn()} 
      />
    );
    
    const label = screen.getByTestId('form-label');
    expect(label).toBeInTheDocument();
    expect(label).toHaveTextContent('');
  });
});

describe('SearchableSelect Integration Tests', () => {
  it('works correctly with Chakra UI theme', () => {
    renderWithProviders(
      <SearchableSelect 
        label="Test Label" 
        options={[]} 
        value={null} 
        onChange={vi.fn()} 
      />
    );
    
    expect(screen.getByTestId('form-control')).toBeInTheDocument();
    expect(screen.getByTestId('searchable-select')).toBeInTheDocument();
  });

  it('maintains accessibility with proper form structure', () => {
    renderWithProviders(
      <SearchableSelect 
        label="Test Label" 
        options={[]} 
        value={null} 
        onChange={vi.fn()} 
      />
    );
    
    const label = screen.getByTestId('form-label');
    expect(label).toBeInTheDocument();
    expect(label.tagName).toBe('LABEL');
  });

  it('handles multiple rapid selections', async () => {
    const mockOnChange = vi.fn();
    const options: SelectOption[] = [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2' },
      { value: '3', label: 'Option 3' },
    ];
    
    renderWithProviders(
      <SearchableSelect 
        label="Test Label" 
        options={options} 
        value={null} 
        onChange={mockOnChange} 
      />
    );
    
    // Click multiple options rapidly
    fireEvent.click(screen.getByTestId('option-1'));
    fireEvent.click(screen.getByTestId('option-2'));
    fireEvent.click(screen.getByTestId('option-3'));
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledTimes(3);
    });
  });

  it('renders multiple instances correctly', () => {
    const options: SelectOption[] = [{ value: 'test', label: 'Test Option' }];
    
    const { unmount: unmount1 } = renderWithProviders(
      <SearchableSelect 
        label="First Select" 
        options={options} 
        value={null} 
        onChange={vi.fn()} 
      />
    );
    
    expect(screen.getByTestId('searchable-select')).toBeInTheDocument();
    expect(screen.getByText('First Select')).toBeInTheDocument();
    
    unmount1();
    
    const { unmount: unmount2 } = renderWithProviders(
      <SearchableSelect 
        label="Second Select" 
        options={options} 
        value={null} 
        onChange={vi.fn()} 
      />
    );
    
    expect(screen.getByTestId('searchable-select')).toBeInTheDocument();
    expect(screen.getByText('Second Select')).toBeInTheDocument();
    
    unmount2();
  });
});
