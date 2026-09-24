"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import API from "@/router";
import { organizationManagePath } from "../paths";

export function OrganizationEntry() {
  const router = useRouter();
  const { organizations, error, isLoading } =
    API.organizations.useOrganizations();

  useEffect(() => {
    if (organizations[0]) {
      router.replace(organizationManagePath(organizations[0].slug, "/dashboard"));
    }
  }, [organizations, router]);

  if (isLoading || organizations[0]) {
    return (
      <div className="grid min-h-screen place-items-center px-6 text-sm text-muted-foreground">
        Loading your organizations…
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center px-6 text-center text-sm text-muted-foreground">
        We couldn&apos;t load your organizations. Refresh the page and try again.
      </div>
    );
  }

  return (
    <div className="grid min-h-screen place-items-center px-6 text-center">
      <div className="max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight">No organization yet</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Create an organization to start building forms. Organization setup is the next workspace step.
        </p>
      </div>
    </div>
  );
}
