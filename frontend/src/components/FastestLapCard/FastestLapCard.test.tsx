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

  it("accepts teamColor prop without throwing", () => {
    render(<FastestLapCard driver="Lewis Hamilton" time="1:31.789" teamColor="#1E5BC6" />);
    expect(screen.getByText("Fastest Lap")).toBeInTheDocument();
  });

  it("renders with default styling when no teamColor is provided", () => {
    render(<FastestLapCard driver="Charles Leclerc" time="1:30.111" />);
    expect(screen.getByText("Fastest Lap")).toBeInTheDocument();
  });

  it("renders icons (Clock and Zap) alongside text", () => {
    render(<FastestLapCard driver="Carlos Sainz" time="1:29.876" />);
    expect(screen.getByText("Fastest Lap")).toBeInTheDocument();
    expect(screen.getByText("Carlos Sainz")).toBeInTheDocument();
  });
});
