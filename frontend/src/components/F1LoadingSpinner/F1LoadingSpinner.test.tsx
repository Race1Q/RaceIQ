import React from "react";
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { ChakraProvider } from "@chakra-ui/react";
import F1LoadingSpinner from "./F1LoadingSpinner";
import { ThemeColorProvider } from "../../context/ThemeColorContext";

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
    profile: null,
    favoriteConstructor: null,
    favoriteDriver: null,
    loading: false,
  }),
}));

// Mock Framer Motion
vi.mock("framer-motion", () => ({
  motion: {
    svg: ({ children, className, viewBox, ...props }: any) => (
      <svg className={className} viewBox={viewBox} {...props}>
        {children}
      </svg>
    ),
    path: ({ className, d, initial, animate, transition, ...props }: any) => (
      <path className={className} d={d} {...props} />
    ),
    div: ({ children, className, initial, animate, onUpdate, transition, ...props }: any) => {
      // Don't trigger onUpdate in tests to avoid state update issues
      return (
        <div className={className} {...props}>
          {children}
        </div>
      );
    },
  },
}));

// Mock CSS module with correct class names from the actual component
vi.mock("./F1LoadingSpinner.module.css", () => ({
  default: {
    loadingText: "loadingText",
    speedometer: "speedometer",
    outerRing: "outerRing",
    arcSvg: "arcSvg",
    arcPath: "arcPath",
    dial: "dial",
    marking: "marking",
    major: "major",
    number: "number",
    logo: "logo",
    digitalDisplay: "digitalDisplay",
    needle: "needle",
    needlePivot: "needlePivot",
  },
}));

// Mock the RaceIQ logo
vi.mock("/race_IQ_logo.svg", () => ({
  default: "mocked-race-iq-logo.svg"
}));

// Helper function to render with Chakra UI
function renderWithProviders(ui: React.ReactNode) {
  return render(
    <ChakraProvider>
      <ThemeColorProvider>
        {ui}
      </ThemeColorProvider>
    </ChakraProvider>
  );
}

describe("F1LoadingSpinner Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the loading text passed via props", () => {
    renderWithProviders(<F1LoadingSpinner text="Loading Drivers..." />);
    expect(screen.getByText("Loading Drivers...")).toBeInTheDocument();
  });

  it("renders the speedometer container and dial", () => {
    renderWithProviders(<F1LoadingSpinner text="Loading..." />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();

    // Core elements using the correct class names
    expect(document.querySelector(".speedometer")).toBeInTheDocument();
    expect(document.querySelector(".dial")).toBeInTheDocument();
    expect(document.querySelector(".needle")).toBeInTheDocument();
  });

  it("renders 7 markings and 7 numbers on the speedometer", () => {
    renderWithProviders(<F1LoadingSpinner text="Loading..." />);
    
    const markings = document.querySelectorAll(".marking");
    const numbers = document.querySelectorAll(".number");
    expect(markings).toHaveLength(7);
    expect(numbers).toHaveLength(7);

    // Check that speedometer numbers are rendered (use getAllByText for "0" since it appears twice)
    const zeroElements = screen.getAllByText("0");
    expect(zeroElements).toHaveLength(2); // One in speedometer, one in digital display
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("150")).toBeInTheDocument();
    expect(screen.getByText("200")).toBeInTheDocument();
    expect(screen.getByText("250")).toBeInTheDocument();
    expect(screen.getByText("300")).toBeInTheDocument();
  });

  it("renders all speedometer components", () => {
    renderWithProviders(<F1LoadingSpinner text="Loading..." />);
    
    // Check all major components are present
    expect(document.querySelector(".outerRing")).toBeInTheDocument();
    expect(document.querySelector(".arcSvg")).toBeInTheDocument();
    expect(document.querySelector(".arcPath")).toBeInTheDocument();
    expect(document.querySelector(".logo")).toBeInTheDocument();
    expect(document.querySelector(".digitalDisplay")).toBeInTheDocument();
    expect(document.querySelector(".needlePivot")).toBeInTheDocument();
  });

  it("displays the digital speed display", () => {
    renderWithProviders(<F1LoadingSpinner text="Loading..." />);
    
    // The digital display should show a number (initially 0)
    const digitalDisplay = document.querySelector(".digitalDisplay");
    expect(digitalDisplay).toBeInTheDocument();
    
    // Check that it contains a text element (the speed number)
    expect(digitalDisplay?.querySelector("p")).toBeInTheDocument();
  });

  it("renders the RaceIQ logo", () => {
    renderWithProviders(<F1LoadingSpinner text="Loading..." />);
    
    const logo = document.querySelector(".logo");
    expect(logo).toBeInTheDocument();
    // Logo element exists (src attribute depends on how the component renders it)
  });

  it("has proper heading structure", () => {
    renderWithProviders(<F1LoadingSpinner text="Loading Data..." />);
    
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Loading Data...");
  });

  it("applies correct CSS classes to elements", () => {
    renderWithProviders(<F1LoadingSpinner text="Loading..." />);
    
    // Check that elements have the expected CSS classes
    const speedometer = document.querySelector(".speedometer");
    expect(speedometer).toBeInTheDocument();
    
    const dial = document.querySelector(".dial");
    expect(dial).toBeInTheDocument();
    
    const needle = document.querySelector(".needle");
    expect(needle).toBeInTheDocument();
  });

  it("renders major markings with correct styling", () => {
    renderWithProviders(<F1LoadingSpinner text="Loading..." />);
    
    const majorMarkings = document.querySelectorAll(".marking.major");
    expect(majorMarkings).toHaveLength(3); // Positions 0, 3, 6 (0, 150, 300)
  });

  it("handles different text props", () => {
    const testTexts = [
      "Loading Drivers...",
      "Loading Race Data...",
      "Processing Results...",
      "Fetching Statistics..."
    ];

    testTexts.forEach((text) => {
      const { unmount } = renderWithProviders(<F1LoadingSpinner text={text} />);
      expect(screen.getByText(text)).toBeInTheDocument();
      unmount();
    });
  });
});

describe("F1LoadingSpinner Integration Tests", () => {
  it("works correctly with Chakra UI theme", () => {
    renderWithProviders(<F1LoadingSpinner text="Loading..." />);
    
    // Component should render without theme-related errors
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(document.querySelector(".speedometer")).toBeInTheDocument();
  });

  it("maintains accessibility with proper heading structure", () => {
    renderWithProviders(<F1LoadingSpinner text="Loading Drivers..." />);
    
    // Check that the heading is properly structured
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Loading Drivers...");
  });

  it("renders multiple instances correctly", () => {
    const { unmount: unmount1 } = renderWithProviders(
      <F1LoadingSpinner text="First Loading..." />
    );
    
    expect(screen.getByText("First Loading...")).toBeInTheDocument();
    expect(document.querySelector(".speedometer")).toBeInTheDocument();
    
    unmount1();
    
    const { unmount: unmount2 } = renderWithProviders(
      <F1LoadingSpinner text="Second Loading..." />
    );
    
    expect(screen.getByText("Second Loading...")).toBeInTheDocument();
    expect(document.querySelector(".speedometer")).toBeInTheDocument();
    
    unmount2();
  });
});

describe("F1LoadingSpinner Animation Tests", () => {
  it("handles speed calculation correctly", () => {
    renderWithProviders(<F1LoadingSpinner text="Loading..." />);
    
    // The digital display should be present and show a number
    const digitalDisplay = document.querySelector(".digitalDisplay");
    expect(digitalDisplay).toBeInTheDocument();
    
    // The speed should be displayed as a number
    const speedText = digitalDisplay?.querySelector("p");
    expect(speedText).toBeInTheDocument();
  });

  it("renders animated components without errors", () => {
    renderWithProviders(<F1LoadingSpinner text="Loading..." />);
    
    // The component should render without errors
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(document.querySelector(".speedometer")).toBeInTheDocument();
    
    // Check that animated elements are present
    expect(document.querySelector(".arcSvg")).toBeInTheDocument();
    expect(document.querySelector(".arcPath")).toBeInTheDocument();
    expect(document.querySelector(".needle")).toBeInTheDocument();
  });
});
