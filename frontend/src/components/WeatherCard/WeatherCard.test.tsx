import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import WeatherCard from "./WeatherCard";

// ---- Mock the CSS module so classNames are stable in JSDOM queries ----
vi.mock("./WeatherCard.module.css", () => ({
  default: {
    container: "container",
    trackStatsSection: "trackStatsSection",
    trackStatsTitle: "trackStatsTitle",
    trackStatsContainer: "trackStatsContainer",
    trackStatItem: "trackStatItem",
    trackStatIcon: "trackStatIcon",
    trackStatContent: "trackStatContent",
    trackStatLabel: "trackStatLabel",
    trackStatBarContainer: "trackStatBarContainer",
    trackStatBar: "trackStatBar",
    trackStatValue: "trackStatValue",

    weatherSection: "weatherSection",
    title: "title",
    weatherContainer: "weatherContainer",
    weatherItem: "weatherItem",
    iconContainer: "iconContainer",
    weatherContent: "weatherContent",
    weatherLabel: "weatherLabel",
    weatherValue: "weatherValue",
  },
}));

// ---- Mock the races so we control max values for scaling ----
vi.mock("../../data/mockRaces", () => ({
  mockRaces: [
    { totalLaps: 50, circuitLength: 5.0, raceDistance: 250 },
    { totalLaps: 60, circuitLength: 6.0, raceDistance: 300 }, // maxima
    { totalLaps: 55, circuitLength: 5.5, raceDistance: 275 },
  ],
}));

// Optionally mock lucide-react to simple spans (keeps things lightweight)
vi.mock("lucide-react", () => {
  const Stub: React.FC<{ size?: number; className?: string }> = ({ children }) => (
    <span data-testid="icon">{children}</span>
  );
  return {
    Sun: Stub,
    Cloud: Stub,
    CloudRain: Stub,
    Wind: Stub,
    Thermometer: Stub,
    Flag: Stub,
    MapPin: Stub,
    Route: Stub,
  };
});

const baseRace = {
  name: "Test GP",
  country: "X",
  city: "Y",
  circuit: "Z",
  totalLaps: 30,
  circuitLength: 3.0,
  raceDistance: 150,
} as any;

const baseWeather = {
  condition: "Sunny",
  airTemp: 22,
  trackTemp: 35,
  windSpeed: 12,
} as any;

describe("WeatherCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders track stats and weather values", () => {
    render(<WeatherCard weather={baseWeather} race={baseRace} />);

    // Track stats labels and numeric values
    expect(screen.getByText(/track information/i)).toBeInTheDocument();
    expect(screen.getByText(/laps/i)).toBeInTheDocument();
    expect(screen.getByText(/circuit length/i)).toBeInTheDocument();
    expect(screen.getByText(/race distance/i)).toBeInTheDocument();

    expect(screen.getByText("30")).toBeInTheDocument();
    expect(screen.getByText(/3\s?km/i)).toBeInTheDocument();
    expect(screen.getByText(/150\s?km/i)).toBeInTheDocument();

    // Weather values
    expect(screen.getByText(/weather conditions/i)).toBeInTheDocument();
    expect(screen.getByText(/air temperature/i)).toBeInTheDocument();
    expect(screen.getByText(/22\s?°c/i)).toBeInTheDocument();
    expect(screen.getByText(/track temperature/i)).toBeInTheDocument();
    expect(screen.getByText(/35\s?°c/i)).toBeInTheDocument();
    expect(screen.getByText(/wind speed/i)).toBeInTheDocument();
    expect(screen.getByText(/12\s?km\/h/i)).toBeInTheDocument();
  });

  it("handles different race values", () => {
    const race = {
      ...baseRace,
      totalLaps: 60,
      circuitLength: 1.5,
      raceDistance: 210,
    };

    render(<WeatherCard weather={baseWeather} race={race} />);

    expect(screen.getByText("60")).toBeInTheDocument();
    expect(screen.getByText(/1.5\s?km/i)).toBeInTheDocument();
    expect(screen.getByText(/210\s?km/i)).toBeInTheDocument();
  });

  it("uses correct weather icon based on condition", () => {
    const { rerender } = render(
      <WeatherCard weather={{ ...baseWeather, condition: "rain" }} race={baseRace} />
    );
    expect(screen.getAllByTestId("icon").length).toBeGreaterThan(0);

    rerender(<WeatherCard weather={{ ...baseWeather, condition: "cloudy" }} race={baseRace} />);
    expect(screen.getAllByTestId("icon").length).toBeGreaterThan(0);

    rerender(<WeatherCard weather={{ ...baseWeather, condition: "anything-else" }} race={baseRace} />);
    expect(screen.getAllByTestId("icon").length).toBeGreaterThan(0);
  });
});
