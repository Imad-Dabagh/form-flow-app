"use client";

import useSWR from "swr";
import type { ApiError } from "@/lib/api-error";
import { requestData } from "@/lib/request";
import type { FormPresentation } from "@/router/orgs/forms";

export interface SavedSubmissionFile {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
}

export interface CurrentUserSubmission {
  id: string;
  submittedAt: string | null;
  updatedAt: string;
  answers: Record<string, unknown>;
}

export interface CurrentUserForm {
  form: FormPresentation & { type: "AUTHENTICATED" };
  submission: CurrentUserSubmission;
}

const pathFor = (formId: string) => `/me/forms/${formId}/submission`;

export function useCurrent(formId: string) {
  const { data, ...rest } = useSWR<CurrentUserForm, ApiError>(
    formId ? pathFor(formId) : null,
    (url: string) => requestData<CurrentUserForm>({ method: "GET", url }),
  );
  return { current: data, ...rest };
}

export function save(formId: string, formAnswers: Record<string, unknown>) {
  return requestData<CurrentUserSubmission>({
    method: "PUT", url: pathFor(formId), data: { formAnswers },
  });
}

export function submit(formId: string) {
  return requestData<CurrentUserSubmission>({
    method: "PUT", url: `${pathFor(formId)}/submit`,
  });
}

export function uploadFile(formId: string, questionId: string, file: File) {
  const data = new FormData();
  data.append("file", file);
  return requestData<CurrentUserSubmission>({
    method: "POST", url: `${pathFor(formId)}/files/${questionId}`, data,
  });
}

export function removeFile(formId: string, fileId: string) {
  return requestData<CurrentUserSubmission>({
    method: "DELETE", url: `${pathFor(formId)}/files/${fileId}`,
  });
}
