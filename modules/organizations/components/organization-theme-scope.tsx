"use client";

import { useLayoutEffect, useMemo, type ReactNode } from "react";
import {
  getOrganizationThemeStyle,
  type OrganizationPrimaryColor,
} from "../lib/primary-color-theme";

interface OrganizationThemeScopeProps {
  children: ReactNode;
  primaryColor: OrganizationPrimaryColor;
}

export function OrganizationThemeScope({
  children,
  primaryColor,
}: OrganizationThemeScopeProps) {
  const themeStyle = useMemo(
    () => getOrganizationThemeStyle(primaryColor),
    [primaryColor],
  );

  useLayoutEffect(() => {
    const root = document.documentElement;
    const previousValues = new Map<string, string>();

    for (const [property, value] of Object.entries(themeStyle)) {
      if (!property.startsWith("--") || value == null) {
        continue;
      }

      previousValues.set(property, root.style.getPropertyValue(property));
      root.style.setProperty(property, String(value));
    }

    return () => {
      for (const [property, previousValue] of previousValues) {
        if (previousValue) {
          root.style.setProperty(property, previousValue);
        } else {
          root.style.removeProperty(property);
        }
      }
    };
  }, [themeStyle]);

  return <div style={themeStyle}>{children}</div>;
}
