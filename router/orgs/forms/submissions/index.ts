"use client";

import useSWRInfinite from "swr/infinite";
import type { ApiError } from "@/lib/api-error";
import { requestData } from "@/lib/request";

export interface FormSubmission {
  id: string;
  submittedAt: string;
  submittedBy:
    | { kind: "anonymous" }
    | { kind: "former-user" }
    | { kind: "user"; name: string; email: string; profilePic: string | null };
  answers: Record<string, unknown>;
}

interface FormSubmissionsPage {
  items: FormSubmission[];
  nextCursor: string | null;
}

/** GET /api/orgs/:organizationSlug/forms/:formId/submissions */
export function useFindAll({
  organizationSlug,
  formId,
}: {
  organizationSlug: string;
  formId: string;
}) {
  const { data, size, setSize, ...rest } = useSWRInfinite<FormSubmissionsPage, ApiError>(
    (pageIndex, previousPage) => {
      if (!organizationSlug || !formId) return null;

      const path = `/orgs/${organizationSlug}/forms/${formId}/submissions`;
      if (pageIndex === 0) return path;
      const cursor = previousPage?.nextCursor;
      return cursor ? `${path}?cursor=${encodeURIComponent(cursor)}` : null;
    },
    (url: string) => requestData<FormSubmissionsPage>({ method: "GET", url }),
  );

  const submissions = data?.flatMap((page) => page.items) ?? [];
  const hasMore = Boolean(data?.at(-1)?.nextCursor);
  const isLoadingMore = Boolean(organizationSlug && formId && size > (data?.length ?? 0) && !rest.error);

  return {
    submissions,
    hasMore,
    isLoadingMore,
    loadMore: () => rest.error
      ? rest.mutate()
      : setSize((currentSize) => currentSize + 1),
    ...rest,
  };
}
