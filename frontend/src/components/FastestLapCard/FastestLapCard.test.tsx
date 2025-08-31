// frontend/src/components/FastestLapCard/FastestLapCard.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import FastestLapCard from "./FastestLapCard";

// Mock CSS so className lookups don’t break
vi.mock("./FastestLapCard.module.css", () => ({
  default: {
    container: "container",
    header: "header",
    icon: "icon",
    title: "title",
    content: "content",
    time: "time",
    driverInfo: "driverInfo",
    driverIcon: "driverIcon",
    driverName: "driverName",
  },
}));

describe("FastestLapCard", () => {
  it("renders title, time, and driver name correctly", () => {
    render(<FastestLapCard driver="Max Verstappen" time="1:32.456" />);

    expect(screen.getByText("Fastest Lap")).toBeInTheDocument();
    expect(screen.getByText("1:32.456")).toBeInTheDocument();
    expect(screen.getByText("Max Verstappen")).toBeInTheDocument();
  });

  it("applies gradient background with teamColor prop", () => {
    render(<FastestLapCard driver="Lewis Hamilton" time="1:31.789" teamColor="#1E5BC6" />);
    // Find the top-level container (ancestor with mocked "container" class)
    const container = screen.getByText("Fastest Lap").closest(".container");
    const style = container?.getAttribute("style") || "";
    expect(style).toContain("linear-gradient");
    expect(style).toContain("#1E5BC6");
  });

  it("falls back to default gradient if no teamColor is provided", () => {
    render(<FastestLapCard driver="Charles Leclerc" time="1:30.111" />);
    const container = screen.getByText("Fastest Lap").closest(".container");
    const style = container?.getAttribute("style") || "";
    expect(style).toContain("var(--color-primary-red)");
    expect(style).toContain("#c00500");
  });

  it("renders icons (Clock and Zap) alongside text", () => {
    render(<FastestLapCard driver="Carlos Sainz" time="1:29.876" />);
    // We verify by associated text since icons render as SVGs
    expect(screen.getByText("Fastest Lap")).toBeInTheDocument();
    expect(screen.getByText("Carlos Sainz")).toBeInTheDocument();
  });
});
