import React from "react";
import { describe, it, expect } from "vitest";
import { ChakraProvider, Button } from "@chakra-ui/react";
import { render, screen } from "@testing-library/react";
import theme, { createTheme } from "./styles/theme";

describe("Chakra theme", () => {
  it("has the expected color mode configuration", () => {
    expect(theme.config?.initialColorMode).toBe("dark");
    expect(theme.config?.useSystemColorMode).toBe(true);
  });

  it("exposes a colors object", () => {
    expect(theme.colors).toBeTruthy();
    expect(typeof theme.colors).toBe("object");
  });

  it("uses the expected font families (by name)", () => {
    expect(typeof theme.fonts?.heading).toBe("string");
    expect(typeof theme.fonts?.body).toBe("string");
  });

  it("has global styles object present", () => {
    const globalHtmlBody = (theme.styles as any)?.global?.["html, body"];
    expect(globalHtmlBody).toBeTruthy();
  });

  it("can render a component with ChakraProvider using this theme", () => {
    render(
      <ChakraProvider theme={theme}>
        <Button>Test Button</Button>
      </ChakraProvider>
    );
    expect(screen.getByRole("button", { name: /test button/i })).toBeInTheDocument();
  });

  it("creates dynamic themes with different accent colors", () => {
    const redTheme = createTheme('e10600');
    const blueTheme = createTheme('3671C6');
    const greenTheme = createTheme('00ff00');

    // Test that semantic tokens use the provided accent color
    expect(redTheme.semanticTokens?.colors?.['border-accent']?.default).toBe('#e10600');
    expect(blueTheme.semanticTokens?.colors?.['border-accent']?.default).toBe('#3671C6');
    expect(greenTheme.semanticTokens?.colors?.['border-accent']?.default).toBe('#00ff00');

    // Test icon-accent tokens as well
    expect(redTheme.semanticTokens?.colors?.['icon-accent']?.default).toBe('#e10600');
    expect(blueTheme.semanticTokens?.colors?.['icon-accent']?.default).toBe('#3671C6');
    expect(greenTheme.semanticTokens?.colors?.['icon-accent']?.default).toBe('#00ff00');
  });

  it("uses default F1 red color when no accent color provided", () => {
    const defaultTheme = createTheme();
    expect(defaultTheme.semanticTokens?.colors?.['border-accent']?.default).toBe('#e10600');
    expect(defaultTheme.semanticTokens?.colors?.['icon-accent']?.default).toBe('#e10600');
  });
});
