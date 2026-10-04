"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { ArrowDownUp, ArrowUpRight, FileText, LayoutTemplate, Link2, Search } from "lucide-react";
import API from "@/router";
import type { FormFieldType, FormOption, OrganizationFormDetails } from "@/router/orgs/forms";
import type { FormSubmission } from "@/router/orgs/forms/submissions";
import { organizationWorkspacePath, useOrganizationWorkspace } from "@/modules/organizations";
import { Button } from "@/modules/shared/components/ui/button";
import { Badge } from "@/modules/shared/components/ui/badge";
import { DatePicker } from "@/modules/shared/components/date-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/modules/shared/components/ui/dropdown-menu";
import { Input } from "@/modules/shared/components/ui/input";
import { Pagination } from "@/modules/shared/components/pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/modules/shared/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/modules/shared/components/ui/tooltip";
import { ToggleGroup, ToggleGroupItem } from "@/modules/shared/components/ui/toggle-group";
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

function SubmissionDate({ value, kind }: { value: string; kind: "Submitted" | "Started" }) {
  const timestamp = new Date(value);
  const date = new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(timestamp);
  const time = new Intl.DateTimeFormat("en", { timeStyle: "short" }).format(timestamp);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <time
          dateTime={value}
          aria-label={`${kind} ${date} at ${time}`}
          tabIndex={0}
          suppressHydrationWarning
          className="underline outline-none cursor-help whitespace-nowrap tabular-nums decoration-border decoration-dotted underline-offset-4 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring"
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
    <div className="flex items-center min-w-0 gap-3">
      <Avatar className="size-9 shrink-0 ring-1 ring-border/60">
        {knownUser && submittedBy.profilePic && (
          <AvatarImage src={submittedBy.profilePic} alt="" className="object-cover" />
        )}
        <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <span className="block font-medium truncate" title={name}>
          {name}
        </span>
        {knownUser && (
          <span className="block text-xs truncate text-muted-foreground" title={submittedBy.email}>
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
    <div className="flex flex-col gap-2 min-w-52">
      {files.map((file, index) => {
        const name = file.name || `File ${index + 1}`;
        const canOpen = /^https?:\/\//i.test(file.url);
        const content = (
          <>
            <span className="flex items-center justify-center rounded-md size-9 shrink-0 bg-primary/10 text-primary">
              <FileText className="size-4" aria-hidden="true" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-medium truncate text-foreground" title={name}>
                {name}
              </span>
              <span className="block text-xs truncate text-muted-foreground" title={file.mimeType}>
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
            <span className="flex items-center justify-center rounded-md size-9 shrink-0 bg-primary/10 text-primary">
              <Link2 className="size-4" aria-hidden="true" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-medium truncate text-foreground" title={url.host}>
                {url.host}
              </span>
              <span className="block text-xs truncate text-muted-foreground" title={value}>
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

export function SubmissionsListTemplate() {
  const organization = useOrganizationWorkspace();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [through, setThrough] = useState("");
  const [status, setStatus] = useState<"all" | "submitted" | "started">("submitted");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
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
    submissionsPage,
    isLoading: areSubmissionsLoading,
    error: submissionsError,
  } = API.orgs.forms.submissions.useFindAll({
    organizationSlug,
    formId,
    page,
    search: form?.type === "AUTHENTICATED" ? search : "",
    status: form?.type === "AUTHENTICATED" ? status : "submitted",
    sort,
    from,
    through,
  });
  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);
  const submissions = submissionsPage?.items ?? [];
  const columns = form ? getQuestionColumns(form) : [];
  const isAuthenticatedForm = form?.type === "AUTHENTICATED";
  const hasFilters =
    (isAuthenticatedForm && (searchInput.trim() !== "" || status !== "submitted")) ||
    from !== "" ||
    through !== "" ||
    sort !== "newest";
  const hasResultFilters =
    (isAuthenticatedForm && searchInput.trim() !== "") || from !== "" || through !== "";
  const emptyMessage = areSubmissionsLoading ? (
    <span className="text-sm text-muted-foreground">Loading submissions…</span>
  ) : submissionsError ? (
    <span className="text-sm text-destructive">{submissionsError.message}</span>
  ) : (
    <span className="block space-y-1">
      <span className="block text-sm font-medium">
        {hasResultFilters
          ? "No matching submissions"
          : status === "started" && isAuthenticatedForm
            ? "No started submissions"
            : "No submissions yet"}
      </span>
      <span className="block text-sm text-muted-foreground">
        {hasResultFilters
          ? "Try a different search or date range."
          : status === "started" && isAuthenticatedForm
            ? "People who open this form without submitting will appear here."
            : "Answers will appear here after someone submits this form."}
      </span>
    </span>
  );

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
          <h2 id="submissions-heading" className="text-xl font-semibold tracking-tight">
            Submissions
          </h2>

          <div className="p-3 border shadow-sm rounded-xl border-border bg-card sm:p-4">
            <div className="flex flex-wrap items-center gap-3">
              {isAuthenticatedForm && (
                <div className="relative w-full sm:w-80">
                  <Search className="absolute -translate-y-1/2 pointer-events-none left-3 top-1/2 size-4 text-muted-foreground" />
                  <Input
                    aria-label="Search submissions by user name, email, or phone"
                    value={searchInput}
                    maxLength={100}
                    onChange={(event) => {
                      setSearchInput(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Search users"
                    className="h-10 pl-9"
                  />
                </div>
              )}
              {isAuthenticatedForm && (
                <ToggleGroup
                  type="single"
                  aria-label="Filter submissions by status"
                  value={status}
                  onValueChange={(value) => {
                    if (!value) return;
                    setStatus(value as typeof status);
                    setPage(1);
                  }}
                  className="gap-1 p-1 border rounded-lg border-border bg-muted/50"
                >
                  <ToggleGroupItem
                    value="all"
                    className="h-8 rounded-md px-4 text-xs data-[state=on]:bg-card data-[state=on]:text-foreground data-[state=on]:shadow-sm"
                  >
                    All
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="submitted"
                    className="h-8 rounded-md px-5 text-xs data-[state=on]:bg-card data-[state=on]:text-foreground data-[state=on]:shadow-sm"
                  >
                    Submitted
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="started"
                    className="h-8 rounded-md px-4 text-xs data-[state=on]:bg-card data-[state=on]:text-foreground data-[state=on]:shadow-sm"
                  >
                    Started
                  </ToggleGroupItem>
                </ToggleGroup>
              )}
              <DatePicker
                mode="range"
                value={{
                  from: from ? parseISO(from) : undefined,
                  to: through ? parseISO(through) : undefined,
                }}
                onChange={(range) => {
                  setFrom(range?.from ? format(range.from, "yyyy-MM-dd") : "");
                  setThrough(range?.to ? format(range.to, "yyyy-MM-dd") : "");
                  setPage(1);
                }}
                aria-label="Filter by submission date range"
                placeholder="Select Date Range"
                className="justify-center w-full text-center sm:w-60"
              />
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-10 shrink-0"
                    aria-label={`Sort submissions: ${sort === "newest" ? "Newest First" : "Oldest First"}`}
                  >
                    <ArrowDownUp className="size-4" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={6}>
                  <DropdownMenuRadioGroup
                    value={sort}
                    onValueChange={(value) => {
                      setSort(value as typeof sort);
                      setPage(1);
                    }}
                  >
                    <DropdownMenuRadioItem value="newest">Newest First</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="oldest">Oldest First</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              {hasFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onClick={() => {
                    setSearchInput("");
                    setSearch("");
                    setFrom("");
                    setThrough("");
                    setStatus("submitted");
                    setSort("newest");
                    setPage(1);
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          </div>

          {!isAuthenticatedForm && submissions.length === 0 ? (
            <div className="px-5 text-center border border-dashed rounded-xl border-border bg-muted/20 py-14">
              <FileText className="mx-auto mb-4 size-7 text-muted-foreground" aria-hidden="true" />
              {emptyMessage}
            </div>
          ) : (
            <div className="overflow-x-auto border rounded-xl border-border bg-card">
              <Table className="min-w-max">
                <TableHeader className="bg-muted/40">
                  <TableRow className="hover:bg-transparent">
                    {isAuthenticatedForm && <TableHead className="px-5 min-w-64">User</TableHead>}
                    <TableHead className={isAuthenticatedForm ? "min-w-36 px-4" : "min-w-36 px-5"}>
                      {isAuthenticatedForm && status === "started"
                        ? "Started at"
                        : isAuthenticatedForm && status === "all"
                          ? "Date"
                          : "Submitted at"}
                    </TableHead>
                    {submissions.length > 0 &&
                      columns.map((column) => (
                        <TableHead
                          key={column.id}
                          className="px-4 py-3 whitespace-normal min-w-48 max-w-72"
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
                      <TableCell colSpan={2} className="px-5 text-center h-36">
                        {emptyMessage}
                      </TableCell>
                    </TableRow>
                  )}
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      {isAuthenticatedForm && (
                        <TableCell className="px-5 py-4 max-w-72">
                          <SubmittedByCell submittedBy={submission.submittedBy} />
                        </TableCell>
                      )}
                      <TableCell
                        className={isAuthenticatedForm ? "px-4 py-4 text-sm" : "px-5 py-4 text-sm"}
                      >
                        <div className="flex flex-col items-start gap-1.5">
                          <SubmissionDate
                            value={submission.submittedAt ?? submission.startedAt}
                            kind={submission.submittedAt ? "Submitted" : "Started"}
                          />
                          {isAuthenticatedForm && status === "all" && (
                            <Badge variant={submission.submittedAt ? "secondary" : "outline"}>
                              {submission.submittedAt ? "Submitted" : "Started"}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      {columns.map((column) => (
                        <TableCell
                          key={column.id}
                          className="px-4 py-4 whitespace-normal wrap-break-word max-w-72"
                        >
                          <AnswerValue value={submission.answers[column.id]} question={column} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {submissionsPage && submissionsPage.total > 0 && (
            <Pagination
              page={page}
              pageSize={submissionsPage.pageSize}
              total={submissionsPage.total}
              onPageChange={setPage}
            />
          )}
        </section>
      )}
    </WorkspacePage>
  );
}
