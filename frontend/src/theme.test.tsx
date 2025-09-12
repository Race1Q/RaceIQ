import React from "react";
import { describe, it, expect } from "vitest";
import { ChakraProvider, Button } from "@chakra-ui/react";
import { render, screen } from "@testing-library/react";
import theme from "./styles/theme";

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
});
