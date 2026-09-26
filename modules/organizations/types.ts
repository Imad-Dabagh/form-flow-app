import type { OrganizationPrimaryColor } from "./lib/primary-color-theme";

export type OrganizationRole = "ADMIN" | "MANAGER" | "USER";

export interface OrganizationSummary {
  id: string;
  name: string;
  slug: string;
  logo: string;
  primaryColor: OrganizationPrimaryColor;
  role: OrganizationRole | null;
}
