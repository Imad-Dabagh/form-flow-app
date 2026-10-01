"use client";

import useSWR, { useSWRConfig } from "swr";
import useSWRMutation from "swr/mutation";
import type { ApiError } from "@/lib/api-error";
import { requestData } from "@/lib/request";

export * as questions from "./questions";

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
  sections: FormSection[];
  displayMode: "SINGLE_PAGE" | "WIZARD";
  isClosed: boolean;
}

export type FormFieldType =
  | "string"
  | "text"
  | "email"
  | "number"
  | "select"
  | "radio"
  | "multi-select"
  | "checkboxes"
  | "boolean"
  | "datetime"
  | "countries"
  | "file"
  | "linear-scale";

export interface FormOption {
  label: string;
  value: string;
  isCorrectAnswer?: boolean;
}

export interface FormQuestion {
  _id: string;
  name: string;
  title: string;
  inputType: FormFieldType;
  description?: string;
  placeholder?: string;
  isRequired?: boolean;
  options?: FormOption[];
  typeConfig?: {
    type?: "date" | "time";
    format?: string;
    min?: number;
    max?: number;
    minLabel?: string;
    maxLabel?: string;
    uploadCategory?: "all" | "documents" | "images";
    allowedExtensions?: string[];
  };
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    regex?: string;
  };
  defaultValue?: unknown;
}

export interface FormSection {
  _id: string;
  title: string;
  description?: string;
  isHidden?: boolean;
  questions: FormQuestion[];
}

export type UpdateOrganizationFormInput = Pick<
  OrganizationFormDetails,
  "name" | "description" | "sections" | "displayMode" | "isClosed"
>;

/** GET /api/orgs/:organizationSlug/forms */
export function useFindAll({
  organizationSlug,
  page = 1,
}: {
  organizationSlug: string;
  page?: number;
}) {
  const key = organizationSlug ? `/orgs/${organizationSlug}/forms?page=${page}` : null;
  const { data, ...rest } = useSWR<FormsPage, ApiError>(key, (url: string) =>
    requestData<FormsPage>({ method: "GET", url }),
  );

  return { formsPage: data, ...rest };
}

/** GET /api/orgs/:organizationSlug/forms/:formId */
export function useFindById({
  organizationSlug,
  formId,
}: {
  organizationSlug: string;
  formId: string;
}) {
  const key = organizationSlug && formId ? `/orgs/${organizationSlug}/forms/${formId}` : null;
  const { data, ...rest } = useSWR<OrganizationFormDetails, ApiError>(key, (url: string) =>
    requestData<OrganizationFormDetails>({ method: "GET", url }),
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
  >(`/orgs/${organizationSlug}/forms`, (url, { arg }) =>
    requestData<OrganizationForm>({ method: "POST", url, data: arg }),
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

/** PUT /api/orgs/:organizationSlug/forms/:formId */
export function useUpdateById({
  organizationSlug,
  formId,
}: {
  organizationSlug: string;
  formId: string;
}) {
  const { mutate } = useSWRConfig();
  const key = `/orgs/${organizationSlug}/forms/${formId}`;
  const { trigger: update, ...rest } = useSWRMutation<
    OrganizationFormDetails,
    ApiError,
    string,
    UpdateOrganizationFormInput
  >(key, (url, { arg }) => requestData<OrganizationFormDetails>({ method: "PUT", url, data: arg }));

  async function trigger(input: UpdateOrganizationFormInput) {
    const result = await update(input);
    await mutate(key, result, { revalidate: false });
    await mutate(
      (cacheKey) =>
        typeof cacheKey === "string" &&
        cacheKey.startsWith(`/orgs/${organizationSlug}/forms?page=`),
    );
    return result;
  }

  return { trigger, ...rest };
}
