"use client";

import type { ReactNode } from "react";
import { SWRConfig } from "swr";
import { ApiError } from "@/lib/api-error";
import { apiFetcher } from "@/lib/request";

export function DataProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: apiFetcher,
        revalidateOnFocus: false,
        shouldRetryOnError: (error) => {
          const status = error instanceof ApiError ? error.status : undefined;
          return status !== 401 && status !== 403 && status !== 404;
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
