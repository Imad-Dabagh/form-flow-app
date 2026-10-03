"use client";

import useSWR from "swr";
import type { ApiError } from "@/lib/api-error";
import { requestData } from "@/lib/request";
import type { FormPresentation } from "@/router/orgs/forms";

export interface AuthenticatedForm extends FormPresentation {
  type: "AUTHENTICATED";
}

/** GET /api/orgs/:organizationSlug/forms/:formId/submission */
export function useForm({
  organizationSlug,
  formId,
  enabled = true,
}: {
  organizationSlug: string;
  formId: string;
  enabled?: boolean;
}) {
  const key = organizationSlug && formId && enabled
    ? `/orgs/${organizationSlug}/forms/${formId}/submission`
    : null;
  const { data, ...rest } = useSWR<AuthenticatedForm, ApiError>(key, (url: string) =>
    requestData<AuthenticatedForm>({ method: "GET", url }),
  );

  return { form: data, ...rest };
}

/** PUT /api/orgs/:organizationSlug/forms/:formId/submission/access */
export function ensureAccess({
  organizationSlug,
  formId,
}: {
  organizationSlug: string;
  formId: string;
}) {
  return requestData<{ granted: true }>({
    method: "PUT",
    url: `/orgs/${organizationSlug}/forms/${formId}/submission/access`,
  });
}
