// frontend/src/components/F1LoadingSpinner/F1LoadingSpinner.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import F1LoadingSpinner from "./F1LoadingSpinner";

// Mock CSS so className lookups don't break
vi.mock("./F1LoadingSpinner.module.css", () => ({
  default: {
    loadingContainer: "loadingContainer",
    loadingText: "loadingText",
    speedometer: "speedometer",
    speedometerDial: "speedometerDial",
    speedometerNeedle: "speedometerNeedle",
    speedometerMarkings: "speedometerMarkings",
    speedometerMarking: "speedometerMarking",
    major: "major",
    speedometerNumbers: "speedometerNumbers",
    speedometerNumber: "speedometerNumber",
  },
}), { virtual: true });

describe("F1LoadingSpinner", () => {
  it("renders the loading text passed via props", () => {
    render(<F1LoadingSpinner text="Loading Drivers..." />);
    expect(screen.getByText("Loading Drivers...")).toBeInTheDocument();
  });

  it("renders the speedometer container and dial", () => {
    render(<F1LoadingSpinner text="Loading..." />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();

    // Core elements (query via class since this is purely presentational)
    expect(document.querySelector(".speedometer")).toBeInTheDocument();
    expect(document.querySelector(".speedometerDial")).toBeInTheDocument();
    expect(document.querySelector(".speedometerNeedle")).toBeInTheDocument();
  });

  it("renders 7 markings and 7 numbers on the speedometer", () => {
    render(<F1LoadingSpinner text="Loading..." />);
    const markings = document.querySelectorAll(".speedometerMarking");
    const numbers = document.querySelectorAll(".speedometerNumber");
    expect(markings).toHaveLength(7);
    expect(numbers).toHaveLength(7);

    // spot-check a number
    expect(screen.getByText("300")).toBeInTheDocument();
  });
});
