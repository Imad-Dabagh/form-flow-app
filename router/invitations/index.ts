"use client";

import useSWR, { useSWRConfig } from "swr";
import useSWRMutation from "swr/mutation";
import type { ApiError } from "@/lib/api-error";
import { requestData } from "@/lib/request";
import type { OrganizationTeamRole } from "@/modules/organizations/types";

export interface InvitationDetails {
  organizationName: string;
  email: string;
  role: OrganizationTeamRole;
  expiresAt: string;
}

/**
 * GET /api/invitations/:token
 */
export function useInvitation(token: string) {
  const { data, ...rest } = useSWR<InvitationDetails, ApiError>(
    token ? `/invitations/${token}` : null,
    (url: string) => requestData<InvitationDetails>({ method: "GET", url }),
  );
  return { invitation: data ?? null, ...rest };
}

/**
 * POST /api/invitations/:token/accept
 */
export function useAcceptInvitation(token: string) {
  const { mutate } = useSWRConfig();
  const { trigger: accept, ...rest } = useSWRMutation<
    { organizationSlug: string },
    ApiError,
    string,
    void
  >(
    `/invitations/${token}/accept`,
    (url) => requestData<{ organizationSlug: string }>({ method: "POST", url }),
  );

  async function trigger() {
    const result = await accept();
    await mutate("/orgs");
    return result;
  }
  return { trigger, ...rest };
}
