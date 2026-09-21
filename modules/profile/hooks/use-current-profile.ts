"use client";

import useSWR from "swr";
import API from "@/router";
import type { CurrentProfile } from "../types";

export function useCurrentProfile(enabled: boolean) {
  const result = useSWR<CurrentProfile>(
    enabled ? "/me" : null,
    API.profile.getCurrentProfile,
  );

  return {
    profile: result.data ?? null,
    error: result.error,
    isLoading: result.isLoading,
    refresh: result.mutate,
  };
}
