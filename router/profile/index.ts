"use client";

import useSWR, { type SWRConfiguration } from "swr";
import useSWRMutation, {
  type SWRMutationConfiguration,
} from "swr/mutation";
import type { ApiError } from "@/lib/api-error";
import { requestData } from "@/lib/request";
import type { CurrentProfile } from "@/modules/profile/types";

export interface UpdateCurrentProfileInput {
  firstName: string;
  lastName: string;
}

/**
 * GET /api/me
 */
export function useCurrentProfile(
  enabled: boolean,
  swrConfig?: SWRConfiguration<CurrentProfile, ApiError>,
) {
  const { data, ...rest } = useSWR<CurrentProfile, ApiError>(
    enabled ? "/me" : null,
    (url) => requestData<CurrentProfile>({ method: "GET", url }),
    swrConfig,
  );

  return {
    profile: data ?? null,
    ...rest,
  };
}

/**
 * PATCH /api/me
 */
export function useUpdateCurrentProfile(
  swrConfig?: SWRMutationConfiguration<
    CurrentProfile,
    ApiError,
    string,
    UpdateCurrentProfileInput,
    CurrentProfile
  >,
) {
  const { data, ...rest } = useSWRMutation<
    CurrentProfile,
    ApiError,
    string,
    UpdateCurrentProfileInput,
    CurrentProfile
  >(
    "/me",
    (url, { arg }) =>
      requestData<CurrentProfile>({ method: "PATCH", url, data: arg }),
    {
      populateCache: true,
      revalidate: false,
      ...swrConfig,
    },
  );

  return {
    profile: data ?? null,
    ...rest,
  };
}
