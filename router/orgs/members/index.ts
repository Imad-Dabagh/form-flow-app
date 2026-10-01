"use client";

import useSWR, { useSWRConfig, type SWRConfiguration } from "swr";
import useSWRMutation from "swr/mutation";
import type { ApiError } from "@/lib/api-error";
import { requestData } from "@/lib/request";
import type {
  AddOrganizationMemberResult,
  OrganizationMemberLookup,
  OrganizationTeamMember,
  OrganizationTeamRole,
} from "../types";

/** GET /api/orgs/:organizationSlug/members */
export function useFindAll(
  { organizationSlug }: { organizationSlug: string },
  swrConfig?: SWRConfiguration<OrganizationTeamMember[], ApiError>,
) {
  const { data, ...rest } = useSWR<OrganizationTeamMember[], ApiError>(
    organizationSlug ? `/orgs/${organizationSlug}/members` : null,
    (url) => requestData<OrganizationTeamMember[]>({ method: "GET", url }),
    swrConfig,
  );

  return { members: data ?? [], ...rest };
}

/** GET /api/orgs/:organizationSlug/members/lookup?email=... */
export function useFindByEmail({
  organizationSlug,
  email,
}: {
  organizationSlug: string;
  email: string;
}) {
  const key =
    organizationSlug && email
      ? `/orgs/${organizationSlug}/members/lookup?email=${encodeURIComponent(email)}`
      : null;
  const { data, ...rest } = useSWR<OrganizationMemberLookup, ApiError>(key, (url: string) =>
    requestData<OrganizationMemberLookup>({ method: "GET", url }),
  );

  return { lookup: data ?? null, ...rest };
}

/** POST /api/orgs/:organizationSlug/members */
export function useCreateOne({ organizationSlug }: { organizationSlug: string }) {
  const { mutate } = useSWRConfig();
  const { trigger: add, ...rest } = useSWRMutation<
    AddOrganizationMemberResult,
    ApiError,
    string,
    { email: string; role: OrganizationTeamRole }
  >(`/orgs/${organizationSlug}/members`, (url, { arg }) =>
    requestData<AddOrganizationMemberResult>({ method: "POST", url, data: arg }),
  );

  async function trigger(input: { email: string; role: OrganizationTeamRole }) {
    const result = await add(input);
    if (result.kind === "member") await mutate(`/orgs/${organizationSlug}/members`);
    void mutate(`/orgs/${organizationSlug}/invitations`);
    return result;
  }

  return { trigger, ...rest };
}

/** PUT /api/orgs/:organizationSlug/members/:membershipId */
export function useUpdateById({
  organizationSlug,
  membershipId,
}: {
  organizationSlug: string;
  membershipId: string;
}) {
  const { mutate } = useSWRConfig();
  const { trigger: update, ...rest } = useSWRMutation<
    { id: string; role: OrganizationTeamRole },
    ApiError,
    string,
    { role: OrganizationTeamRole }
  >(`/orgs/${organizationSlug}/members/${membershipId}`, (url, { arg }) =>
    requestData<{ id: string; role: OrganizationTeamRole }>({ method: "PUT", url, data: arg }),
  );

  async function trigger(input: { role: OrganizationTeamRole }) {
    const result = await update(input);
    await mutate(`/orgs/${organizationSlug}/members`);
    await mutate("/orgs");
    return result;
  }

  return { trigger, ...rest };
}

/** DELETE /api/orgs/:organizationSlug/members/:membershipId */
export function useDeleteById({
  organizationSlug,
  membershipId,
}: {
  organizationSlug: string;
  membershipId: string;
}) {
  const { mutate } = useSWRConfig();
  const { trigger: remove, ...rest } = useSWRMutation<{ id: string }, ApiError, string, void>(
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
