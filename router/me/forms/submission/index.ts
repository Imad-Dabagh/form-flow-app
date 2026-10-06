"use client";

import useSWR from "swr";
import type { ApiError } from "@/lib/api-error";
import { requestData } from "@/lib/request";
import type { FormPresentation } from "@/router/orgs/forms";

export * as files from "./files";
export * as submit from "./submit";

export interface SavedSubmissionFile {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
}

export interface CurrentUserSubmission {
  id: string;
  submissionStatusId: string;
  submittedAt: string | null;
  updatedAt: string;
  answers: Record<string, unknown>;
}

export interface CurrentUserForm {
  form: FormPresentation & { type: "AUTHENTICATED" };
  submission: CurrentUserSubmission;
  submissionStatuses: Array<{
    id: string;
    name: string;
    description: string;
    color: string;
    order: number;
    isDefault: boolean;
    isSubmissionLocked: boolean;
  }>;
}

const pathFor = (formId: string) => `/me/forms/${formId}/submission`;

/** GET /api/me/forms/:formId/submission */
export function useCurrent(formId: string) {
  const { data, ...rest } = useSWR<CurrentUserForm, ApiError>(
    formId ? pathFor(formId) : null,
    (url: string) => requestData<CurrentUserForm>({ method: "GET", url }),
  );
  return { current: data, ...rest };
}

/** PUT /api/me/forms/:formId/submission */
export function save(formId: string, formAnswers: Record<string, unknown>) {
  return requestData<CurrentUserSubmission>({
    method: "PUT", url: pathFor(formId), data: { formAnswers },
  });
}
