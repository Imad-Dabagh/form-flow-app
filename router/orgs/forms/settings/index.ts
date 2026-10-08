"use client";

import { useSWRConfig } from "swr";
import useSWRMutation from "swr/mutation";
import type { ApiError } from "@/lib/api-error";
import { requestData } from "@/lib/request";
import type { FormSettingsInput, OrganizationForm } from "@/router/orgs/forms";

type UpdatedFormSettings = Pick<
  OrganizationForm,
  "id" | "name" | "type" | "displayMode" | "isClosed" | "updatedAt"
>;

/** PUT /api/orgs/:organizationSlug/forms/:formId/settings */
export function useUpdateById({
  organizationSlug,
  formId,
}: {
  organizationSlug: string;
  formId: string;
}) {
  const { mutate } = useSWRConfig();
  const formKey = `/orgs/${organizationSlug}/forms/${formId}`;
  const { trigger: update, ...rest } = useSWRMutation<
    UpdatedFormSettings,
    ApiError,
    string,
    FormSettingsInput
  >(`${formKey}/settings`, (url, { arg }) =>
    requestData<UpdatedFormSettings>({ method: "PUT", url, data: arg }),
  );

  async function trigger(input: FormSettingsInput) {
    const result = await update(input);
    await mutate(formKey);
    await mutate(
      (key) =>
        typeof key === "string" &&
        (key.startsWith(`/orgs/${organizationSlug}/forms?page=`) ||
          key.startsWith(`/orgs/${organizationSlug}/dashboard?`)),
    );
    return result;
  }

  return { trigger, ...rest };
}
