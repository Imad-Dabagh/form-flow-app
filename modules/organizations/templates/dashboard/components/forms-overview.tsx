"use client";

import Link from "next/link";
import { format, formatDistanceToNowStrict } from "date-fns";
import { Globe2, UsersRound } from "lucide-react";
import type { DashboardForm, OrganizationDashboard } from "@/router/orgs/dashboard";
import { Badge } from "@/modules/shared/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/modules/shared/components/ui/table";
import { organizationWorkspacePath } from "@/lib/organization";

function submissionPath(
  organizationSlug: string,
  formId: string,
  period?: OrganizationDashboard["period"],
) {
  const path = organizationWorkspacePath(organizationSlug, `/forms/${formId}`);
  if (!period) return path;
  const through = new Date(period.before);
  through.setDate(through.getDate() - 1);
  return `${path}?${new URLSearchParams({
    status: "submitted",
    from: format(new Date(period.from), "yyyy-MM-dd"),
    through: format(through, "yyyy-MM-dd"),
  })}`;
}

export function FormsOverview({
  forms,
  dashboard,
  organizationSlug,
}: {
  forms: DashboardForm[];
  dashboard: OrganizationDashboard;
  organizationSlug: string;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            <TableHead className="min-w-60 px-5">Form</TableHead>
            <TableHead className="px-4">Availability</TableHead>
            <TableHead className="px-4 text-right">Submissions</TableHead>
            <TableHead className="px-4 text-right">Unfinished</TableHead>
            <TableHead className="min-w-36 px-5 text-right">Last submission</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {forms.map((form) => (
            <TableRow key={form.id}>
              <TableCell className="px-5 py-4">
                <Link
                  href={submissionPath(organizationSlug, form.id)}
                  className="flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {form.type === "PUBLIC" ? (
                      <Globe2 className="size-5" aria-hidden="true" />
                    ) : (
                      <UsersRound className="size-5" aria-hidden="true" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block max-w-64 truncate font-medium" title={form.name}>
                      {form.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {form.type === "PUBLIC" ? "Public" : "Users only"}
                    </span>
                  </span>
                </Link>
              </TableCell>
              <TableCell className="px-4">
                <Badge variant={form.isClosed ? "outline" : "secondary"}>
                  {form.isClosed ? "Closed" : "Open"}
                </Badge>
              </TableCell>
              <TableCell className="px-4 text-right">
                <Link
                  className="inline-flex min-h-11 min-w-11 items-center justify-end rounded-md font-medium tabular-nums underline decoration-border underline-offset-4 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  href={submissionPath(organizationSlug, form.id, dashboard.period)}
                  aria-label={`View ${form.submissions} submissions for ${form.name} in the selected period`}
                >
                  {form.submissions.toLocaleString()}
                </Link>
              </TableCell>
              <TableCell className="px-4 text-right">
                {form.type === "AUTHENTICATED" ? (
                  <Link
                    href={`${submissionPath(organizationSlug, form.id)}?status=started`}
                    className="inline-flex min-h-11 min-w-11 items-center justify-end rounded-md tabular-nums underline decoration-border underline-offset-4 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`View ${form.unfinished} unfinished submissions for ${form.name}`}
                  >
                    {form.unfinished.toLocaleString()}
                  </Link>
                ) : (
                  <span
                    className="text-muted-foreground"
                    aria-label="Public forms do not save unfinished submissions"
                  >
                    —
                  </span>
                )}
              </TableCell>
              <TableCell className="px-5 text-right text-xs text-muted-foreground">
                {form.lastSubmittedAt ? (
                  <time
                    dateTime={form.lastSubmittedAt}
                    title={format(new Date(form.lastSubmittedAt), "PPpp")}
                    suppressHydrationWarning
                  >
                    {formatDistanceToNowStrict(new Date(form.lastSubmittedAt), { addSuffix: true })}
                  </time>
                ) : (
                  "No submissions yet"
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
