"use client";

import useSWR, { type SWRConfiguration } from "swr";
import useSWRMutation, { type SWRMutationConfiguration } from "swr/mutation";
import type { ApiError } from "@/lib/api-error";
import { requestData } from "@/lib/request";
import type { CurrentProfile, UpdateCurrentProfileInput } from "./types";

function normalizeCurrentProfile(profile: CurrentProfile): CurrentProfile {
  return {
    ...profile,
    profilePic: profile.profilePic ?? "",
    coverPhoto: profile.coverPhoto ?? "",
    phone: profile.phone ?? "",
    shortDescription: profile.shortDescription ?? "",
  };
}

/** GET /api/me */
export function useFindOne(
  enabled: boolean,
  swrConfig?: SWRConfiguration<CurrentProfile, ApiError>,
) {
  const { data, ...rest } = useSWR<CurrentProfile, ApiError>(
    enabled ? "/me" : null,
    async (url) =>
      normalizeCurrentProfile(await requestData<CurrentProfile>({ method: "GET", url })),
    swrConfig,
  );

  return { profile: data ?? null, ...rest };
}

/** PUT /api/me */
export function useUpdateOne(
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
    async (url, { arg }) =>
      normalizeCurrentProfile(await requestData<CurrentProfile>({ method: "PUT", url, data: arg })),
    {
      populateCache: true,
      revalidate: false,
      ...swrConfig,
    },
  );

  return { profile: data ?? null, ...rest };
}
