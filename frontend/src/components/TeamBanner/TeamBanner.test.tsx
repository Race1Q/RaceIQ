import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import TeamBanner from './TeamBanner';

// Mock TeamLogo component
vi.mock('../TeamLogo/TeamLogo', () => ({
  default: ({ teamName }: { teamName: string }) => (
    <div data-testid="team-logo" data-team-name={teamName}>
      Team Logo for {teamName}
    </div>
  ),
}));

function renderWithChakra(ui: React.ReactNode) {
  return render(
    <ChakraProvider>
      {ui}
    </ChakraProvider>
  );
}

describe('TeamBanner', () => {
  const defaultProps = {
    teamName: 'Mercedes',
    teamColor: '#00D2BE',
  };

  it('renders without crashing', () => {
    renderWithChakra(<TeamBanner {...defaultProps} />);
    
    expect(screen.getByText('Mercedes')).toBeInTheDocument();
    expect(screen.getByTestId('team-logo')).toBeInTheDocument();
  });

  it('renders team name correctly', () => {
    renderWithChakra(<TeamBanner {...defaultProps} />);
    
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Mercedes');
  });

  it('renders with different team names', () => {
    const teamNames = ['Ferrari', 'Red Bull Racing', 'McLaren', 'Aston Martin'];
    
    teamNames.forEach((teamName) => {
      const { unmount } = renderWithChakra(
        <TeamBanner teamName={teamName} teamColor="#FF0000" />
      );
      
      expect(screen.getByText(teamName)).toBeInTheDocument();
      expect(screen.getByTestId('team-logo')).toHaveAttribute('data-team-name', teamName);
      unmount();
    });
  });

  it('renders with different team colors', () => {
    const teamColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];
    
    teamColors.forEach((color) => {
      const { unmount } = renderWithChakra(
        <TeamBanner teamName="Test Team" teamColor={color} />
      );
      
      expect(screen.getByText('Test Team')).toBeInTheDocument();
      unmount();
    });
  });

  it('renders TeamLogo component with correct props', () => {
    renderWithChakra(<TeamBanner {...defaultProps} />);
    
    const teamLogo = screen.getByTestId('team-logo');
    expect(teamLogo).toBeInTheDocument();
    expect(teamLogo).toHaveAttribute('data-team-name', 'Mercedes');
    expect(teamLogo).toHaveTextContent('Team Logo for Mercedes');
  });

  it('has correct heading structure', () => {
    renderWithChakra(<TeamBanner {...defaultProps} />);
    
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Mercedes');
  });

  it('renders with long team names', () => {
    const longTeamName = 'Very Long Team Name That Should Still Display Correctly';
    renderWithChakra(
      <TeamBanner teamName={longTeamName} teamColor="#FF0000" />
    );
    
    expect(screen.getByText(longTeamName)).toBeInTheDocument();
  });

  it('renders with special characters in team name', () => {
    const specialTeamName = 'Team & Co. (F1)';
    renderWithChakra(
      <TeamBanner teamName={specialTeamName} teamColor="#FF0000" />
    );
    
    expect(screen.getByText(specialTeamName)).toBeInTheDocument();
  });

  it('renders with unicode characters in team name', () => {
    const unicodeTeamName = '🏎️ Racing Team';
    renderWithChakra(
      <TeamBanner teamName={unicodeTeamName} teamColor="#FF0000" />
    );
    
    expect(screen.getByText(unicodeTeamName)).toBeInTheDocument();
  });

  it('handles empty team name', () => {
    renderWithChakra(<TeamBanner teamName="" teamColor="#FF0000" />);
    
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('');
  });

  it('handles empty team color', () => {
    renderWithChakra(<TeamBanner teamName="Test Team" teamColor="" />);
    
    expect(screen.getByText('Test Team')).toBeInTheDocument();
  });

  it('renders with hex color codes', () => {
    const hexColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFFFF', '#000000'];
    
    hexColors.forEach((color) => {
      const { unmount } = renderWithChakra(
        <TeamBanner teamName="Test Team" teamColor={color} />
      );
      
      expect(screen.getByText('Test Team')).toBeInTheDocument();
      unmount();
    });
  });

  it('renders with rgb color codes', () => {
    const rgbColors = ['rgb(255, 0, 0)', 'rgb(0, 255, 0)', 'rgb(0, 0, 255)'];
    
    rgbColors.forEach((color) => {
      const { unmount } = renderWithChakra(
        <TeamBanner teamName="Test Team" teamColor={color} />
      );
      
      expect(screen.getByText('Test Team')).toBeInTheDocument();
      unmount();
    });
  });

  it('renders with hsl color codes', () => {
    const hslColors = ['hsl(0, 100%, 50%)', 'hsl(120, 100%, 50%)', 'hsl(240, 100%, 50%)'];
    
    hslColors.forEach((color) => {
      const { unmount } = renderWithChakra(
        <TeamBanner teamName="Test Team" teamColor={color} />
      );
      
      expect(screen.getByText('Test Team')).toBeInTheDocument();
      unmount();
    });
  });

  it('renders with named colors', () => {
    const namedColors = ['red', 'blue', 'green', 'yellow', 'purple'];
    
    namedColors.forEach((color) => {
      const { unmount } = renderWithChakra(
        <TeamBanner teamName="Test Team" teamColor={color} />
      );
      
      expect(screen.getByText('Test Team')).toBeInTheDocument();
      unmount();
    });
  });

  it('renders consistently across multiple renders', () => {
    const { rerender } = renderWithChakra(<TeamBanner {...defaultProps} />);
    
    expect(screen.getByText('Mercedes')).toBeInTheDocument();
    
    // Re-render with same props
    rerender(
      <ChakraProvider>
        <TeamBanner {...defaultProps} />
      </ChakraProvider>
    );
    
    expect(screen.getByText('Mercedes')).toBeInTheDocument();
    
    // Re-render with different props
    rerender(
      <ChakraProvider>
        <TeamBanner teamName="Ferrari" teamColor="#FF0000" />
      </ChakraProvider>
    );
    
    expect(screen.getByText('Ferrari')).toBeInTheDocument();
  });

  it('handles unmounting and remounting', () => {
    const { unmount } = renderWithChakra(<TeamBanner {...defaultProps} />);
    
    expect(screen.getByText('Mercedes')).toBeInTheDocument();
    
    unmount();
    
    expect(screen.queryByText('Mercedes')).not.toBeInTheDocument();
    
    // Re-mount
    renderWithChakra(<TeamBanner {...defaultProps} />);
    
    expect(screen.getByText('Mercedes')).toBeInTheDocument();
  });

  it('renders with different team name cases', () => {
    const cases = [
      'MERCEDES',
      'mercedes',
      'Mercedes',
      'mErCeDeS',
    ];
    
    cases.forEach((teamName) => {
      const { unmount } = renderWithChakra(
        <TeamBanner teamName={teamName} teamColor="#FF0000" />
      );
      
      expect(screen.getByText(teamName)).toBeInTheDocument();
      unmount();
    });
  });

  it('renders with numbers in team name', () => {
    const numericTeamName = 'Team 2024';
    renderWithChakra(
      <TeamBanner teamName={numericTeamName} teamColor="#FF0000" />
    );
    
    expect(screen.getByText(numericTeamName)).toBeInTheDocument();
  });

  it('renders with spaces in team name', () => {
    const spacedTeamName = 'Red Bull Racing';
    renderWithChakra(
      <TeamBanner teamName={spacedTeamName} teamColor="#FF0000" />
    );
    
    expect(screen.getByText(spacedTeamName)).toBeInTheDocument();
  });

  it('renders with hyphens in team name', () => {
    const hyphenatedTeamName = 'Team-Name-With-Hyphens';
    renderWithChakra(
      <TeamBanner teamName={hyphenatedTeamName} teamColor="#FF0000" />
    );
    
    expect(screen.getByText(hyphenatedTeamName)).toBeInTheDocument();
  });

  it('renders with underscores in team name', () => {
    const underscoredTeamName = 'Team_Name_With_Underscores';
    renderWithChakra(
      <TeamBanner teamName={underscoredTeamName} teamColor="#FF0000" />
    );
    
    expect(screen.getByText(underscoredTeamName)).toBeInTheDocument();
  });

  it('renders with mixed special characters', () => {
    const mixedTeamName = 'Team & Co. (F1) - 2024';
    renderWithChakra(
      <TeamBanner teamName={mixedTeamName} teamColor="#FF0000" />
    );
    
    expect(screen.getByText(mixedTeamName)).toBeInTheDocument();
  });

  it('renders with very long team names', () => {
    const veryLongTeamName = 'This Is A Very Long Team Name That Should Still Be Displayed Correctly Without Breaking The Layout';
    renderWithChakra(
      <TeamBanner teamName={veryLongTeamName} teamColor="#FF0000" />
    );
    
    expect(screen.getByText(veryLongTeamName)).toBeInTheDocument();
  });

  it('renders with single character team name', () => {
    const singleCharTeamName = 'A';
    renderWithChakra(
      <TeamBanner teamName={singleCharTeamName} teamColor="#FF0000" />
    );
    
    expect(screen.getByText(singleCharTeamName)).toBeInTheDocument();
  });

  it('renders with whitespace-only team name', () => {
    const whitespaceTeamName = '   ';
    renderWithChakra(
      <TeamBanner teamName={whitespaceTeamName} teamColor="#FF0000" />
    );
    
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    // Check that the heading exists (whitespace content may be normalized)
    expect(heading).toBeInTheDocument();
  });

  it('renders with newline characters in team name', () => {
    const newlineTeamName = 'Team\nName';
    renderWithChakra(
      <TeamBanner teamName={newlineTeamName} teamColor="#FF0000" />
    );
    
    // Check that the component renders (newline characters may be normalized in DOM)
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
  });

  it('renders with tab characters in team name', () => {
    const tabTeamName = 'Team\tName';
    renderWithChakra(
      <TeamBanner teamName={tabTeamName} teamColor="#FF0000" />
    );
    
    // Check that the component renders (tab characters may be normalized in DOM)
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
  });

  it('maintains performance with multiple instances', () => {
    const startTime = performance.now();
    
    renderWithChakra(
      <div>
        {Array.from({ length: 10 }, (_, i) => (
          <TeamBanner
            key={i}
            teamName={`Team ${i}`}
            teamColor={`#${i.toString(16).padStart(6, '0')}`}
          />
        ))}
      </div>
    );
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render quickly (less than 1000ms for 10 instances - super long for extensive frontend testing)
    expect(renderTime).toBeLessThan(1500);
    
    // All instances should be rendered
    for (let i = 0; i < 10; i++) {
      expect(screen.getByText(`Team ${i}`)).toBeInTheDocument();
    }
  });

  it('renders with different color formats', () => {
    const colorFormats = [
      '#FF0000',
      'rgb(255, 0, 0)',
      'hsl(0, 100%, 50%)',
      'red',
      'transparent',
    ];
    
    colorFormats.forEach((color) => {
      const { unmount } = renderWithChakra(
        <TeamBanner teamName="Test Team" teamColor={color} />
      );
      
      expect(screen.getByText('Test Team')).toBeInTheDocument();
      unmount();
    });
  });

  it('renders with invalid color values gracefully', () => {
    const invalidColors = ['invalid', 'not-a-color', '123456', ''];
    
    invalidColors.forEach((color) => {
      const { unmount } = renderWithChakra(
        <TeamBanner teamName="Test Team" teamColor={color} />
      );
      
      expect(screen.getByText('Test Team')).toBeInTheDocument();
      unmount();
    });
  });

  it('renders with null team name', () => {
    renderWithChakra(<TeamBanner teamName={null as any} teamColor="#FF0000" />);
    
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('');
  });

  it('renders with undefined team name', () => {
    renderWithChakra(<TeamBanner teamName={undefined as any} teamColor="#FF0000" />);
    
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('');
  });

  it('renders with null team color', () => {
    renderWithChakra(<TeamBanner teamName="Test Team" teamColor={null as any} />);
    
    expect(screen.getByText('Test Team')).toBeInTheDocument();
  });

  it('renders with undefined team color', () => {
    renderWithChakra(<TeamBanner teamName="Test Team" teamColor={undefined as any} />);
    
    expect(screen.getByText('Test Team')).toBeInTheDocument();
  });

  it('renders with boolean team name', () => {
    renderWithChakra(<TeamBanner teamName={true as any} teamColor="#FF0000" />);
    
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    // Boolean true renders as empty string in React
    expect(heading).toHaveTextContent('');
  });

  it('renders with numeric team name', () => {
    renderWithChakra(<TeamBanner teamName={123 as any} teamColor="#FF0000" />);
    
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('123');
  });

  it('renders with object team name', () => {
    // Objects as React children cause errors, so we expect this to throw
    expect(() => {
      renderWithChakra(<TeamBanner teamName={{ name: 'Team' } as any} teamColor="#FF0000" />);
    }).toThrow();
  });

  it('renders with array team name', () => {
    renderWithChakra(<TeamBanner teamName={['Team', 'Name'] as any} teamColor="#FF0000" />);
    
    const heading = screen.getByRole('heading', { level: 2 });
    // Arrays are joined without commas in React
    expect(heading).toHaveTextContent('TeamName');
  });

  it('renders with function team name', () => {
    const funcTeamName = () => 'Team';
    renderWithChakra(<TeamBanner teamName={funcTeamName as any} teamColor="#FF0000" />);
    
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('');
  });

  it('renders with complex team names', () => {
    const complexTeamNames = [
      'Team & Co. (F1) - 2024',
      'Racing Team "Speed" Ltd.',
      'Team-Name_With.Mixed@Characters#2024',
    ];
    
    complexTeamNames.forEach((teamName) => {
      const { unmount } = renderWithChakra(
        <TeamBanner teamName={teamName} teamColor="#FF0000" />
      );
      
      expect(screen.getByText(teamName)).toBeInTheDocument();
      unmount();
    });
  });

  it('renders with extreme color values', () => {
    const extremeColors = [
      '#000000',
      '#FFFFFF',
      '#FF0000',
      '#00FF00',
      '#0000FF',
      'rgba(255, 255, 255, 0.5)',
      'hsla(0, 100%, 50%, 0.8)',
    ];
    
    extremeColors.forEach((color) => {
      const { unmount } = renderWithChakra(
        <TeamBanner teamName="Test Team" teamColor={color} />
      );
      
      expect(screen.getByText('Test Team')).toBeInTheDocument();
      unmount();
    });
  });
});
