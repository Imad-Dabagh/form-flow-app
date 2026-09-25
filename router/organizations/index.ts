"use client";

import useSWR, { useSWRConfig, type SWRConfiguration } from "swr";
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
  const { mutate } = useSWRConfig();
  const configuredOnSuccess = swrConfig?.onSuccess;
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
    {
      populateCache: (createdOrganization, currentOrganizations = []) => {
        const firstLowerRoleIndex = currentOrganizations.findIndex(
          (organization) => organization.role !== "ADMIN",
        );

        if (firstLowerRoleIndex === -1) {
          return [...currentOrganizations, createdOrganization];
        }

        return [
          ...currentOrganizations.slice(0, firstLowerRoleIndex),
          createdOrganization,
          ...currentOrganizations.slice(firstLowerRoleIndex),
        ];
      },
      revalidate: false,
      ...swrConfig,
      onSuccess: (createdOrganization, key, config) => {
        void mutate("/me");
        configuredOnSuccess?.(createdOrganization, key, config);
      },
    },
  );

  return {
    organization: data ?? null,
    ...rest,
  };
}
