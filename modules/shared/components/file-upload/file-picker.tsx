"use client";

import type { ReactNode } from "react";
import { useCallback, useState } from "react";
import { CloudUpload, Loader2 } from "lucide-react";
import {
  useDropzone,
  type Accept,
  type DropzoneState,
  type FileRejection,
} from "react-dropzone";
import { cn } from "@/lib/utils";
import {
  useCreateOne,
  type UploadedFile,
} from "@/router/upload";
import { Button } from "../ui/button";

export const MAX_FILE_UPLOAD_SIZE_MB = 15;
export const IMAGE_FILE_ACCEPT: Accept = {
  "image/avif": [".avif"],
  "image/gif": [".gif"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};
const MAX_FILES_PER_PICK = 20;
const MAX_CONCURRENT_UPLOADS = 3;

export interface FilePickerRenderProps {
  error: string | null;
  getInputProps: DropzoneState["getInputProps"];
  getRootProps: DropzoneState["getRootProps"];
  isDragActive: boolean;
  isDragReject: boolean;
  isDisabled: boolean;
  isUploading: boolean;
  open: () => void;
}

export interface FilePickerProps {
  accept?: Accept;
  buttonTitle?: string;
  className?: string;
  disabled?: boolean;
  maxFiles?: number;
  maxSizeMb?: number;
  multiple?: boolean;
  onFilesUploaded: (files: UploadedFile[]) => void;
  onUploadError?: (message: string) => void;
  onUploadStarted?: () => void;
  onUploadingChange?: (isUploading: boolean) => void;
  organizationSlug?: string;
  render?: (props: FilePickerRenderProps) => ReactNode;
}

function getRejectionMessage(
  rejections: FileRejection[],
  maxSizeMb: number,
): string {
  const errorCodes = new Set(
    rejections.flatMap((rejection) =>
      rejection.errors.map((error) => error.code),
    ),
  );

  if (errorCodes.has("file-too-large")) {
    return `Files must be ${maxSizeMb} MB or smaller.`;
  }

  if (errorCodes.has("too-many-files")) {
    return "Too many files were selected.";
  }

  if (errorCodes.has("file-invalid-type")) {
    return "One or more selected files have an unsupported type.";
  }

  return "The selected files could not be accepted.";
}

function getUploadErrorMessage(reason: unknown): string {
  if (
    reason &&
    typeof reason === "object" &&
    "message" in reason &&
    typeof reason.message === "string"
  ) {
    return reason.message;
  }

  return "One or more files could not be uploaded.";
}

async function uploadInBatches(
  files: File[],
  upload: (file: File) => Promise<UploadedFile>,
): Promise<PromiseSettledResult<UploadedFile>[]> {
  const results: PromiseSettledResult<UploadedFile>[] = [];

  for (let index = 0; index < files.length; index += MAX_CONCURRENT_UPLOADS) {
    const batch = files.slice(index, index + MAX_CONCURRENT_UPLOADS);
    results.push(...(await Promise.allSettled(batch.map(upload))));
  }

  return results;
}

export function FilePicker({
  accept,
  buttonTitle = "Choose file",
  className,
  disabled = false,
  maxFiles,
  maxSizeMb = MAX_FILE_UPLOAD_SIZE_MB,
  multiple = false,
  onFilesUploaded,
  onUploadError,
  onUploadStarted,
  onUploadingChange,
  organizationSlug,
  render,
}: FilePickerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { trigger } = useCreateOne({ organizationSlug });
  const effectiveMaxFiles = multiple
    ? Math.min(Math.max(maxFiles ?? MAX_FILES_PER_PICK, 1), MAX_FILES_PER_PICK)
    : 1;
  const effectiveMaxSizeMb = Math.min(
    Math.max(maxSizeMb, 0),
    MAX_FILE_UPLOAD_SIZE_MB,
  );

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (!files.length) {
        return;
      }

      setError(null);
      setIsUploading(true);
      onUploadStarted?.();
      onUploadingChange?.(true);

      try {
        const results = await uploadInBatches(
          files,
          (file) => trigger({ file }),
        );
        const uploadedFiles = results.flatMap((result) =>
          result.status === "fulfilled" ? [result.value] : [],
        );
        const failedUpload = results.find(
          (result) => result.status === "rejected",
        );

        if (uploadedFiles.length) {
          onFilesUploaded(uploadedFiles);
        }

        if (failedUpload?.status === "rejected") {
          const message = getUploadErrorMessage(failedUpload.reason);
          setError(message);
          onUploadError?.(message);
        }
      } catch (reason) {
        const message = getUploadErrorMessage(reason);
        setError(message);
        onUploadError?.(message);
      } finally {
        setIsUploading(false);
        onUploadingChange?.(false);
      }
    }, [
      onFilesUploaded,
      onUploadError,
      onUploadStarted,
      onUploadingChange,
      trigger,
    ]);

  const rejectFiles = useCallback(
    (rejections: FileRejection[]) => {
      const message = getRejectionMessage(rejections, effectiveMaxSizeMb);
      setError(message);
      onUploadError?.(message);
    },
    [effectiveMaxSizeMb, onUploadError],
  );

  const dropzone = useDropzone({
    accept,
    disabled: disabled || isUploading,
    maxFiles: effectiveMaxFiles,
    maxSize: effectiveMaxSizeMb * 1024 * 1024,
    multiple,
    noClick: true,
    onDropAccepted: uploadFiles,
    onDropRejected: rejectFiles,
  });
  const renderProps: FilePickerRenderProps = {
    error,
    getInputProps: dropzone.getInputProps,
    getRootProps: dropzone.getRootProps,
    isDragActive: dropzone.isDragActive,
    isDragReject: dropzone.isDragReject,
    isDisabled: disabled || isUploading,
    isUploading,
    open: dropzone.open,
  };

  if (render) {
    return render(renderProps);
  }

  return (
    <div
      {...dropzone.getRootProps({
        className: cn(
          "flex min-h-44 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-6 text-center transition-colors dark:border-slate-600 dark:bg-white/[0.03]",
          dropzone.isDragActive &&
            !dropzone.isDragReject &&
            "border-primary-500 bg-primary-50 dark:bg-primary-950/30",
          dropzone.isDragReject &&
            "border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-500/10",
          disabled && "cursor-not-allowed opacity-60",
          className,
        ),
      })}
    >
      <input {...dropzone.getInputProps()} />
      {isUploading ? (
        <Loader2 className="size-7 animate-spin text-primary-600" />
      ) : (
        <CloudUpload className="size-7 text-slate-400" />
      )}
      <p className="mt-3 text-sm font-medium">
        {dropzone.isDragActive ? "Drop files here" : "Drag files here"}
      </p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Up to {effectiveMaxSizeMb} MB per file
      </p>
      <Button
        className="mt-4"
        disabled={disabled || isUploading}
        onClick={dropzone.open}
        size="sm"
        type="button"
        variant="outline"
      >
        {buttonTitle}
      </Button>
      {error && (
        <p className="mt-3 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
