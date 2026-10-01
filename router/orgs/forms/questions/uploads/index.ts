"use client";

import useSWRMutation from "swr/mutation";
import type { ApiError } from "@/lib/api-error";
import { requestData } from "@/lib/request";
import type { UploadedFile } from "@/router/upload/types";

/** POST /api/orgs/:organizationSlug/forms/:formId/questions/:questionId/uploads */
export function useCreateOne({
  organizationSlug,
  formId,
  questionId,
}: {
  organizationSlug: string;
  formId: string;
  questionId: string;
}) {
  const key = `/orgs/${organizationSlug}/forms/${formId}/questions/${questionId}/uploads`;
  const { data, ...rest } = useSWRMutation<UploadedFile, ApiError, string, File>(
    key,
    (url, { arg: file }) => {
      const formData = new FormData();
      formData.append("file", file);
      return requestData<UploadedFile>({ method: "POST", url, data: formData });
    },
  );

  return { uploadedFile: data ?? null, ...rest };
}
