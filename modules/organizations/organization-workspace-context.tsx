"use client";

import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import type { OrganizationSummary } from "@/router/orgs/types";

const OrganizationWorkspaceContext = createContext<OrganizationSummary | null>(null);

export function OrganizationWorkspaceProvider({
  children,
  organization,
}: {
  children: ReactNode;
  organization: OrganizationSummary;
}) {
  return (
    <OrganizationWorkspaceContext.Provider value={organization}>
      {children}
    </OrganizationWorkspaceContext.Provider>
  );
}

export function useOrganizationWorkspace(): OrganizationSummary {
  const organization = useContext(OrganizationWorkspaceContext);

  if (!organization) {
    throw new Error(
      "useOrganizationWorkspace must be used within OrganizationWorkspaceProvider.",
    );
  }

  return organization;
}
