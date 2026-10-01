"use client";

import useSWR, { useSWRConfig, type SWRConfiguration } from "swr";
import useSWRMutation from "swr/mutation";
import type { ApiError } from "@/lib/api-error";
import { requestData } from "@/lib/request";
import type { OrganizationInvitation } from "../types";

/** GET /api/orgs/:organizationSlug/invitations */
export function useFindAll(
  { organizationSlug }: { organizationSlug: string },
  swrConfig?: SWRConfiguration<OrganizationInvitation[], ApiError>,
) {
  const { data, ...rest } = useSWR<OrganizationInvitation[], ApiError>(
    organizationSlug ? `/orgs/${organizationSlug}/invitations` : null,
    (url) => requestData<OrganizationInvitation[]>({ method: "GET", url }),
    swrConfig,
  );

  return { invitations: data ?? [], ...rest };
}

/** DELETE /api/orgs/:organizationSlug/invitations/:invitationId */
export function useDeleteById({
  organizationSlug,
  invitationId,
}: {
  organizationSlug: string;
  invitationId: string;
}) {
  const { mutate } = useSWRConfig();
  const { trigger: cancel, ...rest } = useSWRMutation<{ id: string }, ApiError, string, void>(
    `/orgs/${organizationSlug}/invitations/${invitationId}`,
    (url) => requestData<{ id: string }>({ method: "DELETE", url }),
  );

  async function trigger() {
    const result = await cancel();
    void mutate(`/orgs/${organizationSlug}/invitations`);
    return result;
  }

  return { trigger, ...rest };
}
