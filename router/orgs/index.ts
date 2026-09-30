"use client";

import useSWR, { useSWRConfig, type SWRConfiguration } from "swr";
import useSWRMutation, {
  type SWRMutationConfiguration,
} from "swr/mutation";
import type { ApiError } from "@/lib/api-error";
import { requestData } from "@/lib/request";
import type {
  CreateOrganizationInput,
  OrganizationSummary,
  UpdateOrganizationInput,
} from "./types";

export * as forms from "./forms";
export * as invitations from "./invitations";
export * as members from "./members";

type OrganizationDetails = Omit<OrganizationSummary, "role">;

/** GET /api/orgs */
export function useFindAll(
  swrConfig?: SWRConfiguration<OrganizationSummary[], ApiError>,
) {
  const { data, ...rest } = useSWR<OrganizationSummary[], ApiError>(
    "/orgs",
    (url) => requestData<OrganizationSummary[]>({ method: "GET", url }),
    swrConfig,
  );

  return { organizations: data ?? [], ...rest };
}

/** POST /api/orgs */
export function useCreateOne(
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

  return { organization: data ?? null, ...rest };
}

/** PUT /api/orgs/:organizationSlug */
export function useUpdateBySlug({ organizationSlug }: { organizationSlug: string }) {
  const { mutate } = useSWRConfig();
  const { trigger: update, ...rest } = useSWRMutation<
    OrganizationDetails,
    ApiError,
    string,
    UpdateOrganizationInput
  >(
    `/orgs/${organizationSlug}`,
    (url, { arg }) =>
      requestData<OrganizationDetails>({ method: "PUT", url, data: arg }),
  );

  async function trigger(input: UpdateOrganizationInput) {
    const updated = await update(input);
    await mutate<OrganizationSummary[]>(
      "/orgs",
      (current) =>
        current?.map((organization) =>
          organization.id === updated.id
            ? { ...organization, ...updated }
            : organization,
        ) ?? [],
      { revalidate: false },
    );
    return updated;
  }

  return { trigger, ...rest };
}
