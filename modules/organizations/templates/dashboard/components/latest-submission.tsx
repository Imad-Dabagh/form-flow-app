"use client";

import Link from "next/link";
import { format, formatDistanceToNowStrict } from "date-fns";
import { ArrowUpRight, Globe2 } from "lucide-react";
import type { DashboardSubmission } from "@/router/orgs/dashboard";
import { Avatar, AvatarFallback, AvatarImage } from "@/modules/shared/components/ui/avatar";
import { Badge } from "@/modules/shared/components/ui/badge";
import { getOrganizationColorSwatch, organizationWorkspacePath } from "@/lib/organization";

export function LatestSubmission({
  submission,
  organizationSlug,
}: {
  submission: DashboardSubmission;
  organizationSlug: string;
}) {
  const user = submission.submittedBy;
  const name =
    user.kind === "user"
      ? user.name
      : user.kind === "anonymous"
        ? "Public submission"
        : "Former user";
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const color = submission.status ? getOrganizationColorSwatch(submission.status.color) : null;
  return (
    <Link
      href={organizationWorkspacePath(organizationSlug, `/forms/${submission.formId}`)}
      aria-label={`View submissions for ${submission.formName}, latest response from ${name}`}
      className="group flex min-w-0 flex-wrap items-center gap-3 px-4 py-4 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:flex-nowrap sm:px-5"
    >
      <Avatar className="size-9 shrink-0 ring-1 ring-border/60">
        {user.kind === "user" && user.profilePic && (
          <AvatarImage src={user.profilePic} alt="" className="object-cover" />
        )}
        <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
          {user.kind === "anonymous" ? <Globe2 className="size-4" aria-hidden="true" /> : initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium" title={name}>
          {name}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground" title={submission.formName}>
          {submission.formName}
        </p>
      </div>
      <div className="flex w-full flex-wrap items-center justify-between gap-3 pl-12 sm:w-auto sm:flex-nowrap sm:justify-end sm:pl-0">
        <Badge
          variant="outline"
          className="max-w-36 gap-1.5 rounded-full"
          style={
            color
              ? {
                  backgroundColor: `color-mix(in oklch, ${color} 12%, transparent)`,
                  borderColor: `color-mix(in oklch, ${color} 30%, transparent)`,
                }
              : undefined
          }
        >
          {color && (
            <span
              className="size-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
          )}
          <span className="truncate">{submission.status?.name ?? "Status unavailable"}</span>
        </Badge>
        <time
          dateTime={submission.submittedAt}
          title={format(new Date(submission.submittedAt), "PPpp")}
          className="shrink-0 text-xs text-muted-foreground"
          suppressHydrationWarning
        >
          {formatDistanceToNowStrict(new Date(submission.submittedAt), { addSuffix: true })}
        </time>
        <ArrowUpRight
          className="hidden size-4 shrink-0 text-muted-foreground sm:block"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}
