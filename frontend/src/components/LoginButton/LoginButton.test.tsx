import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import LoginButton from "./LoginButton";

// Create a shared mock we can assert on
const loginWithRedirectMock = vi.fn();

// Mock the Auth0 hook using Vitest
vi.mock("@auth0/auth0-react", () => {
  return {
    useAuth0: () => ({
      loginWithRedirect: loginWithRedirectMock,
    }),
  };
});

describe("LoginButton", () => {
  beforeEach(() => {
    loginWithRedirectMock.mockClear();
  });

  it("renders the Login or Sign Up button", () => {
    render(<LoginButton />);
    // Prefer accessible name first
    const btn = screen.getByRole("button", { name: /login or sign up/i });
    expect(btn).toBeInTheDocument();
  });

  it("calls loginWithRedirect when clicked", async () => {
    render(<LoginButton />);
    const btn = screen.getByRole("button", { name: /login or sign up/i });
    await userEvent.click(btn);
    expect(loginWithRedirectMock).toHaveBeenCalledTimes(1);
  });
});
