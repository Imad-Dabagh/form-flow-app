"use client";

import useSWR, { useSWRConfig } from "swr";
import useSWRMutation from "swr/mutation";
import type { ApiError } from "@/lib/api-error";
import { requestData } from "@/lib/request";

export interface OrganizationForm {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface FormsPage {
  items: OrganizationForm[];
  total: number;
  page: number;
  pageSize: number;
}

export interface OrganizationFormDetails extends OrganizationForm {
  description: string;
  sections: unknown[];
  displayMode: "SINGLE_PAGE" | "WIZARD";
  isClosed: boolean;
}

/** GET /api/orgs/:organizationSlug/forms */
export function useFindAll({ organizationSlug, page = 1 }: {
  organizationSlug: string;
  page?: number;
}) {
  const key = organizationSlug ? `/orgs/${organizationSlug}/forms?page=${page}` : null;
  const { data, ...rest } = useSWR<FormsPage, ApiError>(
    key,
    (url: string) => requestData<FormsPage>({ method: "GET", url }),
  );

  return { formsPage: data, ...rest };
}

/** GET /api/orgs/:organizationSlug/forms/:formId */
export function useFindById({ organizationSlug, formId }: {
  organizationSlug: string;
  formId: string;
}) {
  const key = organizationSlug && formId
    ? `/orgs/${organizationSlug}/forms/${formId}`
    : null;
  const { data, ...rest } = useSWR<OrganizationFormDetails, ApiError>(
    key,
    (url: string) => requestData<OrganizationFormDetails>({ method: "GET", url }),
  );

  return { form: data, ...rest };
}

/** POST /api/orgs/:organizationSlug/forms */
export function useCreateOne({ organizationSlug }: { organizationSlug: string }) {
  const { mutate } = useSWRConfig();
  const { trigger: create, ...rest } = useSWRMutation<
    OrganizationForm,
    ApiError,
    string,
    { name: string }
  >(
    `/orgs/${organizationSlug}/forms`,
    (url, { arg }) => requestData<OrganizationForm>({ method: "POST", url, data: arg }),
  );

  async function trigger(name: string) {
    const result = await create({ name });
    await mutate(
      (key) => typeof key === "string" && key.startsWith(`/orgs/${organizationSlug}/forms?page=`),
    );
    return result;
  }

  return { trigger, ...rest };
}
