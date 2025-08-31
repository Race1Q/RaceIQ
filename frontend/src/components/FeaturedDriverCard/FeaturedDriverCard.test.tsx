import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { vi, describe, it, expect } from 'vitest';
import FeaturedDriverCard from './FeaturedDriverCard';

// Mock CSS
vi.mock('./FeaturedDriverCard.module.css', () => ({
  default: {
    card: 'card',
    textContent: 'textContent',
    title: 'title',
    driverName: 'driverName',
    teamName: 'teamName',
    points: 'points',
    driverImage: 'driverImage',
    iconButton: 'iconButton',
  },
}), { virtual: true });

// Mock icon
vi.mock('lucide-react', () => ({
  ArrowUpRight: () => <div data-testid="arrow-icon" />,
}));

function renderWithProviders(ui: React.ReactElement) {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
}

describe('FeaturedDriverCard', () => {
  const mockProps = {
    title: 'Featured Driver',
    driverName: 'Max Verstappen',
    teamName: 'Red Bull Racing',
    points: 395,
    imageUrl: 'max.png',
    accentColor: '#1E5BC6',
  };

  it('renders correctly with all props and expected content', () => {
    renderWithProviders(<FeaturedDriverCard {...mockProps} />);

    // Root card presence → use the title as the anchor
    const title = screen.getByText(mockProps.title);
    expect(title).toBeInTheDocument();

    // Heading (driver name) and team
    expect(screen.getByRole('heading', { name: mockProps.driverName })).toBeInTheDocument();
    expect(screen.getByText(mockProps.teamName)).toBeInTheDocument();

    // Points → should render as "395Pts" (no space)
    expect(screen.getByText(/395\s*Pts/i)).toBeInTheDocument();

    // Driver image
    const driverImage = screen.getByAltText(mockProps.driverName);
    expect(driverImage).toBeInTheDocument();
    expect(driverImage).toHaveAttribute('src', mockProps.imageUrl);

    // Arrow icon
    expect(screen.getByTestId('arrow-icon')).toBeInTheDocument();
  });
});
