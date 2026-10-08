"use client";

import useSWR, { useSWRConfig } from "swr";
import type { ApiError } from "@/lib/api-error";
import { requestData } from "@/lib/request";
import type { FormType } from "../forms";
import type { OrganizationPrimaryColor } from "../types";

export interface DashboardForm {
  id: string;
  name: string;
  type: FormType;
  isClosed: boolean;
  submissions: number;
  unfinished: number;
  lastSubmittedAt: string | null;
}

export interface DashboardSubmission {
  id: string;
  formId: string;
  formName: string;
  submittedAt: string;
  submittedBy:
    | { kind: "anonymous" }
    | { kind: "former-user" }
    | { kind: "user"; name: string; profilePic: string | null };
  status: { id: string; name: string; color: OrganizationPrimaryColor } | null;
}

export interface OrganizationDashboard {
  period: { from: string; before: string; previousFrom: string; timeZone: string };
  summary: {
    activeForms: number;
    openForms: number;
    submissions: number;
    previousSubmissions: number;
    unfinished: number;
  };
  activity: Array<{ date: string; count: number }>;
  forms: DashboardForm[];
  recentSubmissions: DashboardSubmission[];
}

/** GET /api/orgs/:organizationSlug/dashboard */
export function useOverview({
  organizationSlug,
  days,
}: {
  organizationSlug: string;
  days: 7 | 30;
}) {
  const { mutate: mutateCache } = useSWRConfig();
  const before = new Date();
  before.setHours(0, 0, 0, 0);
  before.setDate(before.getDate() + 1);
  const from = new Date(before);
  from.setDate(from.getDate() - days);
  const previousFrom = new Date(from);
  previousFrom.setDate(previousFrom.getDate() - days);
  const params = new URLSearchParams({
    dateFrom: from.toISOString(),
    dateBefore: before.toISOString(),
    previousDateFrom: previousFrom.toISOString(),
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  const key = organizationSlug ? `/orgs/${organizationSlug}/dashboard?${params}` : null;
  const { data, ...rest } = useSWR<OrganizationDashboard, ApiError>(
    key,
    (url: string) => requestData<OrganizationDashboard>({ method: "GET", url }),
    { refreshInterval: 60_000, revalidateOnFocus: true },
  );

  async function refresh() {
    await Promise.allSettled([
      rest.mutate(),
      mutateCache(
        (cacheKey) =>
          typeof cacheKey === "string" &&
          cacheKey.startsWith(`/orgs/${organizationSlug}/forms/`) &&
          cacheKey.endsWith("/submission-statuses"),
      ),
    ]);
  }

  return { dashboard: data, ...rest, mutate: refresh };
}
