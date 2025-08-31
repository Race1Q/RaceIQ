import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { vi, describe, it, expect } from 'vitest';
import AboutUs from './AboutUs';

// Mock CSS module
vi.mock('./AboutUs.module.css', () => ({ default: {} }), { virtual: true });

// Mock HeroSection to avoid external image work
vi.mock('../../components/HeroSection/HeroSection', () => ({
  default: ({ title, subtitle }: any) => (
    <section data-testid="hero">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </section>
  ),
}));

// Mock TeamMemberCard for stable counting
vi.mock('../../components/TeamMemberCard/TeamMemberCard', () => ({
  default: ({ name, role }: any) => (
    <div role="listitem">
      <span>{name}</span> — <span>{role}</span>
    </div>
  ),
}));

function renderWithProviders(ui: React.ReactElement) {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
}

describe('AboutUs page', () => {
  it('renders and shows key section headings', () => {
    renderWithProviders(<AboutUs />);

    // Hero
    expect(screen.getByTestId('hero')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /beyond the finish line/i })
    ).toBeInTheDocument();

    // Sections
    expect(screen.getByRole('heading', { name: /what we offer/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /the team/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /powered by/i })).toBeInTheDocument();
  });

  it('renders exactly 6 team members', () => {
    renderWithProviders(<AboutUs />);
    const members = screen.getAllByRole('listitem');
    expect(members).toHaveLength(6);

    // Spot checks
    expect(screen.getByText(/^Abdullah$/)).toBeInTheDocument();
    expect(screen.getByText(/^MA$/)).toBeInTheDocument(); // exact match avoids conflicts with "Umayr"
  });

  it('renders 5 tech items; 4 are images with alts; OpenF1 uses icon only', () => {
    renderWithProviders(<AboutUs />);

    const techNames = ['React', 'NestJS', 'Supabase', 'Auth0', 'OpenF1 API'];
    techNames.forEach((name) => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });

    ['React', 'NestJS', 'Supabase', 'Auth0'].forEach((name) => {
      const img = screen.getByAltText(name);
      expect(img).toBeInTheDocument();
    });

    expect(screen.queryByAltText('OpenF1 API')).not.toBeInTheDocument();
  });
});
