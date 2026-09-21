export type OrganizationRole = "ADMIN" | "MANAGER" | "USER";

export interface OrganizationSummary {
  id: string;
  name: string;
  slug: string;
  logo: string;
  primaryColor: string;
  role: OrganizationRole;
}
