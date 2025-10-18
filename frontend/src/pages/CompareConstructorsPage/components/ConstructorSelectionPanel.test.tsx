import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { vi, describe, it, expect } from 'vitest';
import { ConstructorSelectionPanel } from './ConstructorSelectionPanel';
import { ThemeColorProvider } from '../../../context/ThemeColorContext';

// Mock ProfileUpdateContext
vi.mock('../../../context/ProfileUpdateContext', () => ({
  ProfileUpdateProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useProfileUpdate: () => ({
    refreshTrigger: 0,
    triggerRefresh: vi.fn(),
  }),
}));

// Mock SearchableSelect
vi.mock('../../../components/DropDownSearch/SearchableSelect', () => ({
  default: ({ placeholder, value }: any) => (
    <div data-testid="searchable-select">
      <div data-testid="placeholder">{placeholder}</div>
      {value && <div data-testid="selected-value">{value.label}</div>}
    </div>
  ),
}));

const mockConstructors = [
  { value: '1', label: 'Red Bull Racing' },
  { value: '2', label: 'Ferrari' },
  { value: '3', label: 'McLaren' },
];

const mockConstructorData = {
  id: '1',
  name: 'Red Bull Racing',
  nationality: 'Austrian',
  championshipStanding: 1,
  wins: 100,
  podiums: 250,
  points: 10000,
  teamColorToken: 'red_bull',
};

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider>
      <ThemeColorProvider>
        {ui}
      </ThemeColorProvider>
    </ChakraProvider>
  );
};

describe('ConstructorSelectionPanel', () => {
  it('renders without crashing', () => {
    renderWithProviders(
      <ConstructorSelectionPanel
        title="Constructor 1"
        allConstructors={mockConstructors}
        selectedConstructorData={null}
        onConstructorSelect={vi.fn()}
      />
    );
    
    expect(screen.getByText('Constructor 1')).toBeInTheDocument();
  });

  it('displays title heading', () => {
    renderWithProviders(
      <ConstructorSelectionPanel
        title="Select Constructor"
        allConstructors={mockConstructors}
        selectedConstructorData={null}
        onConstructorSelect={vi.fn()}
      />
    );
    
    expect(screen.getByText('Select Constructor')).toBeInTheDocument();
  });

  it('displays constructor selector', () => {
    renderWithProviders(
      <ConstructorSelectionPanel
        title="Constructor 1"
        allConstructors={mockConstructors}
        selectedConstructorData={null}
        onConstructorSelect={vi.fn()}
      />
    );
    
    expect(screen.getByTestId('searchable-select')).toBeInTheDocument();
  });

  it('shows placeholder text', () => {
    renderWithProviders(
      <ConstructorSelectionPanel
        title="Constructor 1"
        allConstructors={mockConstructors}
        selectedConstructorData={null}
        onConstructorSelect={vi.fn()}
      />
    );
    
    expect(screen.getByText('Search for a Constructor')).toBeInTheDocument();
  });

  it('shows selected constructor', () => {
    renderWithProviders(
      <ConstructorSelectionPanel
        title="Constructor 1"
        allConstructors={mockConstructors}
        selectedConstructorData={mockConstructorData}
        onConstructorSelect={vi.fn()}
      />
    );
    
    expect(screen.getByText('Red Bull Racing')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    renderWithProviders(
      <ConstructorSelectionPanel
        title="Constructor 1"
        allConstructors={mockConstructors}
        selectedConstructorData={null}
        onConstructorSelect={vi.fn()}
        isLoading={true}
      />
    );
    
    expect(screen.getByText('Constructor 1')).toBeInTheDocument();
  });

  it('renders extra control when provided', () => {
    renderWithProviders(
      <ConstructorSelectionPanel
        title="Constructor 1"
        allConstructors={mockConstructors}
        selectedConstructorData={null}
        onConstructorSelect={vi.fn()}
        extraControl={<div data-testid="extra-control">Extra Control</div>}
      />
    );
    
    expect(screen.getByTestId('extra-control')).toBeInTheDocument();
  });

  it('handles empty constructor list', () => {
    renderWithProviders(
      <ConstructorSelectionPanel
        title="Constructor 1"
        allConstructors={[]}
        selectedConstructorData={null}
        onConstructorSelect={vi.fn()}
      />
    );
    
    expect(screen.getByText('Constructor 1')).toBeInTheDocument();
  });
});

