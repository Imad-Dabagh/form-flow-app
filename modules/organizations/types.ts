import type { OrganizationPrimaryColor } from "./lib/primary-color-theme";

export type OrganizationRole = "ADMIN" | "MANAGER" | "USER";
export type OrganizationTeamRole = Extract<OrganizationRole, "ADMIN" | "MANAGER">;

export interface OrganizationTeamMember {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePic: string;
  role: OrganizationTeamRole;
  joinedAt: string;
}

export type OrganizationMemberLookup =
  | { kind: "existing"; email: string; name: string; profilePic: string; currentRole: OrganizationRole | null }
  | { kind: "pending"; email: string; role: OrganizationTeamRole }
  | { kind: "invite"; email: string };

export type AddOrganizationMemberResult =
  | { kind: "member"; id: string }
  | { kind: "invited"; id: string };

export interface OrganizationSummary {
  id: string;
  name: string;
  slug: string;
  logo: string;
  primaryColor: OrganizationPrimaryColor;
  slogan: string;
  shortDescription: string;
  role: OrganizationRole | null;
}
