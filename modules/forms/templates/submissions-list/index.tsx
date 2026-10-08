"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import {
  ArrowDownUp,
  ArrowUpRight,
  ChevronDown,
  Copy,
  FileText,
  LayoutTemplate,
  Link2,
  LoaderCircle,
  Pencil,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import API from "@/router";
import type { FormFieldType, FormOption, OrganizationFormDetails } from "@/router/orgs/forms";
import type { FormSubmission } from "@/router/orgs/forms/submissions";
import type { FormSubmissionStatus } from "@/router/orgs/forms/submission-statuses";
import { FormSettingsDrawer } from "@/modules/forms/patterns/form-settings-drawer";
import { SubmissionDetails } from "@/modules/forms/patterns/submission-details";
import {
  getOrganizationColorSwatch,
  organizationWorkspacePath,
  useOrganizationPermissions,
  useOrganizationWorkspace,
} from "@/lib/organization";
import { SidePanel } from "@/modules/shared/components/side-panel";
import { Button } from "@/modules/shared/components/ui/button";
import { Badge } from "@/modules/shared/components/ui/badge";
import { DatePicker } from "@/modules/shared/components/date-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/modules/shared/components/ui/dropdown-menu";
import { Input } from "@/modules/shared/components/ui/input";
import { Pagination } from "@/modules/shared/components/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/modules/shared/components/ui/select";
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

function SubmissionDate({
  value,
  kind,
  onOpen,
}: {
  value: string;
  kind: "Submitted" | "Started";
  onOpen: () => void;
}) {
  const timestamp = new Date(value);
  const date = new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(timestamp);
  const time = new Intl.DateTimeFormat("en", { timeStyle: "short" }).format(timestamp);
  const fullDateTime = new Intl.DateTimeFormat("en", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(timestamp);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={`Open submission details, ${kind.toLowerCase()} on ${date} at ${time}`}
          onClick={onOpen}
          className="cursor-pointer underline outline-none whitespace-nowrap tabular-nums decoration-border decoration-dotted underline-offset-4 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring"
        >
          <time dateTime={value} suppressHydrationWarning>
            {date}
          </time>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={6}>
        {fullDateTime}
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

function SubmissionStatusCell({
  submission,
  statuses,
  canChange,
  isUpdating,
  isLoading,
  hasLoadError,
  isBusy,
  onChange,
}: {
  submission: FormSubmission;
  statuses: FormSubmissionStatus[];
  canChange: boolean;
  isUpdating: boolean;
  isLoading: boolean;
  hasLoadError: boolean;
  isBusy: boolean;
  onChange: (submission: FormSubmission, statusId: string) => void;
}) {
  const current = statuses.find((status) => status.id === submission.submissionStatusId);
  const options = statuses.filter((status) => status.id !== submission.submissionStatusId);
  const label = current?.name ?? (isLoading
    ? "Loading status…"
    : hasLoadError ? "Status unavailable"
      : submission.submissionStatusId ? "Unknown status" : "Unassigned");
  const color = current ? getOrganizationColorSwatch(current.color) : null;
  const style = color ? {
    backgroundColor: `color-mix(in oklch, ${color} 12%, transparent)`,
    borderColor: `color-mix(in oklch, ${color} 38%, transparent)`,
  } : undefined;
  const content = (
    <>
      <span
        className="size-2 shrink-0 rounded-full"
        style={{ backgroundColor: color ?? "currentColor" }}
        aria-hidden="true"
      />
      <span className="max-w-36 truncate">{label}</span>
    </>
  );

  if (!canChange || options.length === 0) {
    return (
      <Badge variant="outline" className="min-h-8 gap-2 rounded-full px-2.5 py-1" style={style}>
        {content}
      </Badge>
    );
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={isBusy}
          aria-label={`Change submission status, currently ${label}`}
          className="inline-flex min-h-8 items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium text-foreground outline-none transition-[box-shadow,transform] hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
          style={style}
        >
          {content}
          {isUpdating
            ? <LoaderCircle className="size-3 animate-spin" aria-hidden="true" />
            : <ChevronDown className="size-3 text-muted-foreground" aria-hidden="true" />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className="min-w-44"
        onClick={(event) => event.stopPropagation()}
      >
        {options.map((status) => (
          <DropdownMenuItem key={status.id} onSelect={() => onChange(submission, status.id)}>
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: getOrganizationColorSwatch(status.color) }}
              aria-hidden="true"
            />
            <span className="truncate">{status.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
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
  const { canManageForms } = useOrganizationPermissions();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [through, setThrough] = useState("");
  const [status, setStatus] = useState<"all" | "submitted" | "started">("submitted");
  const [submissionStatusId, setSubmissionStatusId] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [updatingSubmissionId, setUpdatingSubmissionId] = useState<string | null>(null);
  const [settingsTab, setSettingsTab] = useState<"general" | "builder" | null>(null);
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
    submissionStatusId,
    sort,
    from,
    through,
  });
  const {
    statuses: submissionStatuses,
    isLoading: areStatusesLoading,
    error: statusesError,
  } = API.orgs.forms.submissionStatuses.useFindAll({
    organizationSlug,
    formId,
  });
  useEffect(() => {
    if (
      submissionStatusId && !areStatusesLoading && !statusesError &&
      !submissionStatuses.some((item) => item.id === submissionStatusId)
    ) {
      setSubmissionStatusId("");
      setPage(1);
    }
  }, [submissionStatusId, submissionStatuses, areStatusesLoading, statusesError]);
  const { trigger: updateSubmissionStatus } = API.orgs.forms.submissions.useUpdateStatus({
    organizationSlug,
    formId,
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
    submissionStatusId !== "" ||
    from !== "" ||
    through !== "" ||
    sort !== "newest";
  const hasResultFilters =
    (isAuthenticatedForm && searchInput.trim() !== "") ||
    submissionStatusId !== "" || from !== "" || through !== "";
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
          ? "Try different filters."
          : status === "started" && isAuthenticatedForm
            ? "People who open this form without submitting will appear here."
            : "Answers will appear here after someone submits this form."}
      </span>
    </span>
  );

  async function copyFormLink() {
    if (!form) return;
    const path = organizationWorkspacePath(organizationSlug, `/submit/${form.id}`);
    try {
      await navigator.clipboard.writeText(new URL(path, window.location.origin).href);
      toast.success("Form link copied");
    } catch {
      toast.error("Could not copy the form link.");
    }
  }

  async function changeSubmissionStatus(submission: FormSubmission, submissionStatusId: string) {
    setUpdatingSubmissionId(submission.id);
    try {
      await updateSubmissionStatus({ submissionId: submission.id, submissionStatusId });
      setSelectedSubmission((current) => current?.id === submission.id
        ? { ...current, submissionStatusId }
        : current);
      toast.success("Submission status updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update the submission status.");
    } finally {
      setUpdatingSubmissionId(null);
    }
  }

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
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-10 sm:h-8"
              onClick={() => void copyFormLink()}
            >
              <Copy className="size-4" /> Copy Link
            </Button>
            {canManageForms && (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="outline" size="sm" className="h-10 sm:h-8">
                    Actions <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="bottom" sideOffset={6} className="min-w-44">
                  <DropdownMenuItem onSelect={() => setSettingsTab("general")}>
                    <Pencil className="size-4" /> Edit Form
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setSettingsTab("builder")}>
                    <LayoutTemplate className="size-4" /> Open Builder
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
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
                  aria-label="Filter submissions by completion"
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
              <Select
                value={submissionStatusId || "all"}
                onValueChange={(value) => {
                  setSubmissionStatusId(value === "all" ? "" : value);
                  setPage(1);
                }}
              >
                <SelectTrigger
                  aria-label="Filter by submission status"
                  className="h-10 w-full sm:w-48"
                  disabled={areStatusesLoading && submissionStatuses.length === 0}
                >
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {submissionStatuses.map((submissionStatus) => (
                    <SelectItem key={submissionStatus.id} value={submissionStatus.id}>
                      <span className="flex items-center gap-2">
                        <span
                          className="size-2.5 rounded-full"
                          style={{ backgroundColor: getOrganizationColorSwatch(submissionStatus.color) }}
                          aria-hidden="true"
                        />
                        {submissionStatus.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                    setSubmissionStatusId("");
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
                    <TableHead className="min-w-44 px-4">Status</TableHead>
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
                      <TableCell colSpan={3} className="px-5 text-center h-36">
                        {emptyMessage}
                      </TableCell>
                    </TableRow>
                  )}
                  {submissions.map((submission) => (
                    <TableRow
                      key={submission.id}
                      data-state={selectedSubmission?.id === submission.id ? "selected" : undefined}
                      className="cursor-pointer"
                      onClick={(event) => {
                        if (
                          event.target instanceof Element &&
                          event.target.closest(
                            "a, button, input, select, textarea, [role='button'], [role='menuitem']",
                          )
                        ) {
                          return;
                        }
                        event.currentTarget.querySelector("button")?.focus();
                        setSelectedSubmission(submission);
                      }}
                    >
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
                            onOpen={() => setSelectedSubmission(submission)}
                          />
                          {isAuthenticatedForm && status === "all" && (
                            <Badge variant={submission.submittedAt ? "secondary" : "outline"}>
                              {submission.submittedAt ? "Submitted" : "Started"}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <SubmissionStatusCell
                          submission={submission}
                          statuses={submissionStatuses}
                          canChange={canManageForms}
                          isUpdating={updatingSubmissionId === submission.id}
                          isLoading={areStatusesLoading}
                          hasLoadError={Boolean(statusesError)}
                          isBusy={updatingSubmissionId !== null}
                          onChange={(item, statusId) => void changeSubmissionStatus(item, statusId)}
                        />
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

          <SidePanel
            isOpen={selectedSubmission !== null}
            onClose={() => setSelectedSubmission(null)}
            title="Submission details"
            className="sm:w-[80vw] sm:max-w-[80vw]"
          >
            {selectedSubmission && (
              <SubmissionDetails form={form} submission={selectedSubmission} />
            )}
          </SidePanel>
        </section>
      )}

      {form && canManageForms && settingsTab && (
        <FormSettingsDrawer
          key={form.id}
          open
          onOpenChange={(open) => {
            if (!open) setSettingsTab(null);
          }}
          organizationSlug={organizationSlug}
          formId={form.id}
          initialTab={settingsTab}
        />
      )}
    </WorkspacePage>
  );
}
