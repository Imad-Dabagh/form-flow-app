import type { CSSProperties } from "react";

const primaryColorThemes = {
  blue: {
    primary: "oklch(0.546 0.245 262.881)",
    primaryForeground: "oklch(0.985 0 0)",
  },
  green: {
    primary: "oklch(0.527 0.154 150.069)",
    primaryForeground: "oklch(0.985 0 0)",
  },
  orange: {
    primary: "oklch(0.553 0.195 38.402)",
    primaryForeground: "oklch(0.985 0 0)",
  },
  purple: {
    primary: "oklch(0.558 0.288 302.321)",
    primaryForeground: "oklch(0.985 0 0)",
  },
  red: {
    primary: "oklch(0.505 0.213 27.518)",
    primaryForeground: "oklch(0.985 0 0)",
  },
} as const;

export type OrganizationPrimaryColor = keyof typeof primaryColorThemes;

export function getOrganizationThemeStyle(color: string): CSSProperties {
  const theme = primaryColorThemes[color as OrganizationPrimaryColor] ?? primaryColorThemes.blue;

  return {
    "--primary": theme.primary,
    "--primary-foreground": theme.primaryForeground,
    "--ring": theme.primary,
    "--sidebar-primary": theme.primary,
    "--sidebar-primary-foreground": theme.primaryForeground,
    "--sidebar-ring": theme.primary,
  } as CSSProperties;
}
