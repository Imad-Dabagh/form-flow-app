"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import type { ApiError } from "@/lib/api-error";
import { requestData } from "@/lib/request";
import type { FormPresentation } from "@/router/orgs/forms";

export interface PublicForm extends FormPresentation {
  type: "PUBLIC";
}

export interface PublicFormSubmission {
  id: string;
  submittedAt: string;
}

export interface FormLink {
  type: "PUBLIC" | "AUTHENTICATED";
}

/** GET /api/public/forms/:formId/link?organizationSlug=:organizationSlug */
export function useFindLink({
  organizationSlug,
  formId,
}: {
  organizationSlug: string;
  formId: string;
}) {
  const key = organizationSlug && formId
    ? `/public/forms/${formId}/link?organizationSlug=${encodeURIComponent(organizationSlug)}`
    : null;
  const { data, ...rest } = useSWR<FormLink, ApiError>(key, (url: string) =>
    requestData<FormLink>({ method: "GET", url }),
  );

  return { formLink: data, ...rest };
}

/** GET /api/public/forms/:formId */
export function useFindById({ formId }: { formId: string }) {
  const key = formId ? `/public/forms/${formId}` : null;
  const { data, ...rest } = useSWR<PublicForm, ApiError>(key, (url: string) =>
    requestData<PublicForm>({ method: "GET", url }),
  );

  return { form: data, ...rest };
}

/** PUT /api/public/forms/:formId/submissions/submit */
export function useSubmit({ formId }: { formId: string }) {
  const { trigger, ...rest } = useSWRMutation<
    PublicFormSubmission,
    ApiError,
    string,
    {
      payload: FormData | { formAnswers: Record<string, unknown> };
      idempotencyKey: string;
    }
  >(`/public/forms/${formId}/submissions/submit`, (url, { arg }) =>
    requestData<PublicFormSubmission>({
      method: "PUT",
      url,
      data: arg.payload,
      headers: { "Idempotency-Key": arg.idempotencyKey },
    }),
  );

  return { trigger, ...rest };
}
