"use client";

import useSWR, { type SWRConfiguration } from "swr";
import type { ApiError } from "@/lib/api-error";
import { requestData } from "@/lib/request";
import type { OrganizationSummary } from "@/modules/organizations/types";

export interface CreateOrganizationInput {
  name: string;
  slug: string;
}

/**
 * GET /api/orgs
 */
export function useOrganizations(
  swrConfig?: SWRConfiguration<OrganizationSummary[], ApiError>,
) {
  const { data, ...rest } = useSWR<OrganizationSummary[], ApiError>(
    "/orgs",
    (url) => requestData<OrganizationSummary[]>({ method: "GET", url }),
    swrConfig,
  );

  return {
    organizations: data ?? [],
    ...rest,
  };
}

export function createOrganization(
  input: CreateOrganizationInput,
): Promise<OrganizationSummary> {
  return requestData<OrganizationSummary>({
    method: "POST",
    url: "/orgs",
    data: input,
  });
}
