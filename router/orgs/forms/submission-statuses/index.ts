"use client";

import useSWR, { useSWRConfig, type SWRConfiguration } from "swr";
import useSWRMutation from "swr/mutation";
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

type FormSubmissionStatusMutationResult = Omit<FormSubmissionStatus, "submissionCount">;

export type StatusInput = {
  name: string;
  description: string;
  color: OrganizationPrimaryColor;
  isDefault: boolean;
  isSubmissionLocked: boolean;
};

/** GET /api/orgs/:organizationSlug/forms/:formId/submission-statuses */
export function useFindAll(
  {
    organizationSlug,
    formId,
  }: {
    organizationSlug: string;
    formId: string;
  },
  swrConfig?: SWRConfiguration<FormSubmissionStatus[], ApiError>,
) {
  const key =
    organizationSlug && formId
      ? `/orgs/${organizationSlug}/forms/${formId}/submission-statuses`
      : null;
  const { data, ...rest } = useSWR<FormSubmissionStatus[], ApiError>(
    key,
    (url: string) => requestData<FormSubmissionStatus[]>({ method: "GET", url }),
    swrConfig,
  );

  return { statuses: data ?? [], ...rest };
}

/** POST /api/orgs/:organizationSlug/forms/:formId/submission-statuses */
export function useCreateOne({
  organizationSlug,
  formId,
}: {
  organizationSlug: string;
  formId: string;
}) {
  const { mutate } = useSWRConfig();
  const key = `/orgs/${organizationSlug}/forms/${formId}/submission-statuses`;
  const { trigger: create, ...rest } = useSWRMutation<
    FormSubmissionStatusMutationResult,
    ApiError,
    string,
    StatusInput
  >(key, (url, { arg }) =>
    requestData<FormSubmissionStatusMutationResult>({ method: "POST", url, data: arg }),
  );

  async function trigger(input: StatusInput) {
    const result = await create(input);
    await mutate(key);
    return result;
  }

  return { trigger, ...rest };
}

/** PUT /api/orgs/:organizationSlug/forms/:formId/submission-statuses/:submissionStatusId */
export function useUpdateById({
  organizationSlug,
  formId,
}: {
  organizationSlug: string;
  formId: string;
}) {
  const { mutate } = useSWRConfig();
  const key = `/orgs/${organizationSlug}/forms/${formId}/submission-statuses`;
  const { trigger: update, ...rest } = useSWRMutation<
    FormSubmissionStatusMutationResult,
    ApiError,
    string,
    { submissionStatusId: string; input: Partial<StatusInput> }
  >(key, (url, { arg }) =>
    requestData<FormSubmissionStatusMutationResult>({
      method: "PUT",
      url: `${url}/${arg.submissionStatusId}`,
      data: arg.input,
    }),
  );

  async function trigger(input: { submissionStatusId: string; input: Partial<StatusInput> }) {
    const result = await update(input);
    await mutate(key);
    return result;
  }

  return { trigger, ...rest };
}

/** DELETE /api/orgs/:organizationSlug/forms/:formId/submission-statuses/:submissionStatusId */
export function useDeleteById({
  organizationSlug,
  formId,
}: {
  organizationSlug: string;
  formId: string;
}) {
  const { mutate } = useSWRConfig();
  const key = `/orgs/${organizationSlug}/forms/${formId}/submission-statuses`;
  const { trigger: remove, ...rest } = useSWRMutation<{ id: string }, ApiError, string, string>(
    key,
    (url, { arg: submissionStatusId }) =>
      requestData<{ id: string }>({ method: "DELETE", url: `${url}/${submissionStatusId}` }),
  );

  async function trigger(submissionStatusId: string) {
    const result = await remove(submissionStatusId);
    await mutate(key);
    return result;
  }

  return { trigger, ...rest };
}

/** PUT /api/orgs/:organizationSlug/forms/:formId/submission-statuses/reorder */
export function useReorder({
  organizationSlug,
  formId,
}: {
  organizationSlug: string;
  formId: string;
}) {
  const { mutate } = useSWRConfig();
  const key = `/orgs/${organizationSlug}/forms/${formId}/submission-statuses`;
  const { trigger: reorder, ...rest } = useSWRMutation<
    FormSubmissionStatusMutationResult[],
    ApiError,
    string,
    string[]
  >(key, (url, { arg: statusIds }) =>
    requestData<FormSubmissionStatusMutationResult[]>({
      method: "PUT",
      url: `${url}/reorder`,
      data: { statusIds },
    }),
  );

  async function trigger(statusIds: string[]) {
    const result = await reorder(statusIds);
    await mutate(key);
    return result;
  }

  return { trigger, ...rest };
}
