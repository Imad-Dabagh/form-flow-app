"use client";

import useSWR, { type SWRConfiguration } from "swr";
import type { ApiError } from "@/lib/api-error";
import { requestData } from "@/lib/request";
import type { CurrentProfile } from "@/modules/profile/types";

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
