"use client";

import type { ReactNode } from "react";
import { useParams } from "next/navigation";
import { OrganizationWorkspaceProvider } from "@/modules/organizations/organization-workspace-context";
import API from "@/router";

export function OrganizationAccessBoundary({ children }: { children: ReactNode }) {
  const { organizationSlug } = useParams<{ organizationSlug: string }>();
  const { organizations, error, isLoading } = API.orgs.useFindAll();
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
    <OrganizationWorkspaceProvider organization={organization}>
      {children}
    </OrganizationWorkspaceProvider>
  );
}
