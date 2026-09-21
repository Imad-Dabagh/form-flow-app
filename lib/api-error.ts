import { AxiosError } from "axios";
import type { ApiFailure } from "./api-contracts";

export class ApiError extends Error {
  readonly status: number | undefined;
  readonly code: string | undefined;
  readonly details: unknown;
  readonly requestId: string | undefined;

  constructor({
    message,
    status,
    code,
    details,
    requestId,
  }: {
    message: string;
    status?: number;
    code?: string;
    details?: unknown;
    requestId?: string;
  }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.requestId = requestId;
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof AxiosError) {
    const body = error.response?.data as ApiFailure | undefined;

    return new ApiError({
      message: body?.error?.message ?? error.message ?? "Request failed.",
      status: error.response?.status,
      code: body?.error?.code,
      details: body?.error?.details,
      requestId: body?.requestId,
    });
  }

  return new ApiError({
    message: error instanceof Error ? error.message : "Request failed.",
  });
}
