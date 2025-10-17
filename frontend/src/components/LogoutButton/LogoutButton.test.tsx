import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { ChakraProvider } from "@chakra-ui/react";
import LogoutButton from "./LogoutButton";
import { ThemeColorProvider } from "../../context/ThemeColorContext";

// Create mock
const logoutMock = vi.fn();

// Mock Auth0
vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    logout: logoutMock,
    isAuthenticated: true,
    user: { sub: 'test-user' },
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

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider>
      <ThemeColorProvider>
        {ui}
      </ThemeColorProvider>
    </ChakraProvider>
  );
};

describe("LogoutButton", () => {
  beforeEach(() => {
    logoutMock.mockClear();
  });

  it("renders the Log Out button", () => {
    renderWithProviders(<LogoutButton />);
    expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument();
  });

  it("calls logout with correct params when clicked", () => {
    renderWithProviders(<LogoutButton />);
    fireEvent.click(screen.getByRole("button", { name: /log out/i }));

    expect(logoutMock).toHaveBeenCalledTimes(1);
    expect(logoutMock).toHaveBeenCalledWith({
      logoutParams: { returnTo: window.location.origin },
    });
  });
});
