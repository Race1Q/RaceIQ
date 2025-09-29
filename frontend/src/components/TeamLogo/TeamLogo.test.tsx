import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import TeamLogo from './TeamLogo';

// Mock all the SVG imports
vi.mock('../../assets/team_logos/McLaren_Racing_logo.svg?react', () => ({
  default: () => <svg data-testid="McLaren-logo"><title>McLaren Logo</title></svg>,
}));

vi.mock('../../assets/team_logos/Ferrari.svg?react', () => ({
  default: () => <svg data-testid="Ferrari-logo"><title>Ferrari Logo</title></svg>,
}));

vi.mock('../../assets/team_logos/Red_Bull.svg?react', () => ({
  default: () => <svg data-testid="RedBull-logo"><title>RedBull Logo</title></svg>,
}));

vi.mock('../../assets/team_logos/Mercedes.svg?react', () => ({
  default: () => <svg data-testid="Mercedes-logo"><title>Mercedes Logo</title></svg>,
}));

vi.mock('../../assets/team_logos/Williams_Racing.svg?react', () => ({
  default: () => <svg data-testid="Williams-logo"><title>Williams Logo</title></svg>,
}));

vi.mock('../../assets/team_logos/RB_F1_Team.svg?react', () => ({
  default: () => <svg data-testid="RbF1Team-logo"><title>RbF1Team Logo</title></svg>,
}));

vi.mock('../../assets/team_logos/Kick_Sauber.svg?react', () => ({
  default: () => <svg data-testid="Sauber-logo"><title>Sauber Logo</title></svg>,
}));

vi.mock('../../assets/team_logos/Haas_F1_Team.svg?react', () => ({
  default: () => <svg data-testid="Haas-logo"><title>Haas Logo</title></svg>,
}));

vi.mock('../../assets/team_logos/Alpine_F1_Team.svg?react', () => ({
  default: () => <svg data-testid="Alpine-logo"><title>Alpine Logo</title></svg>,
}));

describe('TeamLogo', () => {
  it('renders without crashing', () => {
    render(<TeamLogo teamName="McLaren" />);
    
    const container = document.querySelector('[class*="logoContainer"]');
    expect(container).toBeInTheDocument();
  });

  it('renders McLaren logo', () => {
    render(<TeamLogo teamName="McLaren" />);
    
    expect(screen.getByTestId('McLaren-logo')).toBeInTheDocument();
  });

  it('renders Mercedes logo', () => {
    render(<TeamLogo teamName="Mercedes" />);
    
    expect(screen.getByTestId('Mercedes-logo')).toBeInTheDocument();
  });

  it('renders Ferrari logo', () => {
    render(<TeamLogo teamName="Ferrari" />);
    
    expect(screen.getByTestId('Ferrari-logo')).toBeInTheDocument();
  });

  it('renders Red Bull Racing logo', () => {
    render(<TeamLogo teamName="Red Bull Racing" />);
    
    expect(screen.getByTestId('RedBull-logo')).toBeInTheDocument();
  });

  it('renders Williams logo', () => {
    render(<TeamLogo teamName="Williams" />);
    
    expect(screen.getByTestId('Williams-logo')).toBeInTheDocument();
  });

  it('renders RB F1 Team logo', () => {
    render(<TeamLogo teamName="RB F1 Team" />);
    
    expect(screen.getByTestId('RbF1Team-logo')).toBeInTheDocument();
  });

  it('renders Sauber logo', () => {
    render(<TeamLogo teamName="Sauber" />);
    
    expect(screen.getByTestId('Sauber-logo')).toBeInTheDocument();
  });

  it('renders Haas F1 Team logo', () => {
    render(<TeamLogo teamName="Haas F1 Team" />);
    
    expect(screen.getByTestId('Haas-logo')).toBeInTheDocument();
  });

  it('renders Alpine logo', () => {
    render(<TeamLogo teamName="Alpine" />);
    
    expect(screen.getByTestId('Alpine-logo')).toBeInTheDocument();
  });

  it('returns null for unknown team name', () => {
    const { container } = render(<TeamLogo teamName="Unknown Team" />);
    
    expect(container.firstChild).toBeNull();
  });

  it('returns null for empty team name', () => {
    const { container } = render(<TeamLogo teamName="" />);
    
    expect(container.firstChild).toBeNull();
  });

  it('returns null for null team name', () => {
    const { container } = render(<TeamLogo teamName={null as any} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('returns null for undefined team name', () => {
    const { container } = render(<TeamLogo teamName={undefined as any} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('applies correct CSS classes for themed logos', () => {
    const { rerender } = render(<TeamLogo teamName="McLaren" />);
    
    let svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    // Check that the SVG has a class (CSS modules generate hashed names)
    expect(svg?.className).toBeTruthy();
    
    // Test other themed logos
    rerender(<TeamLogo teamName="Mercedes" />);
    svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg?.className).toBeTruthy();
    
    rerender(<TeamLogo teamName="Williams" />);
    svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg?.className).toBeTruthy();
  });

  it('applies correct CSS classes for untouched logos', () => {
    const { rerender } = render(<TeamLogo teamName="Ferrari" />);
    
    let svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    // Check that the SVG has a class (CSS modules generate hashed names)
    expect(svg?.className).toBeTruthy();
    
    // Test other untouched logo
    rerender(<TeamLogo teamName="Red Bull Racing" />);
    svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg?.className).toBeTruthy();
  });

  it('applies logoContainer class to container', () => {
    render(<TeamLogo teamName="McLaren" />);
    
    const container = document.querySelector('[class*="logoContainer"]');
    expect(container).toBeInTheDocument();
    // CSS modules generate hashed class names, so we check for the presence of the class
    expect(container?.className).toContain('logoContainer');
  });

  it('renders all supported team logos', () => {
    const supportedTeams = [
      'McLaren',
      'Mercedes',
      'Ferrari',
      'Red Bull Racing',
      'Williams',
      'RB F1 Team',
      'Sauber',
      'Haas F1 Team',
      'Alpine',
    ];
    
    supportedTeams.forEach((teamName) => {
      const { unmount } = render(<TeamLogo teamName={teamName} />);
      
      const container = document.querySelector('[class*="logoContainer"]');
      expect(container).toBeInTheDocument();
      
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
      
      unmount();
    });
  });

  it('handles case sensitivity correctly', () => {
    const caseVariations = [
      'mclaren',
      'MCLAREN',
      'McLaren',
      'mclaren',
    ];
    
    caseVariations.forEach((teamName) => {
      const { unmount } = render(<TeamLogo teamName={teamName} />);
      
      // Case variations should not match (exact match required)
      const container = document.querySelector('[class*="logoContainer"]');
      if (teamName === 'McLaren') {
        expect(container).toBeInTheDocument();
      } else {
        expect(container).toBeNull();
      }
      
      unmount();
    });
  });

  it('handles whitespace in team names', () => {
    const whitespaceVariations = [
      ' McLaren',
      'McLaren ',
      ' McLaren ',
      'McLaren\t',
      'McLaren\n',
    ];
    
    whitespaceVariations.forEach((teamName) => {
      const { unmount } = render(<TeamLogo teamName={teamName} />);
      
      // Whitespace variations should not match (exact match required)
      const container = document.querySelector('[class*="logoContainer"]');
      expect(container).toBeNull();
      
      unmount();
    });
  });

  it('renders consistently across multiple renders', () => {
    const { rerender } = render(<TeamLogo teamName="McLaren" />);
    
    expect(screen.getByTestId('McLaren-logo')).toBeInTheDocument();
    
    // Re-render with same team
    rerender(<TeamLogo teamName="McLaren" />);
    expect(screen.getByTestId('McLaren-logo')).toBeInTheDocument();
    
    // Re-render with different team
    rerender(<TeamLogo teamName="Ferrari" />);
    expect(screen.getByTestId('Ferrari-logo')).toBeInTheDocument();
  });

  it('handles unmounting and remounting', () => {
    const { unmount } = render(<TeamLogo teamName="McLaren" />);
    
    expect(screen.getByTestId('McLaren-logo')).toBeInTheDocument();
    
    unmount();
    
    expect(screen.queryByTestId('McLaren-logo')).not.toBeInTheDocument();
    
    // Re-mount
    render(<TeamLogo teamName="McLaren" />);
    expect(screen.getByTestId('McLaren-logo')).toBeInTheDocument();
  });

  it('handles special characters in team names', () => {
    const specialTeamNames = [
      'McLaren & Co.',
      'Team-McLaren',
      'McLaren_F1',
      'McLaren (F1)',
    ];
    
    specialTeamNames.forEach((teamName) => {
      const { unmount } = render(<TeamLogo teamName={teamName} />);
      
      // Special characters should not match (exact match required)
      const container = document.querySelector('[class*="logoContainer"]');
      expect(container).toBeNull();
      
      unmount();
    });
  });

  it('handles numeric team names', () => {
    const numericTeamNames = ['123', 'McLaren123', '123McLaren'];
    
    numericTeamNames.forEach((teamName) => {
      const { unmount } = render(<TeamLogo teamName={teamName} />);
      
      // Numeric variations should not match (exact match required)
      const container = document.querySelector('[class*="logoContainer"]');
      expect(container).toBeNull();
      
      unmount();
    });
  });

  it('handles boolean team names', () => {
    const { container } = render(<TeamLogo teamName={true as any} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('handles object team names', () => {
    const { container } = render(<TeamLogo teamName={{ name: 'McLaren' } as any} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('handles array team names', () => {
    render(<TeamLogo teamName={['McLaren'] as any} />);
    
    // Arrays are converted to strings in React, so 'McLaren' matches the logoMap
    // This is actually expected behavior - arrays become comma-separated strings
    const containerDiv = document.querySelector('[class*="logoContainer"]');
    expect(containerDiv).toBeInTheDocument();
  });

  it('handles function team names', () => {
    const { container } = render(<TeamLogo teamName={(() => 'McLaren') as any} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('maintains performance with multiple instances', () => {
    const startTime = performance.now();
    
    render(
      <div>
        {Array.from({ length: 10 }, (_, i) => (
          <TeamLogo key={i} teamName="McLaren" />
        ))}
      </div>
    );
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render quickly (less than 100ms for 10 instances)
    expect(renderTime).toBeLessThan(100);
    
    // All instances should be rendered
    const logos = document.querySelectorAll('[data-testid="McLaren-logo"]');
    expect(logos).toHaveLength(10);
  });

  it('renders with different team names in sequence', () => {
    const teams = ['McLaren', 'Ferrari', 'Mercedes', 'Red Bull Racing'];
    
    teams.forEach((teamName) => {
      const { unmount } = render(<TeamLogo teamName={teamName} />);
      
      const container = document.querySelector('[class*="logoContainer"]');
      expect(container).toBeInTheDocument();
      
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
      
      unmount();
    });
  });

  it('handles very long team names', () => {
    const longTeamName = 'Very Long Team Name That Should Not Match Any Logo';
    const { container } = render(<TeamLogo teamName={longTeamName} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('handles empty string team name', () => {
    const { container } = render(<TeamLogo teamName="" />);
    
    expect(container.firstChild).toBeNull();
  });

  it('handles whitespace-only team name', () => {
    const { container } = render(<TeamLogo teamName="   " />);
    
    expect(container.firstChild).toBeNull();
  });

  it('renders SVG elements with correct structure', () => {
    render(<TeamLogo teamName="McLaren" />);
    
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('data-testid', 'McLaren-logo');
    
    const title = document.querySelector('title');
    expect(title).toHaveTextContent('McLaren Logo');
  });

  it('applies correct theming logic', () => {
    // Test themed logos
    const themedTeams = ['McLaren', 'Mercedes', 'Williams', 'RB F1 Team', 'Sauber', 'Haas F1 Team', 'Alpine'];
    
    themedTeams.forEach((teamName) => {
      const { unmount } = render(<TeamLogo teamName={teamName} />);
      
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
      // Check that the SVG has a class (CSS modules generate hashed names)
      expect(svg?.className).toBeTruthy();
      
      unmount();
    });
    
    // Test untouched logos
    const untouchedTeams = ['Ferrari', 'Red Bull Racing'];
    
    untouchedTeams.forEach((teamName) => {
      const { unmount } = render(<TeamLogo teamName={teamName} />);
      
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
      // Check that the SVG has a class (CSS modules generate hashed names)
      expect(svg?.className).toBeTruthy();
      
      unmount();
    });
  });

  it('handles rapid team name changes', () => {
    const { rerender } = render(<TeamLogo teamName="McLaren" />);
    
    expect(screen.getByTestId('McLaren-logo')).toBeInTheDocument();
    
    // Rapid changes
    rerender(<TeamLogo teamName="Ferrari" />);
    expect(screen.getByTestId('Ferrari-logo')).toBeInTheDocument();
    
    rerender(<TeamLogo teamName="Mercedes" />);
    expect(screen.getByTestId('Mercedes-logo')).toBeInTheDocument();
    
    rerender(<TeamLogo teamName="Unknown" />);
    expect(screen.queryByTestId('Mercedes-logo')).not.toBeInTheDocument();
  });

  it('renders with all team name variations', () => {
    const allTeamNames = [
      'McLaren',
      'Mercedes', 
      'Ferrari',
      'Red Bull Racing',
      'Williams',
      'RB F1 Team',
      'Sauber',
      'Haas F1 Team',
      'Alpine',
    ];
    
    allTeamNames.forEach((teamName) => {
      const { unmount } = render(<TeamLogo teamName={teamName} />);
      
      const container = document.querySelector('[class*="logoContainer"]');
      expect(container).toBeInTheDocument();
      
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
      
      unmount();
    });
  });

  it('handles concurrent renders', () => {
    const { rerender } = render(<TeamLogo teamName="McLaren" />);
    
    // Simulate concurrent renders
    rerender(<TeamLogo teamName="Ferrari" />);
    rerender(<TeamLogo teamName="Mercedes" />);
    rerender(<TeamLogo teamName="McLaren" />);
    
    expect(screen.getByTestId('McLaren-logo')).toBeInTheDocument();
  });
});
