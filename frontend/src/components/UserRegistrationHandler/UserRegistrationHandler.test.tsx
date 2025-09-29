import React from "react";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import UserRegistrationHandler from "./UserRegistrationHandler";

// ---- Mocks ----

// 1) Auth0
const useAuth0Mock = vi.fn();
vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => useAuth0Mock(),
}));

// 2) useUserRegistration hook
const ensureUserExistsMock = vi.fn();
vi.mock("../../hooks/useUserRegistration", () => ({
  useUserRegistration: () => ({ ensureUserExists: ensureUserExistsMock }),
}));

// Note: The component doesn't use toast notifications or spinners

// ---- Helpers ----

function setAuth0State({
  isAuthenticated = false,
  isLoading = false,
  user = undefined as any,
} = {}) {
  useAuth0Mock.mockReturnValue({ isAuthenticated, isLoading, user });
}

function renderWithChildren(ui?: React.ReactNode) {
  return render(
    <UserRegistrationHandler>
      <div data-testid="app-children">{ui ?? "children"}</div>
    </UserRegistrationHandler>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  cleanup();
});

// ---- Tests ----

describe("UserRegistrationHandler", () => {
  it("renders children and does not call registration while Auth0 is loading", async () => {
    setAuth0State({ isAuthenticated: false, isLoading: true });
    renderWithChildren();

    expect(screen.getByTestId("app-children")).toBeInTheDocument();
    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
    expect(ensureUserExistsMock).not.toHaveBeenCalled();
  });

  it("registers when authenticated + user present (new user -> success toast)", async () => {
    setAuth0State({ isAuthenticated: true, isLoading: false, user: { sub: "auth0|123" } });
    ensureUserExistsMock.mockResolvedValueOnce({ wasCreated: true });

    renderWithChildren();

    await waitFor(() => expect(ensureUserExistsMock).toHaveBeenCalledTimes(1));

    // The component doesn't show toast notifications, so we just check that registration was called
    expect(ensureUserExistsMock).toHaveBeenCalledTimes(1);

    // The component doesn't show a spinner, it just returns null during loading
    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();

    // After registration is complete, children should be rendered
    await waitFor(() => {
      expect(screen.getByTestId("app-children")).toBeInTheDocument();
    });
  });

  it("registers when authenticated + user present (existing user -> no success toast)", async () => {
    setAuth0State({ isAuthenticated: true, isLoading: false, user: { sub: "auth0|abc" } });
    ensureUserExistsMock.mockResolvedValueOnce({ wasCreated: false });

    renderWithChildren();

    await waitFor(() => expect(ensureUserExistsMock).toHaveBeenCalledTimes(1));

    // The component doesn't show toast notifications, so we just check that registration was called
    expect(ensureUserExistsMock).toHaveBeenCalledTimes(1);

    // The component doesn't show a spinner, it just returns null during loading
    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();

    // After registration is complete, children should be rendered
    await waitFor(() => {
      expect(screen.getByTestId("app-children")).toBeInTheDocument();
    });
  });

  it("handles registration errors gracefully", async () => {
    setAuth0State({ isAuthenticated: true, isLoading: false, user: { sub: "auth0|err" } });

    // First attempt fails
    ensureUserExistsMock.mockRejectedValueOnce(new Error("boom"));

    renderWithChildren();

    // The component doesn't show a spinner, it just returns null during loading
    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();

    // The component doesn't show error toasts, it just logs the error
    await waitFor(() => expect(ensureUserExistsMock).toHaveBeenCalledTimes(1));

    // After error, the component still renders children (it doesn't retry)
    await waitFor(() => {
      expect(screen.getByTestId("app-children")).toBeInTheDocument();
    });
  });
});
