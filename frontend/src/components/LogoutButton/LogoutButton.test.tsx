import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import LogoutButton from "./LogoutButton";

// Create mock
const logoutMock = vi.fn();

// Mock Auth0
vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    logout: logoutMock,
  }),
}));

describe("LogoutButton", () => {
  beforeEach(() => {
    logoutMock.mockClear();
  });

  it("renders the Log Out button", () => {
    render(<LogoutButton />);
    expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument();
  });

  it("calls logout with correct params when clicked", () => {
    render(<LogoutButton />);
    fireEvent.click(screen.getByRole("button", { name: /log out/i }));

    expect(logoutMock).toHaveBeenCalledTimes(1);
    expect(logoutMock).toHaveBeenCalledWith({
      logoutParams: { returnTo: window.location.origin },
    });
  });
});
