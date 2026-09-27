"use client";

import useSWRMutation, {
  type SWRMutationConfiguration,
} from "swr/mutation";
import type { ApiError } from "@/lib/api-error";
import { requestData } from "@/lib/request";

export interface UploadedFile {
  id: string;
  storageKey: string;
  provider: string;
  url: string;
  name: string;
  originalName: string;
  extension: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  checksum?: string;
  createdAt: string;
}

export interface UploadFileInput {
  file: File;
}

export interface UseUploadFileParams {
  organizationSlug?: string;
}

/**
 * POST /api/upload
 */
export function useUploadFile(
  { organizationSlug }: UseUploadFileParams = {},
  swrConfig?: SWRMutationConfiguration<
    UploadedFile,
    ApiError,
    string,
    UploadFileInput
  >,
) {
  const key = "/upload";
  const { data, ...rest } = useSWRMutation<
    UploadedFile,
    ApiError,
    string,
    UploadFileInput
  >(
    key,
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

  return {
    uploadedFile: data ?? null,
    ...rest,
  };
}
