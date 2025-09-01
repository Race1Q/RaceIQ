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

// 3) Chakra toast
const toastFn = vi.fn();
vi.mock("@chakra-ui/react", () => ({
  useToast: () => toastFn,
}));

// 4) Spinner
vi.mock("../F1LoadingSpinner/F1LoadingSpinner", () => ({
  default: ({ text }: { text: string }) => (
    <div data-testid="spinner">{text}</div>
  ),
}));

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

    expect(toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Welcome to RaceIQ!",
        status: "success",
      })
    );

    await waitFor(() =>
      expect(screen.queryByTestId("spinner")).not.toBeInTheDocument()
    );

    expect(screen.getByTestId("app-children")).toBeInTheDocument();
  });

  it("registers when authenticated + user present (existing user -> no success toast)", async () => {
    setAuth0State({ isAuthenticated: true, isLoading: false, user: { sub: "auth0|abc" } });
    ensureUserExistsMock.mockResolvedValueOnce({ wasCreated: false });

    renderWithChildren();

    await waitFor(() => expect(ensureUserExistsMock).toHaveBeenCalledTimes(1));

    // No success toast for existing user
    expect(
      toastFn.mock.calls.find(([arg]) => arg?.status === "success")
    ).toBeUndefined();

    await waitFor(() =>
      expect(screen.queryByTestId("spinner")).not.toBeInTheDocument()
    );

    expect(screen.getByTestId("app-children")).toBeInTheDocument();
  });

  // ✅ Keep ONLY this error test (remove any duplicate)
  it("shows error toast and then finishes after a retry (reject once, then resolve)", async () => {
    setAuth0State({ isAuthenticated: true, isLoading: false, user: { sub: "auth0|err" } });

    // First attempt fails -> triggers error toast
    ensureUserExistsMock.mockRejectedValueOnce(new Error("boom"));
    // Subsequent attempts succeed -> loop can finish and spinner disappears
    ensureUserExistsMock.mockResolvedValue({ wasCreated: false });

    renderWithChildren();

    // Spinner appears during first attempt
    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    // Error toast from the first failure
    await waitFor(() =>
      expect(toastFn).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Registration Error",
          status: "error",
        })
      ),
      { timeout: 2000 }
    );

    // Ensure we actually retried (at least twice total)
    await waitFor(() => {
      expect(ensureUserExistsMock).toHaveBeenCalledTimes(2);
    });

    // After success, spinner should disappear and children render
    await waitFor(() =>
      expect(screen.queryByTestId("spinner")).not.toBeInTheDocument()
    );

    expect(await screen.findByTestId("app-children")).toBeInTheDocument();
  });
});
