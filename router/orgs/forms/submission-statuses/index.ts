"use client";

import useSWR from "swr";
import type { ApiError } from "@/lib/api-error";
import { requestData } from "@/lib/request";
import type { OrganizationPrimaryColor } from "@/router/orgs/types";

export interface FormSubmissionStatus {
  id: string;
  name: string;
  description: string;
  color: OrganizationPrimaryColor;
  order: number;
  isDefault: boolean;
  isSubmissionLocked: boolean;
  submissionCount: number;
}

export type StatusInput = {
  name: string;
  description: string;
  color: OrganizationPrimaryColor;
  isDefault: boolean;
  isSubmissionLocked: boolean;
};

export function useFormSubmissionStatuses({
  organizationSlug,
  formId,
}: {
  organizationSlug: string;
  formId: string;
}) {
  const key = organizationSlug && formId
    ? `/orgs/${organizationSlug}/forms/${formId}/submission-statuses`
    : null;
  const { data, mutate, ...rest } = useSWR<FormSubmissionStatus[], ApiError>(
    key,
    (url: string) => requestData<FormSubmissionStatus[]>({ method: "GET", url }),
  );

  async function create(input: StatusInput) {
    if (!key) return;
    await requestData<FormSubmissionStatus>({ method: "POST", url: key, data: input });
    await mutate();
  }

  async function update(statusId: string, input: Partial<StatusInput>) {
    if (!key) return;
    await requestData<FormSubmissionStatus>({
      method: "PUT",
      url: `${key}/${statusId}`,
      data: input,
    });
    await mutate();
  }

  async function remove(statusId: string) {
    if (!key) return;
    await requestData<{ id: string }>({ method: "DELETE", url: `${key}/${statusId}` });
    await mutate();
  }

  async function reorder(statusIds: string[]) {
    if (!key) return;
    await requestData<FormSubmissionStatus[]>({
      method: "PUT",
      url: `${key}/reorder`,
      data: { statusIds },
    });
    await mutate();
  }

  return { statuses: data ?? [], create, update, remove, reorder, ...rest };
}
