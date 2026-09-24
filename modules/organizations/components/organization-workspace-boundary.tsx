"use client";

import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import { useParams } from "next/navigation";
import API from "@/router";
import type { OrganizationSummary } from "../types";

const OrganizationWorkspaceContext = createContext<OrganizationSummary | null>(null);

export function useOrganizationWorkspace(): OrganizationSummary {
  const organization = useContext(OrganizationWorkspaceContext);

  if (!organization) {
    throw new Error("useOrganizationWorkspace must be used within OrganizationWorkspaceBoundary.");
  }

  return organization;
}

export function OrganizationWorkspaceBoundary({ children }: { children: ReactNode }) {
  const { organizationSlug } = useParams<{ organizationSlug: string }>();
  const { organizations, error, isLoading } =
    API.organizations.useOrganizations();
  const organization = organizations.find(
    (candidate) => candidate.slug === organizationSlug,
  );

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center px-6 text-sm text-muted-foreground">
        Loading organization…
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="grid min-h-screen place-items-center px-6 text-center text-sm text-muted-foreground">
        You do not have access to this organization.
      </div>
    );
  }

  return (
    <OrganizationWorkspaceContext.Provider value={organization}>
      {children}
    </OrganizationWorkspaceContext.Provider>
  );
}
