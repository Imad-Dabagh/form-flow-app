"use client";

import useSWR from "swr";
import API from "@/router";
import type { OrganizationSummary } from "../types";

export function useOrganizations() {
  const result = useSWR<OrganizationSummary[]>(
    "/orgs",
    API.organizations.getOrganizations,
  );

  return {
    organizations: result.data ?? [],
    error: result.error,
    isLoading: result.isLoading,
  };
}
