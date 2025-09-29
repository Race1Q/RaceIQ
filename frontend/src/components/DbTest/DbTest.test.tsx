import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ChakraProvider } from '@chakra-ui/react';
import DbTest from './DbTest';

// Mock the supabase module
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          then: vi.fn()
        }))
      }))
    }))
  }
}));

// Helper function to render with Chakra UI
function renderWithChakra(ui: React.ReactNode) {
  return render(
    <ChakraProvider>
      {ui}
    </ChakraProvider>
  );
}

describe('DbTest Component', () => {
  let mockQueryChain: any;
  let mockSupabase: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Get the mocked supabase
    const { supabase } = await vi.importMock('../../lib/supabase');
    mockSupabase = supabase;
    
    // Setup the mock chain
    mockQueryChain = {
      then: vi.fn()
    };
    
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue(mockQueryChain)
      })
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders without crashing', () => {
    // Mock successful response
    mockQueryChain.then.mockImplementation((callback: (result: { data: any; error: any }) => void) => {
      callback({ data: [], error: null });
      return Promise.resolve();
    });

    renderWithChakra(<DbTest />);
    expect(screen.getByText(/\[\]/)).toBeInTheDocument();
  });

  it('makes correct database query on mount', async () => {
    // Mock successful response
    mockQueryChain.then.mockImplementation((callback: (result: { data: any; error: any }) => void) => {
      callback({ data: [], error: null });
      return Promise.resolve();
    });

    renderWithChakra(<DbTest />);

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('healthcheck');
      expect(mockSupabase.from().select).toHaveBeenCalledWith('*');
      expect(mockSupabase.from().select().order).toHaveBeenCalledWith('created_at', { ascending: false });
    });
  });

  it('displays data when query is successful', async () => {
    const mockData = [
      { id: 1, created_at: '2023-01-01T00:00:00Z', message: 'Test message 1' },
      { id: 2, created_at: '2023-01-02T00:00:00Z', message: 'Test message 2' }
    ];

    // Mock successful response
    mockQueryChain.then.mockImplementation((callback: (result: { data: any; error: any }) => void) => {
      callback({ data: mockData, error: null });
      return Promise.resolve();
    });

    renderWithChakra(<DbTest />);

    await waitFor(() => {
      expect(screen.getByText(/Test message 1/)).toBeInTheDocument();
      expect(screen.getByText(/Test message 2/)).toBeInTheDocument();
    });
  });

  it('displays error message when query fails', async () => {
    const mockError = { message: 'Database connection failed' };

    // Mock error response
    mockQueryChain.then.mockImplementation((callback: (result: { data: any; error: any }) => void) => {
      callback({ data: null, error: mockError });
      return Promise.resolve();
    });

    renderWithChakra(<DbTest />);

    await waitFor(() => {
      expect(screen.getByText('DB error: Database connection failed')).toBeInTheDocument();
    });
  });

  it('handles empty data array correctly', async () => {
    // Mock successful response with empty array
    mockQueryChain.then.mockImplementation((callback: (result: { data: any; error: any }) => void) => {
      callback({ data: [], error: null });
      return Promise.resolve();
    });

    renderWithChakra(<DbTest />);

    await waitFor(() => {
      expect(screen.getByText(/\[\]/)).toBeInTheDocument();
    });
  });

  it('handles null data response correctly', async () => {
    // Mock successful response with null data
    mockQueryChain.then.mockImplementation((callback: (result: { data: any; error: any }) => void) => {
      callback({ data: null, error: null });
      return Promise.resolve();
    });

    renderWithChakra(<DbTest />);

    await waitFor(() => {
      expect(screen.getByText(/\[\]/)).toBeInTheDocument();
    });
  });

  it('renders data in pre-formatted JSON', async () => {
    const mockData = [
      { id: 1, created_at: '2023-01-01T00:00:00Z', message: 'Test message' }
    ];

    // Mock successful response
    mockQueryChain.then.mockImplementation((callback: (result: { data: any; error: any }) => void) => {
      callback({ data: mockData, error: null });
      return Promise.resolve();
    });

    renderWithChakra(<DbTest />);

    await waitFor(() => {
      const preElement = screen.getByText(/Test message/).closest('pre');
      expect(preElement).toBeInTheDocument();
      expect(preElement?.tagName).toBe('PRE');
    });
  });

  it('calls query only once on component mount', async () => {
    // Mock successful response
    mockQueryChain.then.mockImplementation((callback: (result: { data: any; error: any }) => void) => {
      callback({ data: [], error: null });
      return Promise.resolve();
    });

    renderWithChakra(<DbTest />);

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledTimes(1);
    });
  });

  it('handles complex data structures correctly', async () => {
    const complexData = [
      {
        id: 1,
        created_at: '2023-01-01T00:00:00Z',
        nested_object: {
          field1: 'value1',
          field2: [1, 2, 3]
        },
        array_field: ['a', 'b', 'c']
      }
    ];

    // Mock successful response
    mockQueryChain.then.mockImplementation((callback: (result: { data: any; error: any }) => void) => {
      callback({ data: complexData, error: null });
      return Promise.resolve();
    });

    renderWithChakra(<DbTest />);

    await waitFor(() => {
      expect(screen.getByText(/nested_object/)).toBeInTheDocument();
      expect(screen.getByText(/array_field/)).toBeInTheDocument();
      expect(screen.getByText(/value1/)).toBeInTheDocument();
    });
  });

  it('displays multiple error messages correctly', async () => {
    const mockError = { message: 'Multiple errors: Connection timeout, Permission denied' };

    // Mock error response
    mockQueryChain.then.mockImplementation((callback: (result: { data: any; error: any }) => void) => {
      callback({ data: null, error: mockError });
      return Promise.resolve();
    });

    renderWithChakra(<DbTest />);

    await waitFor(() => {
      expect(screen.getByText(/Multiple errors: Connection timeout, Permission denied/)).toBeInTheDocument();
    });
  });

  it('handles undefined error gracefully', async () => {
    // Mock error response with undefined message
    // When error.message is undefined, the component sets err to undefined
    // which is falsy, so it renders data instead of error
    mockQueryChain.then.mockImplementation((callback: (result: { data: any; error: any }) => void) => {
      callback({ data: [], error: { message: undefined } });
      return Promise.resolve();
    });

    renderWithChakra(<DbTest />);

    await waitFor(() => {
      // Since error.message is undefined, err becomes undefined (falsy)
      // so the component renders data instead of error
      expect(screen.getByText(/\[\]/)).toBeInTheDocument();
    });
  });
});
