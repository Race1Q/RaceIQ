import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import DriverDetailProfile from './DriverDetailProfile';

// Mock CSS modules
vi.mock('./DriverDetailProfile.module.css', () => ({
  default: {
    profileCard: 'profileCard',
    imageContainer: 'imageContainer',
    driverImage: 'driverImage',
    infoContainer: 'infoContainer',
    driverName: 'driverName',
    firstName: 'firstName',
    lastName: 'lastName',
    teamName: 'teamName',
    funFact: 'funFact'
  }
}));

// Mock the user icon asset
vi.mock('../../assets/UserIcon.png', () => ({
  default: 'mocked-user-icon.png'
}));

describe('DriverDetailProfile Component', () => {
  const defaultProps = {
    name: 'Max Verstappen',
    team: 'Red Bull Racing',
    imageUrl: 'https://example.com/max-verstappen.jpg',
    funFact: 'He won his first F1 race at the age of 18.'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders without crashing', () => {
    render(<DriverDetailProfile {...defaultProps} />);
    
    // Check for individual name parts since they're rendered in separate spans
    expect(screen.getByText('Max')).toBeInTheDocument();
    expect(screen.getByText('Verstappen')).toBeInTheDocument();
    expect(screen.getByText('Red Bull Racing')).toBeInTheDocument();
  });

  it('renders all required elements', () => {
    render(<DriverDetailProfile {...defaultProps} />);
    
    // Check for driver image
    const driverImage = screen.getByAltText('Max Verstappen');
    expect(driverImage).toBeInTheDocument();
    expect(driverImage).toHaveAttribute('src', 'https://example.com/max-verstappen.jpg');
    
    // Check for driver name
    expect(screen.getByText('Max')).toBeInTheDocument();
    expect(screen.getByText('Verstappen')).toBeInTheDocument();
    
    // Check for team name
    expect(screen.getByText('Red Bull Racing')).toBeInTheDocument();
    
    // Check for fun fact
    expect(screen.getByText('He won his first F1 race at the age of 18.')).toBeInTheDocument();
  });

  it('splits name correctly into first and last name', () => {
    render(<DriverDetailProfile {...defaultProps} />);
    
    // Check that the name is split correctly
    expect(screen.getByText('Max')).toBeInTheDocument();
    expect(screen.getByText('Verstappen')).toBeInTheDocument();
  });

  it('handles names with multiple last name parts', () => {
    const propsWithMultipleLastNames = {
      ...defaultProps,
      name: 'Carlos Sainz Jr.'
    };
    
    render(<DriverDetailProfile {...propsWithMultipleLastNames} />);
    
    expect(screen.getByText('Carlos')).toBeInTheDocument();
    expect(screen.getByText('Sainz Jr.')).toBeInTheDocument();
  });

  it('handles single name gracefully', () => {
    const propsWithSingleName = {
      ...defaultProps,
      name: 'Madonna'
    };
    
    render(<DriverDetailProfile {...propsWithSingleName} />);
    
    expect(screen.getByText('Madonna')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument(); // Default fallback
  });

  it('uses fallback image when imageUrl is null', () => {
    const propsWithNullImage = {
      ...defaultProps,
      imageUrl: null
    };
    
    render(<DriverDetailProfile {...propsWithNullImage} />);
    
    const driverImage = screen.getByAltText('Max Verstappen');
    expect(driverImage).toHaveAttribute('src', 'mocked-user-icon.png');
  });

  it('uses fallback image when imageUrl is undefined', () => {
    const propsWithUndefinedImage = {
      ...defaultProps,
      imageUrl: undefined as any
    };
    
    render(<DriverDetailProfile {...propsWithUndefinedImage} />);
    
    const driverImage = screen.getByAltText('Max Verstappen');
    expect(driverImage).toHaveAttribute('src', 'mocked-user-icon.png');
  });

  it('handles image loading error with fallback', () => {
    render(<DriverDetailProfile {...defaultProps} />);
    
    const driverImage = screen.getByAltText('Max Verstappen');
    
    // Simulate image loading error
    fireEvent.error(driverImage);
    
    expect(driverImage).toHaveAttribute('src', 'mocked-user-icon.png');
  });

  it('handles null name gracefully', () => {
    const propsWithNullName = {
      ...defaultProps,
      name: null as any
    };
    
    render(<DriverDetailProfile {...propsWithNullName} />);
    
    expect(screen.getByText('Driver')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('handles undefined name gracefully', () => {
    const propsWithUndefinedName = {
      ...defaultProps,
      name: undefined as any
    };
    
    render(<DriverDetailProfile {...propsWithUndefinedName} />);
    
    expect(screen.getByText('Driver')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('handles non-string name gracefully', () => {
    const propsWithNonStringName = {
      ...defaultProps,
      name: 123 as any
    };
    
    render(<DriverDetailProfile {...propsWithNonStringName} />);
    
    expect(screen.getByText('Driver')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('handles empty string name gracefully', () => {
    const propsWithEmptyName = {
      ...defaultProps,
      name: ''
    };
    
    render(<DriverDetailProfile {...propsWithEmptyName} />);
    
    expect(screen.getByText('Driver')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('handles null team gracefully', () => {
    const propsWithNullTeam = {
      ...defaultProps,
      team: null as any
    };
    
    render(<DriverDetailProfile {...propsWithNullTeam} />);
    
    expect(screen.getByText('Unknown Team')).toBeInTheDocument();
  });

  it('handles undefined team gracefully', () => {
    const propsWithUndefinedTeam = {
      ...defaultProps,
      team: undefined as any
    };
    
    render(<DriverDetailProfile {...propsWithUndefinedTeam} />);
    
    expect(screen.getByText('Unknown Team')).toBeInTheDocument();
  });

  it('handles empty string team gracefully', () => {
    const propsWithEmptyTeam = {
      ...defaultProps,
      team: ''
    };
    
    render(<DriverDetailProfile {...propsWithEmptyTeam} />);
    
    expect(screen.getByText('Unknown Team')).toBeInTheDocument();
  });

  it('handles null funFact gracefully', () => {
    const propsWithNullFunFact = {
      ...defaultProps,
      funFact: null as any
    };
    
    render(<DriverDetailProfile {...propsWithNullFunFact} />);
    
    expect(screen.getByText('Driver information is being loaded...')).toBeInTheDocument();
  });

  it('handles undefined funFact gracefully', () => {
    const propsWithUndefinedFunFact = {
      ...defaultProps,
      funFact: undefined as any
    };
    
    render(<DriverDetailProfile {...propsWithUndefinedFunFact} />);
    
    expect(screen.getByText('Driver information is being loaded...')).toBeInTheDocument();
  });

  it('handles empty string funFact gracefully', () => {
    const propsWithEmptyFunFact = {
      ...defaultProps,
      funFact: ''
    };
    
    render(<DriverDetailProfile {...propsWithEmptyFunFact} />);
    
    expect(screen.getByText('Driver information is being loaded...')).toBeInTheDocument();
  });
});

describe('DriverDetailProfile Edge Cases', () => {
  it('handles very long names correctly', () => {
    const longName = 'Jean-Pierre Jacques-Marie François de la Croix';
    const propsWithLongName = {
      name: longName,
      team: 'Test Team',
      imageUrl: 'test.jpg',
      funFact: 'Test fact'
    };
    
    render(<DriverDetailProfile {...propsWithLongName} />);
    
    expect(screen.getByText('Jean-Pierre')).toBeInTheDocument();
    expect(screen.getByText('Jacques-Marie François de la Croix')).toBeInTheDocument();
  });

  it('handles names with extra whitespace', () => {
    const propsWithWhitespace = {
      name: '  Max   Verstappen  ',
      team: 'Red Bull Racing',
      imageUrl: 'test.jpg',
      funFact: 'Test fact'
    };
    
    render(<DriverDetailProfile {...propsWithWhitespace} />);
    
    // The component doesn't trim whitespace, so '  Max   Verstappen  '.split(' ') becomes
    // ['', 'Max', 'Verstappen', ''] where firstName is empty string, so it defaults to 'Driver'
    expect(screen.getByText('Driver')).toBeInTheDocument();
    // Check that the lastName span contains the expected content (with whitespace)
    const lastNameSpan = document.querySelector('.lastName');
    expect(lastNameSpan?.textContent).toBe(' Max   Verstappen  ');
  });

  it('handles names with special characters', () => {
    const propsWithSpecialChars = {
      name: 'José María López',
      team: 'Test Team',
      imageUrl: 'test.jpg',
      funFact: 'Test fact'
    };
    
    render(<DriverDetailProfile {...propsWithSpecialChars} />);
    
    expect(screen.getByText('José')).toBeInTheDocument();
    expect(screen.getByText('María López')).toBeInTheDocument();
  });

  it('handles names with numbers', () => {
    const propsWithNumbers = {
      name: 'Driver 123 Test',
      team: 'Test Team',
      imageUrl: 'test.jpg',
      funFact: 'Test fact'
    };
    
    render(<DriverDetailProfile {...propsWithNumbers} />);
    
    expect(screen.getByText('Driver')).toBeInTheDocument();
    expect(screen.getByText('123 Test')).toBeInTheDocument();
  });

  it('renders with all props as empty strings', () => {
    const emptyProps = {
      name: '',
      team: '',
      imageUrl: '',
      funFact: ''
    };
    
    render(<DriverDetailProfile {...emptyProps} />);
    
    expect(screen.getByText('Driver')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Unknown Team')).toBeInTheDocument();
    expect(screen.getByText('Driver information is being loaded...')).toBeInTheDocument();
  });
});

describe('DriverDetailProfile Integration Tests', () => {
  it('renders complete profile with all valid data', () => {
    const completeProps = {
      name: 'Lewis Hamilton',
      team: 'Mercedes-AMG Petronas F1 Team',
      imageUrl: 'https://example.com/lewis-hamilton.jpg',
      funFact: 'Seven-time Formula 1 World Champion and advocate for diversity in motorsport.'
    };
    
    render(<DriverDetailProfile {...completeProps} />);
    
    // Check image
    const driverImage = screen.getByAltText('Lewis Hamilton');
    expect(driverImage).toBeInTheDocument();
    expect(driverImage).toHaveAttribute('src', 'https://example.com/lewis-hamilton.jpg');
    
    // Check name splitting
    expect(screen.getByText('Lewis')).toBeInTheDocument();
    expect(screen.getByText('Hamilton')).toBeInTheDocument();
    
    // Check team
    expect(screen.getByText('Mercedes-AMG Petronas F1 Team')).toBeInTheDocument();
    
    // Check fun fact
    expect(screen.getByText('Seven-time Formula 1 World Champion and advocate for diversity in motorsport.')).toBeInTheDocument();
  });

  it('maintains proper DOM structure', () => {
    render(<DriverDetailProfile name="Test Driver" team="Test Team" imageUrl="test.jpg" funFact="Test fact" />);
    
    // Check that the main container exists
    const profileCard = document.querySelector('.profileCard');
    expect(profileCard).toBeInTheDocument();
    
    // Check that image container exists
    const imageContainer = document.querySelector('.imageContainer');
    expect(imageContainer).toBeInTheDocument();
    
    // Check that info container exists
    const infoContainer = document.querySelector('.infoContainer');
    expect(infoContainer).toBeInTheDocument();
  });
});
