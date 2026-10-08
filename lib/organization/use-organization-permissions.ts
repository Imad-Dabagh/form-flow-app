"use client";

import { useCurrentProfileContext } from "@/modules/profile/current-profile-context";
import { useOrganizationWorkspace } from "./organization-workspace-context";

export function useOrganizationPermissions() {
  const { role } = useOrganizationWorkspace();
  const { isSuperAdmin } = useCurrentProfileContext();

  return {
    canManageOrganization: isSuperAdmin || role === "ADMIN",
    canManageForms: isSuperAdmin || role === "ADMIN" || role === "MANAGER",
    accessLabel: isSuperAdmin ? "Platform administrator" : (role ?? "Member"),
  };
}
