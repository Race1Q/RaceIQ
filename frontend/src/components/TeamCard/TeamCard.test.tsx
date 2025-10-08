// frontend/src/components/TeamCard/TeamCard.test.tsx
import { render, screen } from '@testing-library/react';
import { TeamCard } from './TeamCard';

describe('TeamCard', () => {
  it('renders without crashing', () => {
    const mockOnClick = jest.fn();
    render(
      <TeamCard
        teamKey="red_bull"
        countryName="Austria"
        countryFlagEmoji="🇦🇹"
        points={100}
        maxPoints={200}
        wins={5}
        podiums={10}
        carImage="/test-car.png"
        onClick={mockOnClick}
      />
    );
    expect(screen.getByText('Red Bull')).toBeInTheDocument();
  });
});

