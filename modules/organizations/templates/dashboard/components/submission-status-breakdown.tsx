"use client";

import Link from "next/link";
import API from "@/router";
import type { DashboardForm } from "@/router/orgs/dashboard";
import { Button } from "@/modules/shared/components/ui/button";
import { Skeleton } from "@/modules/shared/components/ui/skeleton";
import { getOrganizationColorSwatch, organizationWorkspacePath } from "@/lib/organization";

export function SubmissionStatusBreakdown({
  organizationSlug,
  form,
}: {
  organizationSlug: string;
  form: DashboardForm;
}) {
  const { statuses, error, isLoading, mutate } = API.orgs.forms.submissionStatuses.useFindAll(
    { organizationSlug, formId: form.id },
    { refreshInterval: 60_000, revalidateOnFocus: true },
  );
  const total = statuses.reduce((sum, status) => sum + status.submissionCount, 0);

  if (isLoading)
    return (
      <div className="space-y-5" role="status" aria-label="Loading submission statuses">
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} className="h-8 w-full" />
        ))}
      </div>
    );
  if (error)
    return (
      <div className="space-y-3 text-sm" role="alert">
        <p className="text-destructive">Could not load submission statuses.</p>
        <Button size="sm" variant="outline" onClick={() => void mutate()}>
          Try again
        </Button>
      </div>
    );
  if (!statuses.length)
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No statuses available for this form.
      </p>
    );

  return (
    <div className="space-y-1">
      {statuses.map((status) => {
        const color = getOrganizationColorSwatch(status.color);
        const query = new URLSearchParams({
          status: form.type === "AUTHENTICATED" ? "all" : "submitted",
          submissionStatusId: status.id,
        });
        return (
          <Link
            key={status.id}
            href={`${organizationWorkspacePath(organizationSlug, `/forms/${form.id}`)}?${query}`}
            className="block min-h-11 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`View ${status.submissionCount} submissions with status ${status.name}`}
          >
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                />
                <span className="truncate" title={status.name}>
                  {status.name}
                </span>
              </span>
              <span className="font-medium tabular-nums">
                {status.submissionCount.toLocaleString()}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
              <div
                className="h-full rounded-full"
                style={{
                  backgroundColor: color,
                  width: `${total ? (status.submissionCount / total) * 100 : 0}%`,
                }}
              />
            </div>
          </Link>
        );
      })}
      {total === 0 && (
        <p className="px-2 pt-3 text-xs leading-5 text-muted-foreground">
          {form.type === "AUTHENTICATED"
            ? "Counts will appear when someone opens or submits this form."
            : "Counts will appear when someone submits this form."}
        </p>
      )}
    </div>
  );
}
