"use client";

import useSWR, { useSWRConfig, type SWRConfiguration } from "swr";
import useSWRMutation, {
  type SWRMutationConfiguration,
} from "swr/mutation";
import type { ApiError } from "@/lib/api-error";
import { requestData } from "@/lib/request";
import type { OrganizationPrimaryColor } from "@/modules/organizations/lib/primary-color-theme";
import type {
  AddOrganizationMemberResult,
  OrganizationMemberLookup,
  OrganizationSummary,
  OrganizationTeamMember,
  OrganizationTeamRole,
} from "@/modules/organizations/types";

export interface CreateOrganizationInput {
  logo?: string;
  name: string;
  primaryColor?: OrganizationPrimaryColor;
  slug: string;
}

export interface UpdateOrganizationInput {
  logo: string;
  name: string;
  primaryColor: OrganizationPrimaryColor;
  slogan: string;
  shortDescription: string;
}

type OrganizationDetails = Omit<OrganizationSummary, "role">;

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
 * GET /api/orgs/:organizationSlug/members
 */
export function useOrganizationMembers(
  organizationSlug: string,
  swrConfig?: SWRConfiguration<OrganizationTeamMember[], ApiError>,
) {
  const { data, ...rest } = useSWR<OrganizationTeamMember[], ApiError>(
    organizationSlug ? `/orgs/${organizationSlug}/members` : null,
    (url) => requestData<OrganizationTeamMember[]>({ method: "GET", url }),
    swrConfig,
  );

  return { members: data ?? [], ...rest };
}

/**
 * GET /api/orgs/:organizationSlug/members/lookup?email=...
 */
export function useOrganizationMemberLookup(organizationSlug: string, email: string) {
  const key = organizationSlug && email
    ? `/orgs/${organizationSlug}/members/lookup?email=${encodeURIComponent(email)}`
    : null;
  const { data, ...rest } = useSWR<OrganizationMemberLookup, ApiError>(
    key,
    (url: string) => requestData<OrganizationMemberLookup>({ method: "GET", url }),
  );
  return { lookup: data ?? null, ...rest };
}

/**
 * POST /api/orgs/:organizationSlug/members
 */
export function useAddOrganizationMember(organizationSlug: string) {
  const { mutate } = useSWRConfig();
  const { trigger: add, ...rest } = useSWRMutation<
    AddOrganizationMemberResult,
    ApiError,
    string,
    { email: string; role: OrganizationTeamRole }
  >(
    `/orgs/${organizationSlug}/members`,
    (url, { arg }) => requestData<AddOrganizationMemberResult>({ method: "POST", url, data: arg }),
  );

  async function trigger(input: { email: string; role: OrganizationTeamRole }) {
    const result = await add(input);
    if (result.kind === "member") await mutate(`/orgs/${organizationSlug}/members`);
    return result;
  }
  return { trigger, ...rest };
}

/**
 * PUT /api/orgs/:organizationSlug/members/:membershipId
 */
export function useUpdateOrganizationMember(organizationSlug: string, membershipId: string) {
  const { mutate } = useSWRConfig();
  const { trigger: update, ...rest } = useSWRMutation<
    { id: string; role: OrganizationTeamRole },
    ApiError,
    string,
    { role: OrganizationTeamRole }
  >(
    `/orgs/${organizationSlug}/members/${membershipId}`,
    (url, { arg }) => requestData<{ id: string; role: OrganizationTeamRole }>({ method: "PUT", url, data: arg }),
  );

  async function trigger(role: OrganizationTeamRole) {
    const result = await update({ role });
    await mutate(`/orgs/${organizationSlug}/members`);
    await mutate("/orgs");
    return result;
  }
  return { trigger, ...rest };
}

/**
 * DELETE /api/orgs/:organizationSlug/members/:membershipId
 */
export function useRemoveOrganizationMember(organizationSlug: string, membershipId: string) {
  const { mutate } = useSWRConfig();
  const { trigger: remove, ...rest } = useSWRMutation<
    { id: string },
    ApiError,
    string,
    void
  >(
    `/orgs/${organizationSlug}/members/${membershipId}`,
    (url) => requestData<{ id: string }>({ method: "DELETE", url }),
  );

  async function trigger() {
    const result = await remove();
    await mutate(`/orgs/${organizationSlug}/members`);
    await mutate("/orgs");
    return result;
  }
  return { trigger, ...rest };
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

/**
 * PUT /api/orgs/:organizationSlug
 */
export function useUpdateOrganization(organizationSlug: string) {
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
