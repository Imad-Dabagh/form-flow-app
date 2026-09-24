"use client";

import useSWR, { type SWRConfiguration } from "swr";
import useSWRMutation, {
  type SWRMutationConfiguration,
} from "swr/mutation";
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

/**
 * POST /api/orgs
 */
export function useCreateOrganization(
  swrConfig?: SWRMutationConfiguration<
    OrganizationSummary,
    ApiError,
    string,
    CreateOrganizationInput,
    OrganizationSummary[]
  >,
) {
  const { data, ...rest } = useSWRMutation<
    OrganizationSummary,
    ApiError,
    string,
    CreateOrganizationInput,
    OrganizationSummary[]
  >(
    "/orgs",
    (url, { arg }) =>
      requestData<OrganizationSummary>({ method: "POST", url, data: arg }),
    swrConfig,
  );

  return {
    organization: data ?? null,
    ...rest,
  };
}
