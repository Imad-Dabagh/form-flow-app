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

interface OrganizationPrimaryColorTheme {
  base: string;
  primaryForeground: string;
}

const primaryColorThemes = {
  blue: {
    base: "oklch(0.623 0.214 259.815)",
    primaryForeground: "oklch(0.985 0 0)",
  },
  indigo: {
    base: "oklch(0.585 0.233 277.117)",
    primaryForeground: "oklch(0.985 0 0)",
  },
  purple: {
    base: "oklch(0.627 0.265 303.9)",
    primaryForeground: "oklch(0.985 0 0)",
  },
  pink: {
    base: "oklch(0.656 0.241 354.308)",
    primaryForeground: "oklch(0.985 0 0)",
  },
  red: {
    base: "oklch(0.637 0.237 25.331)",
    primaryForeground: "oklch(0.985 0 0)",
  },
  orange: {
    base: "oklch(0.705 0.213 47.604)",
    primaryForeground: "oklch(0.145 0 0)",
  },
  amber: {
    base: "oklch(0.769 0.188 70.08)",
    primaryForeground: "oklch(0.145 0 0)",
  },
  green: {
    base: "oklch(0.723 0.219 149.579)",
    primaryForeground: "oklch(0.145 0 0)",
  },
  emerald: {
    base: "oklch(0.696 0.17 162.48)",
    primaryForeground: "oklch(0.145 0 0)",
  },
  teal: {
    base: "oklch(0.704 0.14 182.503)",
    primaryForeground: "oklch(0.145 0 0)",
  },
  sky: {
    base: "oklch(0.685 0.169 237.323)",
    primaryForeground: "oklch(0.145 0 0)",
  },
} as const satisfies Record<
  OrganizationPrimaryColor,
  OrganizationPrimaryColorTheme
>;

export function getOrganizationThemeStyle(
  color: OrganizationPrimaryColor,
): CSSProperties {
  const theme = primaryColorThemes[color] ?? primaryColorThemes.blue;
  const tint = (weight: number) =>
    `color-mix(in oklch, ${theme.base} ${weight}%, white)`;
  const shade = (weight: number) =>
    `color-mix(in oklch, ${theme.base} ${weight}%, black)`;

  return {
    "--primary-50": tint(6),
    "--primary-100": tint(12),
    "--primary-200": tint(24),
    "--primary-300": tint(42),
    "--primary-400": tint(68),
    "--primary-500": theme.base,
    "--primary-600": shade(88),
    "--primary-700": shade(72),
    "--primary-800": shade(58),
    "--primary-900": shade(45),
    "--primary-950": shade(30),
    "--primary": "var(--primary-500)",
    "--primary-foreground": theme.primaryForeground,
    "--ring": "var(--primary-500)",
    "--sidebar-primary": "var(--primary-500)",
    "--sidebar-primary-foreground": theme.primaryForeground,
    "--sidebar-ring": "var(--primary-500)",
  } as CSSProperties;
}
