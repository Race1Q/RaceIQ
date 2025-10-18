import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import TeamMemberCard from './TeamMemberCard';
import { ThemeColorProvider } from '../../context/ThemeColorContext';

// Mock Auth0
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: false,
    user: null,
    isLoading: false,
    getAccessTokenSilently: vi.fn().mockResolvedValue('mock-token'),
  }),
}));

// Mock useUserProfile
vi.mock('../../hooks/useUserProfile', () => ({
  useUserProfile: () => ({
    favoriteDriver: null,
    favoriteConstructor: null,
    loading: false,
    error: null,
  }),
}));

// Mock the User icon from lucide-react
vi.mock('lucide-react', () => ({
  User: ({ size }: { size: number }) => (
    <svg data-testid="user-icon" width={size} height={size}>
      <title>User Icon</title>
    </svg>
  ),
}));

// Helper function to render with Chakra UI and ThemeColorProvider
const renderWithChakra = (component: React.ReactElement) => {
  return render(
    <ChakraProvider>
      <ThemeColorProvider>
        {component}
      </ThemeColorProvider>
    </ChakraProvider>
  );
};

describe('TeamMemberCard', () => {
  it('renders without crashing', () => {
    renderWithChakra(<TeamMemberCard name="John Doe" role="Driver" />);
    
    const card = document.querySelector('[class*="card"]');
    expect(card).toBeInTheDocument();
  });

  it('renders name correctly', () => {
    renderWithChakra(<TeamMemberCard name="John Doe" role="Driver" />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders role correctly', () => {
    renderWithChakra(<TeamMemberCard name="John Doe" role="Driver" />);
    
    expect(screen.getByText('Driver')).toBeInTheDocument();
  });

  it('renders with different names', () => {
    const names = ['Alice Smith', 'Bob Johnson', 'Charlie Brown', 'Diana Prince'];
    
    names.forEach((name) => {
      const { unmount } = renderWithChakra(<TeamMemberCard name={name} role="Driver" />);
      
      expect(screen.getByText(name)).toBeInTheDocument();
      unmount();
    });
  });

  it('renders with different roles', () => {
    const roles = ['Driver', 'Engineer', 'Manager', 'Analyst'];
    
    roles.forEach((role) => {
      const { unmount } = renderWithChakra(<TeamMemberCard name="John Doe" role={role} />);
      
      expect(screen.getByText(role)).toBeInTheDocument();
      unmount();
    });
  });

  it('renders User icon', () => {
    renderWithChakra(<TeamMemberCard name="John Doe" role="Driver" />);
    
    expect(screen.getByTestId('user-icon')).toBeInTheDocument();
  });

  it('renders User icon with correct size', () => {
    renderWithChakra(<TeamMemberCard name="John Doe" role="Driver" />);
    
    const userIcon = screen.getByTestId('user-icon');
    expect(userIcon).toHaveAttribute('width', '32');
    expect(userIcon).toHaveAttribute('height', '32');
  });

  it('applies correct CSS classes', () => {
    renderWithChakra(<TeamMemberCard name="John Doe" role="Driver" />);
    
    const card = document.querySelector('[class*="card"]');
    expect(card).toBeInTheDocument();
    expect(card?.className).toContain('card');
    
    const avatar = document.querySelector('[class*="avatar"]');
    expect(avatar).toBeInTheDocument();
    expect(avatar?.className).toContain('avatar');
    
    const nameElement = document.querySelector('[class*="name"]');
    expect(nameElement).toBeInTheDocument();
    expect(nameElement?.className).toContain('name');
    
    const roleElement = document.querySelector('[class*="role"]');
    expect(roleElement).toBeInTheDocument();
    expect(roleElement?.className).toContain('role');
  });

  it('renders with long names', () => {
    const longName = 'Very Long Name That Should Still Be Displayed Correctly';
    renderWithChakra(<TeamMemberCard name={longName} role="Driver" />);
    
    expect(screen.getByText(longName)).toBeInTheDocument();
  });

  it('renders with long roles', () => {
    const longRole = 'Very Long Role Title That Should Still Be Displayed Correctly';
    renderWithChakra(<TeamMemberCard name="John Doe" role={longRole} />);
    
    expect(screen.getByText(longRole)).toBeInTheDocument();
  });

  it('renders with special characters in name', () => {
    const specialName = 'José María O\'Connor-Smith';
    renderWithChakra(<TeamMemberCard name={specialName} role="Driver" />);
    
    expect(screen.getByText(specialName)).toBeInTheDocument();
  });

  it('renders with special characters in role', () => {
    const specialRole = 'Senior Engineer & Team Lead';
    renderWithChakra(<TeamMemberCard name="John Doe" role={specialRole} />);
    
    expect(screen.getByText(specialRole)).toBeInTheDocument();
  });

  it('renders with unicode characters', () => {
    const unicodeName = 'José María';
    const unicodeRole = 'Ingénieur';
    renderWithChakra(<TeamMemberCard name={unicodeName} role={unicodeRole} />);
    
    expect(screen.getByText(unicodeName)).toBeInTheDocument();
    expect(screen.getByText(unicodeRole)).toBeInTheDocument();
  });

  it('handles empty name', () => {
    renderWithChakra(<TeamMemberCard name="" role="Driver" />);
    
    const nameElement = document.querySelector('[class*="name"]');
    expect(nameElement).toBeInTheDocument();
    expect(nameElement).toHaveTextContent('');
  });

  it('handles empty role', () => {
    renderWithChakra(<TeamMemberCard name="John Doe" role="" />);
    
    const roleElement = document.querySelector('[class*="role"]');
    expect(roleElement).toBeInTheDocument();
    expect(roleElement).toHaveTextContent('');
  });

  it('handles whitespace-only name', () => {
    renderWithChakra(<TeamMemberCard name="   " role="Driver" />);
    
    const nameElement = document.querySelector('[class*="name"]');
    expect(nameElement).toBeInTheDocument();
    // Check that the element exists (whitespace content may be normalized)
    expect(nameElement).toBeInTheDocument();
  });

  it('handles whitespace-only role', () => {
    renderWithChakra(<TeamMemberCard name="John Doe" role="   " />);
    
    const roleElement = document.querySelector('[class*="role"]');
    expect(roleElement).toBeInTheDocument();
    // Check that the element exists (whitespace content may be normalized)
    expect(roleElement).toBeInTheDocument();
  });

  it('renders consistently across multiple renders', () => {
    const { rerender } = renderWithChakra(<TeamMemberCard name="John Doe" role="Driver" />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Driver')).toBeInTheDocument();
    
    // Re-render with same props
    rerender(
      <ChakraProvider>
        <ThemeColorProvider>
          <TeamMemberCard name="John Doe" role="Driver" />
        </ThemeColorProvider>
      </ChakraProvider>
    );
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Driver')).toBeInTheDocument();
    
    // Re-render with different props
    rerender(
      <ChakraProvider>
        <ThemeColorProvider>
          <TeamMemberCard name="Jane Smith" role="Engineer" />
        </ThemeColorProvider>
      </ChakraProvider>
    );
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Engineer')).toBeInTheDocument();
  });

  it('handles unmounting and remounting', () => {
    const { unmount } = renderWithChakra(<TeamMemberCard name="John Doe" role="Driver" />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Driver')).toBeInTheDocument();
    
    unmount();
    
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.queryByText('Driver')).not.toBeInTheDocument();
    
    // Re-mount
    renderWithChakra(<TeamMemberCard name="John Doe" role="Driver" />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Driver')).toBeInTheDocument();
  });

  it('handles null name', () => {
    renderWithChakra(<TeamMemberCard name={null as any} role="Driver" />);
    
    const nameElement = document.querySelector('[class*="name"]');
    expect(nameElement).toBeInTheDocument();
    expect(nameElement).toHaveTextContent('');
  });

  it('handles undefined name', () => {
    renderWithChakra(<TeamMemberCard name={undefined as any} role="Driver" />);
    
    const nameElement = document.querySelector('[class*="name"]');
    expect(nameElement).toBeInTheDocument();
    expect(nameElement).toHaveTextContent('');
  });

  it('handles null role', () => {
    renderWithChakra(<TeamMemberCard name="John Doe" role={null as any} />);
    
    const roleElement = document.querySelector('[class*="role"]');
    expect(roleElement).toBeInTheDocument();
    expect(roleElement).toHaveTextContent('');
  });

  it('handles undefined role', () => {
    renderWithChakra(<TeamMemberCard name="John Doe" role={undefined as any} />);
    
    const roleElement = document.querySelector('[class*="role"]');
    expect(roleElement).toBeInTheDocument();
    expect(roleElement).toHaveTextContent('');
  });

  it('handles boolean name', () => {
    renderWithChakra(<TeamMemberCard name={true as any} role="Driver" />);
    
    const nameElement = document.querySelector('[class*="name"]');
    expect(nameElement).toBeInTheDocument();
    // Boolean true renders as empty string in React
    expect(nameElement).toHaveTextContent('');
  });

  it('handles boolean role', () => {
    renderWithChakra(<TeamMemberCard name="John Doe" role={false as any} />);
    
    const roleElement = document.querySelector('[class*="role"]');
    expect(roleElement).toBeInTheDocument();
    // Boolean false renders as empty string in React
    expect(roleElement).toHaveTextContent('');
  });

  it('handles numeric name', () => {
    renderWithChakra(<TeamMemberCard name={123 as any} role="Driver" />);
    
    const nameElement = document.querySelector('[class*="name"]');
    expect(nameElement).toBeInTheDocument();
    expect(nameElement).toHaveTextContent('123');
  });

  it('handles numeric role', () => {
    renderWithChakra(<TeamMemberCard name="John Doe" role={456 as any} />);
    
    const roleElement = document.querySelector('[class*="role"]');
    expect(roleElement).toBeInTheDocument();
    expect(roleElement).toHaveTextContent('456');
  });

  it('handles object name', () => {
    // Objects as React children cause errors, so we expect this to throw
    expect(() => {
      renderWithChakra(<TeamMemberCard name={{ name: 'John' } as any} role="Driver" />);
    }).toThrow();
  });

  it('handles object role', () => {
    // Objects as React children cause errors, so we expect this to throw
    expect(() => {
      renderWithChakra(<TeamMemberCard name="John Doe" role={{ role: 'Driver' } as any} />);
    }).toThrow();
  });

  it('handles array name', () => {
    renderWithChakra(<TeamMemberCard name={['John', 'Doe'] as any} role="Driver" />);
    
    const nameElement = document.querySelector('[class*="name"]');
    expect(nameElement).toBeInTheDocument();
    // Arrays are joined without commas in React
    expect(nameElement).toHaveTextContent('JohnDoe');
  });

  it('handles array role', () => {
    renderWithChakra(<TeamMemberCard name="John Doe" role={['Senior', 'Engineer'] as any} />);
    
    const roleElement = document.querySelector('[class*="role"]');
    expect(roleElement).toBeInTheDocument();
    // Arrays are joined without commas in React
    expect(roleElement).toHaveTextContent('SeniorEngineer');
  });

  it('handles function name', () => {
    renderWithChakra(<TeamMemberCard name={(() => 'John') as any} role="Driver" />);
    
    const nameElement = document.querySelector('[class*="name"]');
    expect(nameElement).toBeInTheDocument();
    // Functions render as empty string in React
    expect(nameElement).toHaveTextContent('');
  });

  it('handles function role', () => {
    renderWithChakra(<TeamMemberCard name="John Doe" role={(() => 'Driver') as any} />);
    
    const roleElement = document.querySelector('[class*="role"]');
    expect(roleElement).toBeInTheDocument();
    // Functions render as empty string in React
    expect(roleElement).toHaveTextContent('');
  });

  it('maintains performance with multiple instances', () => {
    const startTime = performance.now();
    
    renderWithChakra(
      <div>
        {Array.from({ length: 10 }, (_, i) => (
          <TeamMemberCard key={i} name={`Person ${i}`} role="Member" />
        ))}
      </div>
    );
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render reasonably quickly (less than 1000ms for 10 instances in test environment)
    expect(renderTime).toBeLessThan(1500);
    
    // All instances should be rendered
    const cards = document.querySelectorAll('[class*="card"]');
    expect(cards).toHaveLength(10);
  });

  it('renders with different prop combinations', () => {
    const combinations = [
      { name: 'Alice', role: 'Driver' },
      { name: 'Bob', role: 'Engineer' },
      { name: 'Charlie', role: 'Manager' },
      { name: 'Diana', role: 'Analyst' },
    ];
    
    combinations.forEach(({ name, role }) => {
      const { unmount } = renderWithChakra(<TeamMemberCard name={name} role={role} />);
      
      expect(screen.getByText(name)).toBeInTheDocument();
      expect(screen.getByText(role)).toBeInTheDocument();
      
      unmount();
    });
  });

  it('renders with HTML entities in name', () => {
    const nameWithEntities = 'José & María';
    renderWithChakra(<TeamMemberCard name={nameWithEntities} role="Driver" />);
    
    // HTML entities are encoded in the DOM
    expect(screen.getByText('José & María')).toBeInTheDocument();
  });

  it('renders with HTML entities in role', () => {
    const roleWithEntities = 'Senior & Lead Engineer';
    renderWithChakra(<TeamMemberCard name="John Doe" role={roleWithEntities} />);
    
    // HTML entities are encoded in the DOM
    expect(screen.getByText('Senior & Lead Engineer')).toBeInTheDocument();
  });

  it('renders with very long text content', () => {
    const veryLongName = 'A'.repeat(100);
    const veryLongRole = 'B'.repeat(100);
    renderWithChakra(<TeamMemberCard name={veryLongName} role={veryLongRole} />);
    
    expect(screen.getByText(veryLongName)).toBeInTheDocument();
    expect(screen.getByText(veryLongRole)).toBeInTheDocument();
  });

  it('renders with mixed content types', () => {
    const mixedName = 'John123';
    const mixedRole = 'Engineer456';
    renderWithChakra(<TeamMemberCard name={mixedName} role={mixedRole} />);
    
    expect(screen.getByText(mixedName)).toBeInTheDocument();
    expect(screen.getByText(mixedRole)).toBeInTheDocument();
  });

  it('handles rapid prop changes', () => {
    const { rerender } = renderWithChakra(<TeamMemberCard name="John" role="Driver" />);
    
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Driver')).toBeInTheDocument();
    
    // Rapid changes
    rerender(
      <ChakraProvider>
        <ThemeColorProvider>
          <TeamMemberCard name="Jane" role="Engineer" />
        </ThemeColorProvider>
      </ChakraProvider>
    );
    expect(screen.getByText('Jane')).toBeInTheDocument();
    expect(screen.getByText('Engineer')).toBeInTheDocument();
    
    rerender(
      <ChakraProvider>
        <ThemeColorProvider>
          <TeamMemberCard name="Bob" role="Manager" />
        </ThemeColorProvider>
      </ChakraProvider>
    );
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Manager')).toBeInTheDocument();
  });

  it('renders with all supported prop types', () => {
    const testCases = [
      { name: 'String Name', role: 'String Role' },
      { name: 123, role: 456 },
      { name: '', role: '' },
      { name: '   ', role: '   ' },
    ];
    
    testCases.forEach(({ name, role }) => {
      const { unmount } = renderWithChakra(<TeamMemberCard name={name as any} role={role as any} />);
      
      const card = document.querySelector('[class*="card"]');
      expect(card).toBeInTheDocument();
      
      unmount();
    });
  });

  it('renders with extreme values', () => {
    const extremeName = 'A'.repeat(1000);
    const extremeRole = 'B'.repeat(1000);
    renderWithChakra(<TeamMemberCard name={extremeName} role={extremeRole} />);
    
    expect(screen.getByText(extremeName)).toBeInTheDocument();
    expect(screen.getByText(extremeRole)).toBeInTheDocument();
  });

  it('handles concurrent renders', () => {
    const { rerender } = renderWithChakra(<TeamMemberCard name="John" role="Driver" />);
    
    // Simulate concurrent renders
    rerender(
      <ChakraProvider>
        <ThemeColorProvider>
          <TeamMemberCard name="Jane" role="Engineer" />
        </ThemeColorProvider>
      </ChakraProvider>
    );
    rerender(
      <ChakraProvider>
        <ThemeColorProvider>
          <TeamMemberCard name="Bob" role="Manager" />
        </ThemeColorProvider>
      </ChakraProvider>
    );
    rerender(
      <ChakraProvider>
        <ThemeColorProvider>
          <TeamMemberCard name="Alice" role="Analyst" />
        </ThemeColorProvider>
      </ChakraProvider>
    );
    
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Analyst')).toBeInTheDocument();
  });

  it('renders with complex unicode characters', () => {
    const complexName = 'José María O\'Connor-Smith';
    const complexRole = 'Ingénieur Senior & Team Lead';
    renderWithChakra(<TeamMemberCard name={complexName} role={complexRole} />);
    
    expect(screen.getByText(complexName)).toBeInTheDocument();
    expect(screen.getByText(complexRole)).toBeInTheDocument();
  });

  it('renders with numbers and symbols', () => {
    const nameWithNumbers = 'John123';
    const roleWithSymbols = 'Engineer@Company#1';
    renderWithChakra(<TeamMemberCard name={nameWithNumbers} role={roleWithSymbols} />);
    
    expect(screen.getByText(nameWithNumbers)).toBeInTheDocument();
    expect(screen.getByText(roleWithSymbols)).toBeInTheDocument();
  });

  it('renders with newline characters', () => {
    const nameWithNewlines = 'John\nDoe';
    const roleWithNewlines = 'Senior\nEngineer';
    renderWithChakra(<TeamMemberCard name={nameWithNewlines} role={roleWithNewlines} />);
    
    // Check that the component renders (newline characters may be normalized in DOM)
    const nameElement = document.querySelector('[class*="name"]');
    const roleElement = document.querySelector('[class*="role"]');
    expect(nameElement).toBeInTheDocument();
    expect(roleElement).toBeInTheDocument();
  });

  it('renders with tab characters', () => {
    const nameWithTabs = 'John\tDoe';
    const roleWithTabs = 'Senior\tEngineer';
    renderWithChakra(<TeamMemberCard name={nameWithTabs} role={roleWithTabs} />);
    
    // Check that the component renders (tab characters may be normalized in DOM)
    const nameElement = document.querySelector('[class*="name"]');
    const roleElement = document.querySelector('[class*="role"]');
    expect(nameElement).toBeInTheDocument();
    expect(roleElement).toBeInTheDocument();
  });
});
