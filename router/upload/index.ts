"use client";

import useSWRMutation, {
  type SWRMutationConfiguration,
} from "swr/mutation";
import type { ApiError } from "@/lib/api-error";
import { requestData } from "@/lib/request";
import type { UploadedFile, UploadFileInput } from "./types";

export type { UploadedFile, UploadFileInput } from "./types";

/** POST /api/upload */
export function useCreateOne(
  { organizationSlug }: { organizationSlug?: string } = {},
  swrConfig?: SWRMutationConfiguration<
    UploadedFile,
    ApiError,
    string,
    UploadFileInput
  >,
) {
  const { data, ...rest } = useSWRMutation<
    UploadedFile,
    ApiError,
    string,
    UploadFileInput
  >(
    "/upload",
    (url, { arg }) => {
      const formData = new FormData();
      formData.append("file", arg.file);

      return requestData<UploadedFile>({
        method: "POST",
        url,
        data: formData,
        headers: organizationSlug
          ? { "X-Organization-Slug": organizationSlug }
          : undefined,
      });
    },
    swrConfig,
  );

  return { uploadedFile: data ?? null, ...rest };
}
