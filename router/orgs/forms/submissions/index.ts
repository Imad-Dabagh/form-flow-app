"use client";

import useSWR from "swr";
import type { ApiError } from "@/lib/api-error";
import { requestData } from "@/lib/request";

export interface FormSubmission {
  id: string;
  submittedAt: string;
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
}: {
  organizationSlug: string;
  formId: string;
  page?: number;
}) {
  const key =
    organizationSlug && formId
      ? `/orgs/${organizationSlug}/forms/${formId}/submissions?page=${page}`
      : null;
  const { data, ...rest } = useSWR<FormSubmissionsPage, ApiError>(key, (url: string) =>
    requestData<FormSubmissionsPage>({ method: "GET", url }),
  );

  return {
    submissionsPage: data,
    ...rest,
  };
}
