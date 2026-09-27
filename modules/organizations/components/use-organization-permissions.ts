"use client";

import { useAuthenticatedProfile } from "@/modules/auth";
import { useOrganizationWorkspace } from "./organization-workspace-boundary";

export function useOrganizationPermissions() {
  const { role } = useOrganizationWorkspace();
  const { isSuperAdmin } = useAuthenticatedProfile();

  return {
    canManageOrganization: isSuperAdmin || role === "ADMIN",
    canManageForms: isSuperAdmin || role === "ADMIN" || role === "MANAGER",
    accessLabel: isSuperAdmin ? "Platform administrator" : role ?? "Member",
  };
}
