import React, { isValidElement, cloneElement } from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import WinsPerSeasonChart from "./WinsPerSeasonChart";

// --- Make CSS module class names stable for querying ---
vi.mock("./WinsPerSeasonChart.module.css", () => ({
  default: {
    card: "card",
    cardHeader: "cardHeader",
    heading: "heading",
    cardBody: "cardBody",
    chart: "chart",
    xAxis: "xAxis",
    yAxis: "yAxis",
    bar: "bar",
    tooltip: "tooltip",
    tooltipLabel: "tooltipLabel",
    tooltipValue: "tooltipValue",
  },
}));

// --- Mock Recharts to simple DOM stubs that expose props we care about ---
// We avoid real SVG rendering issues in JSDOM and assert via data-* attributes.
vi.mock("recharts", async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ResponsiveContainer: React.FC<any> = ({ children }) => (
    <div data-testid="responsive">{children}</div>
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const BarChart: React.FC<any> = ({ data, children, className }) => (
    <div data-testid="barchart" data-count={Array.isArray(data) ? data.length : 0} className={className}>
      {children}
    </div>
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const XAxis: React.FC<any> = ({ dataKey, className }) => (
    <div data-testid="xaxis" data-datakey={dataKey} className={className} />
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const YAxis: React.FC<any> = ({ className }) => <div data-testid="yaxis" className={className} />;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Bar: React.FC<any> = ({ dataKey, fill, className }) => (
    <div data-testid="bar" data-datakey={dataKey} data-fill={fill} className={className} />
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Tooltip: React.FC<any> = ({ content }) => (
    <div data-testid="tooltip">
      {/* Force the custom tooltip to render with deterministic values */}
      {isValidElement(content)
        ? cloneElement(content as React.ReactElement, {
            active: true,
            label: "2022",
            payload: [{ value: 5 }],
          })
        : null}
    </div>
  );

  return {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
  };
});

const data = [
  { season: "2021", wins: 3 },
  { season: "2022", wins: 5 },
  { season: "2023", wins: 2 },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("WinsPerSeasonChart", () => {
  it("renders heading and wires axes & data into the chart", () => {
    render(<WinsPerSeasonChart data={data} />);

    // Heading
    expect(screen.getByText(/wins per season/i)).toBeInTheDocument();

    // Our BarChart stub exposes data length
    const chart = screen.getByTestId("barchart");
    expect(chart).toHaveAttribute("data-count", "3");

    // X/Y axes props
    expect(screen.getByTestId("xaxis")).toHaveAttribute("data-datakey", "season");
    expect(screen.getByTestId("yaxis")).toBeInTheDocument();

    // Default bar fill should use CSS var when no teamColor is provided
    const bar = screen.getByTestId("bar");
    expect(bar).toHaveAttribute("data-datakey", "wins");
    expect(bar).toHaveAttribute("data-fill", "var(--color-primary-red)");
  });

  it("uses teamColor for bar fill when provided", () => {
    const teamColor = "#123456";
    render(<WinsPerSeasonChart data={[{ season: "2021", wins: 3 }]} teamColor={teamColor} />);

    const chart = screen.getByTestId("barchart");
    expect(chart).toHaveAttribute("data-count", "1");

    const bar = screen.getByTestId("bar");
    expect(bar).toHaveAttribute("data-fill", teamColor);
  });

  it("renders custom tooltip content with season and wins", () => {
    render(<WinsPerSeasonChart data={data} />);

    // Our Tooltip stub clones CustomTooltip with active=true, label="2022", payload=[{value:5}]
    // Those strings should be visible:
    expect(screen.getByText(/season:\s*2022/i)).toBeInTheDocument();
    expect(screen.getByText(/wins:\s*5/i)).toBeInTheDocument();
  });
});
