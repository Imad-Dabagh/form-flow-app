"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowUpRight, FileText, LayoutTemplate, Link2 } from "lucide-react";
import API from "@/router";
import type { FormFieldType, FormOption, OrganizationFormDetails } from "@/router/orgs/forms";
import type { FormSubmission } from "@/router/orgs/forms/submissions";
import { organizationWorkspacePath, useOrganizationWorkspace } from "@/modules/organizations";
import { Button } from "@/modules/shared/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/modules/shared/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/modules/shared/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/modules/shared/components/ui/table";
import {
  WorkspacePage,
  PageNavigation,
  PageBreadcrumbs,
} from "@/modules/shared/components/workspace";

type QuestionColumn = {
  id: string;
  title: string;
  sectionTitle: string;
  inputType: FormFieldType;
  options?: FormOption[];
};

function getQuestionColumns(form: OrganizationFormDetails) {
  return form.sections.flatMap((section) =>
    section.questions.map((question) => ({
      id: question._id,
      title: question.title,
      sectionTitle: section.title,
      inputType: question.inputType,
      options: question.options,
    })),
  );
}

function SubmittedDate({ value }: { value: string }) {
  const submittedAt = new Date(value);
  const date = new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(submittedAt);
  const time = new Intl.DateTimeFormat("en", { timeStyle: "short" }).format(submittedAt);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <time
          dateTime={value}
          aria-label={`Submitted ${date} at ${time}`}
          tabIndex={0}
          suppressHydrationWarning
          className="cursor-help whitespace-nowrap tabular-nums underline decoration-border decoration-dotted underline-offset-4 outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring"
        >
          {date}
        </time>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={6}>
        {time}
      </TooltipContent>
    </Tooltip>
  );
}

function SubmittedByCell({ submittedBy }: { submittedBy: FormSubmission["submittedBy"] }) {
  const knownUser = submittedBy.kind === "user";
  const name = knownUser
    ? submittedBy.name
    : submittedBy.kind === "former-user"
      ? "Former user"
      : "Unknown user";
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar className="size-9 shrink-0 ring-1 ring-border/60">
        {knownUser && submittedBy.profilePic && (
          <AvatarImage src={submittedBy.profilePic} alt="" className="object-cover" />
        )}
        <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <span className="block truncate font-medium" title={name}>
          {name}
        </span>
        {knownUser && (
          <span className="block truncate text-xs text-muted-foreground" title={submittedBy.email}>
            {submittedBy.email}
          </span>
        )}
      </div>
    </div>
  );
}

function isFile(value: unknown): value is { name?: string; mimeType?: string; url: string } {
  return (
    typeof value === "object" && value !== null && "url" in value && typeof value.url === "string"
  );
}

function FileAnswer({ value }: { value: unknown }) {
  const files = Array.isArray(value) ? value.filter(isFile) : [];
  if (!files.length)
    return <span className="text-xs text-muted-foreground">No files uploaded</span>;

  return (
    <div className="flex min-w-52 flex-col gap-2">
      {files.map((file, index) => {
        const name = file.name || `File ${index + 1}`;
        const canOpen = /^https?:\/\//i.test(file.url);
        const content = (
          <>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <FileText className="size-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground" title={name}>
                {name}
              </span>
              <span className="block truncate text-xs text-muted-foreground" title={file.mimeType}>
                {file.mimeType || "File"}
              </span>
            </span>
            {canOpen && (
              <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            )}
          </>
        );

        return canOpen ? (
          <a
            key={`${file.url}-${index}`}
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${name} in a new tab`}
            className="flex min-w-0 items-center gap-2.5 rounded-lg border border-border bg-background p-2.5 transition-[border-color,background-color] hover:border-primary/50 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {content}
          </a>
        ) : (
          <div
            key={index}
            className="flex min-w-0 items-center gap-2.5 rounded-lg border border-border bg-background p-2.5"
          >
            {content}
          </div>
        );
      })}
    </div>
  );
}

function AnswerValue({ value, question }: { value: unknown; question: QuestionColumn }) {
  if (question.inputType === "file") return <FileAnswer value={value} />;

  if (value === null || value === undefined || value === "") {
    return <span className="text-muted-foreground">—</span>;
  }

  if (question.inputType === "url" && typeof value === "string") {
    try {
      const url = new URL(value);
      if (["http:", "https:"].includes(url.protocol) && url.hostname) {
        return (
          <a
            href={url.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${value} in a new tab`}
            className="flex min-w-52 max-w-72 items-center gap-2.5 rounded-lg border border-border bg-background p-2.5 transition-[border-color,background-color] hover:border-primary/50 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Link2 className="size-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground" title={url.host}>
                {url.host}
              </span>
              <span className="block truncate text-xs text-muted-foreground" title={value}>
                {value}
              </span>
            </span>
            <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          </a>
        );
      }
    } catch {
      // An invalid saved value is shown as text instead of an unsafe link.
    }
  }

  if (["select", "radio", "multi-select", "checkboxes"].includes(question.inputType)) {
    const selected = Array.isArray(value) ? value : [value];
    return (
      <span>
        {selected
          .map(
            (item) =>
              question.options?.find((option) => option.value === item)?.label ?? String(item),
          )
          .join(", ") || "—"}
      </span>
    );
  }

  if (typeof value === "boolean") return <span>{value ? "Yes" : "No"}</span>;
  if (Array.isArray(value)) {
    return <span>{value.map(String).join(", ") || "—"}</span>;
  }
  if (typeof value === "object") {
    return <span>{JSON.stringify(value)}</span>;
  }

  return <span>{String(value)}</span>;
}

export function FormDetailsTemplate() {
  const organization = useOrganizationWorkspace();
  const { organizationSlug, formId } = useParams<{
    organizationSlug: string;
    formId: string;
  }>();
  const {
    form,
    error: formError,
    isLoading: isFormLoading,
  } = API.orgs.forms.useFindById({
    organizationSlug,
    formId,
  });
  const {
    submissions,
    hasMore,
    isLoading: areSubmissionsLoading,
    isLoadingMore,
    loadMore,
    error: submissionsError,
  } = API.orgs.forms.submissions.useFindAll({ organizationSlug, formId });
  const columns = form ? getQuestionColumns(form) : [];
  const isAuthenticatedForm = form?.type === "AUTHENTICATED";

  return (
    <WorkspacePage>
      <PageNavigation title={form?.name ?? "Form submissions"}>
        <PageBreadcrumbs
          items={[
            {
              label: organization.name,
              href: organizationWorkspacePath(organizationSlug, "/dashboard"),
            },
            { label: "Forms", href: organizationWorkspacePath(organizationSlug, "/forms") },
            { label: form?.name ?? (isFormLoading ? "Loading form…" : "Form unavailable") },
          ]}
        />
        {form && (
          <Button asChild size="sm" className="shrink-0">
            <Link href={organizationWorkspacePath(organizationSlug, `/forms/${formId}/builder`)}>
              <LayoutTemplate className="size-4" /> Open builder
            </Link>
          </Button>
        )}
      </PageNavigation>

      {isFormLoading ? (
        <p className="text-sm text-muted-foreground">Loading form…</p>
      ) : formError || !form ? (
        <p className="text-sm text-destructive">{formError?.message ?? "Form not found."}</p>
      ) : (
        <section className="space-y-5" aria-labelledby="submissions-heading">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 id="submissions-heading" className="text-xl font-semibold tracking-tight">
                Submissions
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {areSubmissionsLoading
                  ? "Loading submissions…"
                  : `${submissions.length} ${submissions.length === 1 ? "submission" : "submissions"}${hasMore ? " loaded" : ""}`}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <Table className="min-w-max">
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent">
                  {isAuthenticatedForm && <TableHead className="min-w-64 px-5">User</TableHead>}
                  <TableHead className={isAuthenticatedForm ? "min-w-36 px-4" : "min-w-36 px-5"}>
                    Submitted at
                  </TableHead>
                  {columns.map((column) => (
                    <TableHead
                      key={column.id}
                      className="min-w-48 max-w-72 px-4 py-3 whitespace-normal"
                    >
                      <span className="block text-xs font-normal text-muted-foreground">
                        {column.sectionTitle}
                      </span>
                      <span className="block font-medium">{column.title}</span>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.length === 0 && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={columns.length + (isAuthenticatedForm ? 2 : 1)}
                      className="h-36 px-5 text-center"
                    >
                      {areSubmissionsLoading ? (
                        <span className="text-sm text-muted-foreground">Loading submissions…</span>
                      ) : submissionsError ? (
                        <span className="text-sm text-destructive">{submissionsError.message}</span>
                      ) : (
                        <span className="block space-y-1">
                          <span className="block text-sm font-medium">No submissions yet</span>
                          <span className="block text-sm text-muted-foreground">
                            Answers will appear here after someone submits this form.
                          </span>
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                )}
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    {isAuthenticatedForm && (
                      <TableCell className="max-w-72 px-5 py-4">
                        <SubmittedByCell submittedBy={submission.submittedBy} />
                      </TableCell>
                    )}
                    <TableCell
                      className={isAuthenticatedForm ? "px-4 py-4 text-sm" : "px-5 py-4 text-sm"}
                    >
                      <SubmittedDate value={submission.submittedAt} />
                    </TableCell>
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        className="max-w-72 px-4 py-4 whitespace-normal break-words"
                      >
                        <AnswerValue value={submission.answers[column.id]} question={column} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {submissions.length > 0 && (hasMore || isLoadingMore || submissionsError) && (
            <div className="flex flex-col items-center gap-2">
              {submissionsError && (
                <p className="text-sm text-destructive">{submissionsError.message}</p>
              )}
              {hasMore && (
                <Button variant="outline" disabled={isLoadingMore} onClick={loadMore}>
                  {isLoadingMore
                    ? "Loading…"
                    : submissionsError
                      ? "Try again"
                      : "Load more submissions"}
                </Button>
              )}
            </div>
          )}
        </section>
      )}
    </WorkspacePage>
  );
}
