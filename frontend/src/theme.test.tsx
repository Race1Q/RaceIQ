import React from "react";
import { describe, it, expect } from "vitest";
import { ChakraProvider, Button } from "@chakra-ui/react";
import { render, screen } from "@testing-library/react";
import theme from "./theme";

describe("Chakra theme", () => {
  it("has the expected color mode configuration", () => {
    // initialColorMode and useSystemColorMode should match your config
    expect(theme.config?.initialColorMode).toBe("dark");
    expect(theme.config?.useSystemColorMode).toBe(true);
  });

  it("exposes the expected custom color tokens (as CSS var strings)", () => {
    // We only assert the strings; JSDOM won't resolve CSS variables
    expect(theme.colors?.primaryRed).toBe("var(--color-primary-red)");
    expect(theme.colors?.backgroundDark).toBe("var(--color-background-dark)");
    expect(theme.colors?.surfaceGray).toBe("var(--color-surface-gray)");
    expect(theme.colors?.surfaceDark).toBe("var(--color-surface-dark)");
    expect(theme.colors?.textLight).toBe("var(--color-text-light)");
    expect(theme.colors?.textMedium).toBe("var(--color-text-medium)");
  });

  it("uses the expected font variables", () => {
    expect(theme.fonts?.heading).toBe("var(--font-display)");
    expect(theme.fonts?.body).toBe("var(--font-primary)");
  });

  it("has global styles wired to your CSS variables", () => {
    // Verify that the global style object contains the expected values
    const globalHtmlBody = (theme.styles as any)?.global?.["html, body"];
    expect(globalHtmlBody).toBeTruthy();
    expect(globalHtmlBody.backgroundColor).toBe("var(--color-background-dark)");
    expect(globalHtmlBody.color).toBe("var(--color-text-light)");
  });

  it("can render a component with ChakraProvider using this theme", () => {
    render(
      <ChakraProvider theme={theme}>
        <Button>Test Button</Button>
      </ChakraProvider>
    );
    // Sanity check that Chakra renders with our theme without throwing
    expect(screen.getByRole("button", { name: /test button/i })).toBeInTheDocument();
  });
});
