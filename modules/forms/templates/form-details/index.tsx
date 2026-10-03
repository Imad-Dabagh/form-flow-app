"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowUpRight, FileText, LayoutTemplate } from "lucide-react";
import API from "@/router";
import type { OrganizationFormDetails } from "@/router/orgs/forms";
import type { FormSubmission, FormSubmissionAnswer } from "@/router/orgs/forms/submissions";
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

type QuestionColumn = { id: string; title: string; sectionTitle: string };

function getQuestionColumns(form: OrganizationFormDetails, submissions: FormSubmission[]) {
  const columns = new Map<string, QuestionColumn>();

  for (const section of form.sections) {
    for (const question of section.questions) {
      columns.set(question._id, {
        id: question._id,
        title: question.title,
        sectionTitle: section.title,
      });
    }
  }

  for (const submission of submissions) {
    for (const answer of submission.answers) {
      if (!columns.has(answer.questionId)) {
        columns.set(answer.questionId, {
          id: answer.questionId,
          title: answer.questionTitle,
          sectionTitle: answer.sectionTitle,
        });
      }
    }
  }

  return [...columns.values()];
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
      <TooltipContent side="top" sideOffset={6}>{time}</TooltipContent>
    </Tooltip>
  );
}

function SubmittedByCell({ submittedBy }: { submittedBy: FormSubmission["submittedBy"] }) {
  const knownUser = submittedBy.kind === "user";
  const name = knownUser ? submittedBy.name : submittedBy.kind === "former-user" ? "Former user" : "Unknown user";
  const initials = name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

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
        <span className="block truncate font-medium" title={name}>{name}</span>
        {knownUser && (
          <span className="block truncate text-xs text-muted-foreground" title={submittedBy.email}>
            {submittedBy.email}
          </span>
        )}
      </div>
    </div>
  );
}

function isFile(value: unknown): value is { name?: string; url: string } {
  return typeof value === "object" && value !== null &&
    "url" in value && typeof value.url === "string";
}

function AnswerValue({ answer }: { answer?: FormSubmissionAnswer }) {
  if (!answer || answer.value === null || answer.value === undefined || answer.value === "") {
    return <span className="text-muted-foreground">—</span>;
  }

  if (answer.inputType === "file" && Array.isArray(answer.value)) {
    const files = answer.value.filter(isFile);
    return files.length ? (
      <div className="flex flex-col items-start gap-1">
        {files.map((file, index) => {
          const safeUrl = /^https?:\/\//i.test(file.url);
          return safeUrl ? (
            <a
              key={`${file.url}-${index}`}
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex max-w-full items-center gap-1 truncate text-primary hover:underline"
            >
              <span className="truncate">{file.name || `File ${index + 1}`}</span>
              <ArrowUpRight className="size-3 shrink-0" />
            </a>
          ) : (
            <span key={index}>{file.name || `File ${index + 1}`}</span>
          );
        })}
      </div>
    ) : <span className="text-muted-foreground">—</span>;
  }

  if (answer.selectedOptions?.length) {
    return <span>{answer.selectedOptions.map((option) => option.label).join(", ")}</span>;
  }

  if (typeof answer.value === "boolean") return <span>{answer.value ? "Yes" : "No"}</span>;
  if (Array.isArray(answer.value)) {
    return <span>{answer.value.map(String).join(", ") || "—"}</span>;
  }
  if (typeof answer.value === "object") {
    return <span>{JSON.stringify(answer.value)}</span>;
  }

  return <span>{String(answer.value)}</span>;
}

export function FormDetailsTemplate() {
  const organization = useOrganizationWorkspace();
  const { organizationSlug, formId } = useParams<{
    organizationSlug: string;
    formId: string;
  }>();
  const { form, error: formError, isLoading: isFormLoading } = API.orgs.forms.useFindById({
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
  const columns = form ? getQuestionColumns(form, submissions) : [];
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

          {areSubmissionsLoading ? (
            <div className="rounded-xl border border-border bg-card px-5 py-12 text-sm text-muted-foreground">
              Loading submissions…
            </div>
          ) : submissionsError && submissions.length === 0 ? (
            <p className="text-sm text-destructive">{submissionsError.message}</p>
          ) : submissions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 px-5 py-14 text-center">
              <FileText className="mx-auto size-7 text-muted-foreground" />
              <h3 className="mt-4 font-medium">No submissions yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Answers will appear here after someone submits this form.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-border bg-card">
                <Table className="min-w-max">
                  <TableHeader className="bg-muted/40">
                    <TableRow className="hover:bg-transparent">
                      {isAuthenticatedForm && <TableHead className="min-w-64 px-5">User</TableHead>}
                      <TableHead className={isAuthenticatedForm ? "min-w-36 px-4" : "min-w-36 px-5"}>
                        Submitted at
                      </TableHead>
                      {columns.map((column) => (
                        <TableHead key={column.id} className="min-w-48 max-w-72 px-4 py-3 whitespace-normal">
                          <span className="block text-xs font-normal text-muted-foreground">
                            {column.sectionTitle}
                          </span>
                          <span className="block font-medium">{column.title}</span>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => {
                      const answers = new Map(submission.answers.map((answer) => [answer.questionId, answer]));
                      return (
                        <TableRow key={submission.id}>
                          {isAuthenticatedForm && (
                            <TableCell className="max-w-72 px-5 py-4">
                              <SubmittedByCell submittedBy={submission.submittedBy} />
                            </TableCell>
                          )}
                          <TableCell className={isAuthenticatedForm ? "px-4 py-4 text-sm" : "px-5 py-4 text-sm"}>
                            <SubmittedDate value={submission.submittedAt} />
                          </TableCell>
                          {columns.map((column) => (
                            <TableCell
                              key={column.id}
                              className="max-w-72 px-4 py-4 whitespace-normal break-words"
                            >
                              <AnswerValue answer={answers.get(column.id)} />
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {(hasMore || isLoadingMore || submissionsError) && (
                <div className="flex flex-col items-center gap-2">
                  {submissionsError && <p className="text-sm text-destructive">{submissionsError.message}</p>}
                  {hasMore && (
                    <Button variant="outline" disabled={isLoadingMore} onClick={loadMore}>
                      {isLoadingMore ? "Loading…" : submissionsError ? "Try again" : "Load more submissions"}
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      )}
    </WorkspacePage>
  );
}
