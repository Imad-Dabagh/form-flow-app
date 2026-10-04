"use client";

import useSWR from "swr";
import type { ApiError } from "@/lib/api-error";
import { requestData } from "@/lib/request";

export interface FormSubmission {
  id: string;
  submittedAt: string | null;
  startedAt: string;
  submittedBy:
    | { kind: "anonymous" }
    | { kind: "former-user" }
    | { kind: "user"; name: string; email: string; profilePic: string | null };
  answers: Record<string, unknown>;
}

interface FormSubmissionsPage {
  items: FormSubmission[];
  total: number;
  page: number;
  pageSize: number;
}

/** GET /api/orgs/:organizationSlug/forms/:formId/submissions */
export function useFindAll({
  organizationSlug,
  formId,
  page = 1,
  search = "",
  status = "submitted",
  sort = "newest",
  from = "",
  through = "",
}: {
  organizationSlug: string;
  formId: string;
  page?: number;
  search?: string;
  status?: "all" | "submitted" | "started";
  sort?: "newest" | "oldest";
  from?: string;
  through?: string;
}) {
  const params = new URLSearchParams({ page: String(page), status, sort });
  if (search.trim()) params.set("search", search.trim());
  if (from) params.set("dateFrom", new Date(`${from}T00:00:00`).toISOString());
  if (through) {
    const before = new Date(`${through}T00:00:00`);
    before.setDate(before.getDate() + 1);
    params.set("dateBefore", before.toISOString());
  }
  const key =
    organizationSlug && formId
      ? `/orgs/${organizationSlug}/forms/${formId}/submissions?${params}`
      : null;
  const { data, ...rest } = useSWR<FormSubmissionsPage, ApiError>(key, (url: string) =>
    requestData<FormSubmissionsPage>({ method: "GET", url }),
  );

  return {
    submissionsPage: data,
    ...rest,
  };
}
