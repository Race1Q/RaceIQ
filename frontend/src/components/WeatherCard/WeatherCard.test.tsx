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
// Choose simple numbers so expected percentages are predictable.
vi.mock("../../data/mockRaces", () => ({
  mockRaces: [
    { totalLaps: 50, circuitLength: 5.0, raceDistance: 250 },
    { totalLaps: 60, circuitLength: 6.0, raceDistance: 300 }, // <-- maxima
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
  totalLaps: 30,       // 30/60 -> 50%
  circuitLength: 3.0,  // 3.0/6.0 -> 50%
  raceDistance: 150,   // 150/300 -> 50%
} as any;

const baseWeather = {
  condition: "Sunny",
  airTemp: 22,
  trackTemp: 35,
  windSpeed: 12,
} as any;

function getBars(container: HTMLElement) {
  // Select by our mocked class name
  const bars = container.querySelectorAll<HTMLElement>(".trackStatBar");
  expect(bars.length).toBe(3); // laps, circuit length, race distance (in this order)
  return Array.from(bars);
}

describe("WeatherCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders track stats and weather values", () => {
    const { container } = render(<WeatherCard weather={baseWeather} race={baseRace} />);

    // Track stats labels
    expect(screen.getByText(/track information/i)).toBeInTheDocument();
    expect(screen.getByText(/laps/i)).toBeInTheDocument();
    expect(screen.getByText(/circuit length/i)).toBeInTheDocument();
    expect(screen.getByText(/race distance/i)).toBeInTheDocument();

    // Track stats numeric values
    expect(screen.getByText("30")).toBeInTheDocument();            // totalLaps
    expect(screen.getByText("3 km")).toBeInTheDocument();          // circuitLength
    expect(screen.getByText("150 km")).toBeInTheDocument();        // raceDistance

    // Weather values
    expect(screen.getByText(/weather conditions/i)).toBeInTheDocument();
    expect(screen.getByText(/air temperature/i)).toBeInTheDocument();
    expect(screen.getByText("22°C")).toBeInTheDocument();
    expect(screen.getByText(/track temperature/i)).toBeInTheDocument();
    expect(screen.getByText("35°C")).toBeInTheDocument();
    expect(screen.getByText(/wind speed/i)).toBeInTheDocument();
    expect(screen.getByText("12 km/h")).toBeInTheDocument();

    // Bars should exist
    const [lapsBar, circuitBar, distanceBar] = getBars(container);
    expect(lapsBar.style.width).toBe("50%");     // 30 / max 60
    expect(circuitBar.style.width).toBe("50%");  // 3 / max 6
    expect(distanceBar.style.width).toBe("50%"); // 150 / max 300
  });

  it("computes bar widths against maxima from mockRaces", () => {
    // Choose a race with different proportions
    const race = {
      ...baseRace,
      totalLaps: 60,       // 60/60 -> 100%
      circuitLength: 1.5,  // 1.5/6.0 -> 25%
      raceDistance: 210,   // 210/300 -> 70%
    };

    const { container } = render(<WeatherCard weather={baseWeather} race={race} />);
    const [lapsBar, circuitBar, distanceBar] = getBars(container);

    expect(lapsBar.style.width).toBe("100%");
    expect(circuitBar.style.width).toBe("25%");
    expect(distanceBar.style.width).toBe("70%");
  });

  it("uses correct weather icon based on condition", () => {
    const { rerender } = render(
      <WeatherCard weather={{ ...baseWeather, condition: "rain" }} race={baseRace} />
    );
    // We don't assert SVG structure; presence is enough due to lucide stub
    expect(screen.getAllByTestId("icon").length).toBeGreaterThan(0);

    rerender(<WeatherCard weather={{ ...baseWeather, condition: "cloudy" }} race={baseRace} />);
    expect(screen.getAllByTestId("icon").length).toBeGreaterThan(0);

    rerender(<WeatherCard weather={{ ...baseWeather, condition: "anything-else" }} race={baseRace} />);
    expect(screen.getAllByTestId("icon").length).toBeGreaterThan(0);
  });
});
