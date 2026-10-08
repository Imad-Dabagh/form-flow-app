"use client";

import useSWR, { useSWRConfig } from "swr";
import useSWRMutation from "swr/mutation";
import type { ApiError } from "@/lib/api-error";
import { requestData } from "@/lib/request";

export interface FormSubmission {
  id: string;
  submissionStatusId: string | null;
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
  submissionStatusId = "",
  sort = "newest",
  from = "",
  through = "",
}: {
  organizationSlug: string;
  formId: string;
  page?: number;
  search?: string;
  status?: "all" | "submitted" | "started";
  submissionStatusId?: string;
  sort?: "newest" | "oldest";
  from?: string;
  through?: string;
}) {
  const params = new URLSearchParams({ page: String(page), status, sort });
  if (search.trim()) params.set("search", search.trim());
  if (submissionStatusId) params.set("submissionStatusId", submissionStatusId);
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

/** PUT /api/orgs/:organizationSlug/forms/:formId/submissions/:submissionId/status */
export function useUpdateStatus({
  organizationSlug,
  formId,
}: {
  organizationSlug: string;
  formId: string;
}) {
  const { mutate } = useSWRConfig();
  const submissionsKey = `/orgs/${organizationSlug}/forms/${formId}/submissions`;
  const { trigger: update, ...rest } = useSWRMutation<
    { id: string; submissionStatusId: string; updatedAt: string },
    ApiError,
    string,
    { submissionId: string; submissionStatusId: string }
  >(submissionsKey, (url, { arg }) =>
    requestData<{ id: string; submissionStatusId: string; updatedAt: string }>({
      method: "PUT",
      url: `${url}/${arg.submissionId}/status`,
      data: { submissionStatusId: arg.submissionStatusId },
    }),
  );

  async function trigger(input: { submissionId: string; submissionStatusId: string }) {
    const result = await update(input);
    await mutate((key) => typeof key === "string" && key.startsWith(`${submissionsKey}?`));
    await mutate(`/orgs/${organizationSlug}/forms/${formId}/submission-statuses`);
    await mutate(
      (key) => typeof key === "string" && key.startsWith(`/orgs/${organizationSlug}/dashboard?`),
    );
    return result;
  }

  return { trigger, ...rest };
}
