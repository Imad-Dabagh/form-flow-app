import type { CSSProperties } from "react";

export const ORGANIZATION_PRIMARY_COLORS = [
  "blue",
  "indigo",
  "purple",
  "pink",
  "red",
  "orange",
  "amber",
  "green",
  "emerald",
  "teal",
  "sky",
] as const;

export type OrganizationPrimaryColor =
  (typeof ORGANIZATION_PRIMARY_COLORS)[number];

export type OrganizationThemeMode = "light" | "dark";

interface OrganizationPrimaryColorTheme {
  base: string;
  lightForeground: string;
}

const primaryColorThemes = {
  blue: {
    base: "oklch(0.623 0.214 259.815)",
    lightForeground: "oklch(0.985 0 0)",
  },
  indigo: {
    base: "oklch(0.585 0.233 277.117)",
    lightForeground: "oklch(0.985 0 0)",
  },
  purple: {
    base: "oklch(0.627 0.265 303.9)",
    lightForeground: "oklch(0.985 0 0)",
  },
  pink: {
    base: "oklch(0.656 0.241 354.308)",
    lightForeground: "oklch(0.985 0 0)",
  },
  red: {
    base: "oklch(0.637 0.237 25.331)",
    lightForeground: "oklch(0.985 0 0)",
  },
  // Black Text on light backgrounds is oklch(0.145 0 0)
  orange: {
    base: "oklch(0.705 0.213 47.604)",
    lightForeground: "oklch(0.145 0 0)",
  },
  amber: {
    base: "oklch(0.769 0.188 70.08)",
    lightForeground: "oklch(0.145 0 0)",
  },
  green: {
    base: "oklch(0.723 0.219 149.579)",
    lightForeground: "oklch(0.145 0 0)",
  },
  emerald: {
    base: "oklch(0.696 0.17 162.48)",
    lightForeground: "oklch(0.145 0 0)",
  },
  teal: {
    base: "oklch(0.704 0.14 182.503)",
    lightForeground: "oklch(0.145 0 0)",
  },
  sky: {
    base: "oklch(0.685 0.169 237.323)",
    lightForeground: "oklch(0.145 0 0)",
  },
} as const satisfies Record<
  OrganizationPrimaryColor,
  OrganizationPrimaryColorTheme
>;

export function getOrganizationThemeStyle(
  color: OrganizationPrimaryColor,
  mode: OrganizationThemeMode = "light",
): CSSProperties {
  const theme = primaryColorThemes[color] ?? primaryColorThemes.blue;
  const tint = (weight: number) =>
    `color-mix(in oklch, ${theme.base} ${weight}%, white)`;
  const shade = (weight: number) =>
    `color-mix(in oklch, ${theme.base} ${weight}%, black)`;
  const isDark = mode === "dark";
  const primaryForeground = isDark
    ? "oklch(0.145 0 0)"
    : theme.lightForeground;

  return {
    "--primary-50": tint(6),
    "--primary-100": tint(12),
    "--primary-200": tint(24),
    "--primary-300": tint(42),
    "--primary-400": isDark ? tint(48) : tint(68),
    "--primary-500": isDark ? tint(58) : theme.base,
    "--primary-600": isDark ? tint(68) : shade(88),
    "--primary-700": isDark ? theme.base : shade(72),
    "--primary-800": isDark ? shade(88) : shade(58),
    "--primary-900": isDark ? shade(72) : shade(45),
    "--primary-950": isDark ? shade(58) : shade(30),
    "--primary": "var(--primary-500)",
    "--primary-foreground": primaryForeground,
    "--ring": "var(--primary-500)",
    "--sidebar-primary": "var(--primary-500)",
    "--sidebar-primary-foreground": primaryForeground,
    "--sidebar-ring": "var(--primary-500)",
  } as CSSProperties;
}
