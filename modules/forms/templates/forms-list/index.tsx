"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Archive as ArchiveIcon,
  ChevronDown,
  Copy,
  FileText,
  Globe2,
  LayoutTemplate,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import API from "@/router";
import type { OrganizationForm, OrganizationFormListItem } from "@/router/orgs/forms";
import { toApiError } from "@/lib/api-error";
import { CreateFormModal } from "@/modules/forms/components/create-form-modal";
import { FormSettingsDrawer } from "@/modules/forms/patterns/form-settings-drawer";
import { Badge } from "@/modules/shared/components/ui/badge";
import { Button } from "@/modules/shared/components/ui/button";
import { Input } from "@/modules/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/shared/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/modules/shared/components/ui/toggle-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/modules/shared/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/modules/shared/components/ui/alert-dialog";
import { Pagination } from "@/modules/shared/components/pagination";
import {
  WorkspacePage,
  PageNavigation,
  PageBreadcrumbs,
} from "@/modules/shared/components/workspace";
import {
  organizationWorkspacePath,
  useOrganizationPermissions,
  useOrganizationWorkspace,
} from "@/modules/organizations";

export function FormsListTemplate() {
  const organization = useOrganizationWorkspace();
  const { canManageForms } = useOrganizationPermissions();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"all" | "PUBLIC" | "AUTHENTICATED">("all");
  const [status, setStatus] = useState<"active" | "archived">("active");
  const [closed, setClosed] = useState<"all" | "open" | "closed">("all");
  const [formModal, setFormModal] = useState<
    { mode: "create" } | { mode: "edit"; form: OrganizationForm; tab?: "general" | "builder" } | null
  >(null);
  const [pendingArchive, setPendingArchive] = useState<OrganizationForm | null>(null);
  const setArchived = API.orgs.forms.useSetArchivedById({ organizationSlug: organization.slug });
  const { formsPage, error, isLoading } = API.orgs.forms.useFindAll({
    organizationSlug: organization.slug,
    page,
    search,
    type,
    status,
    closed,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const hasFilters = searchInput.trim() !== "" || type !== "all" || closed !== "all";

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setType("all");
    setClosed("all");
    setPage(1);
  }

  async function copyLink(form: OrganizationForm) {
    const path = organizationWorkspacePath(organization.slug, `/submit/${form.id}`);
    try {
      await navigator.clipboard.writeText(new URL(path, window.location.origin).href);
      toast.success("Form link copied");
    } catch {
      toast.error("Could not copy the form link.");
    }
  }

  async function updateArchive(form: OrganizationForm, archived: boolean) {
    if (setArchived.isMutating) return;
    try {
      await setArchived.trigger({ formId: form.id, archived });
      if (formsPage?.items.length === 1 && page > 1) setPage(page - 1);
      toast.success(archived ? "Form archived" : "Form restored");
      if (archived) setPendingArchive(null);
    } catch (error) {
      toast.error(toApiError(error).message);
    }
  }

  return (
    <WorkspacePage>
      <PageNavigation title="Forms">
        <PageBreadcrumbs
          items={[
            {
              label: organization.name,
              href: organizationWorkspacePath(organization.slug, "/dashboard"),
            },
            { label: "Forms" },
          ]}
        />
        {canManageForms && (
          <Button onClick={() => setFormModal({ mode: "create" })} className="shrink-0 gap-2">
            <Plus className="size-4" /> Create form
          </Button>
        )}
      </PageNavigation>

      <div className="mb-6 rounded-xl border border-border bg-card p-3 shadow-sm sm:p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Search forms by name"
              value={searchInput}
              maxLength={100}
              onChange={(event) => {
                setSearchInput(event.target.value);
                setPage(1);
              }}
              placeholder="Search forms"
              className="h-10 pl-9"
            />
          </div>
          <ToggleGroup
            type="single"
            aria-label="Filter forms by access"
            value={type}
            onValueChange={(value) => {
              if (!value) return;
              setType(value as typeof type);
              setPage(1);
            }}
            className="gap-1 rounded-lg border border-border bg-muted/50 p-1"
          >
            <ToggleGroupItem
              value="all"
              className="h-8 rounded-md px-4 text-xs data-[state=on]:bg-card data-[state=on]:text-foreground data-[state=on]:shadow-sm"
            >
              All
            </ToggleGroupItem>
            <ToggleGroupItem
              value="PUBLIC"
              className="h-8 rounded-md px-4 text-xs data-[state=on]:bg-card data-[state=on]:text-foreground data-[state=on]:shadow-sm"
            >
              Public
            </ToggleGroupItem>
            <ToggleGroupItem
              value="AUTHENTICATED"
              className="h-8 rounded-md px-5 text-xs data-[state=on]:bg-card data-[state=on]:text-foreground data-[state=on]:shadow-sm"
            >
              Users only
            </ToggleGroupItem>
          </ToggleGroup>
          {status === "active" && (
            <Select
              value={closed}
              onValueChange={(value) => {
                setClosed(value as typeof closed);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-36" aria-label="Filter by availability">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All forms</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          )}
          <ToggleGroup
            type="single"
            aria-label="Filter forms by status"
            value={status}
            onValueChange={(value) => {
              if (!value) return;
              setStatus(value as typeof status);
              setClosed("all");
              setPage(1);
            }}
            className="ml-auto gap-1 rounded-lg border border-border bg-muted/50 p-1"
          >
            <ToggleGroupItem
              value="active"
              className="h-8 rounded-md px-4 text-xs data-[state=on]:bg-card data-[state=on]:text-foreground data-[state=on]:shadow-sm"
            >
              Active
            </ToggleGroupItem>
            <ToggleGroupItem
              value="archived"
              className="h-8 rounded-md px-4 text-xs data-[state=on]:bg-card data-[state=on]:text-foreground data-[state=on]:shadow-sm"
            >
              Archived
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {isLoading ? (
        <p className="py-12 text-sm text-muted-foreground">Loading forms…</p>
      ) : error ? (
        <p className="py-12 text-sm text-destructive">{error.message}</p>
      ) : formsPage?.items.length ? (
        <div className="space-y-5">
          <div className="space-y-2.5">
            {formsPage.items.map((form) => (
              <div
                key={form.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-sm transition-[border-color,box-shadow] hover:border-primary/25 hover:shadow-md sm:flex-row sm:items-center sm:justify-between sm:px-4"
              >
                {form.archivedAt ? (
                  <div className="grid min-w-0 flex-1 grid-cols-[3rem_minmax(0,1fr)] items-center gap-3">
                    <FormCardIdentity form={form} />
                  </div>
                ) : (
                  <Link
                    href={organizationWorkspacePath(organization.slug, `/forms/${form.id}`)}
                    className="grid min-w-0 flex-1 grid-cols-[3rem_minmax(0,1fr)] items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <FormCardIdentity form={form} />
                  </Link>
                )}
                <div className="flex items-center gap-2 sm:shrink-0">
                  {form.archivedAt ? (
                    canManageForms && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-10 flex-1 sm:h-8 sm:flex-none"
                        disabled={setArchived.isMutating}
                        onClick={() => void updateArchive(form, false)}
                      >
                        <RotateCcw className="size-4" /> Restore
                      </Button>
                    )
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-10 flex-1 sm:h-8 sm:flex-none"
                        onClick={() => copyLink(form)}
                      >
                        <Copy className="size-4" /> Copy Link
                      </Button>
                      {canManageForms && (
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-10 flex-1 sm:h-8 sm:flex-none"
                            >
                              Actions <ChevronDown className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            side="bottom"
                            sideOffset={6}
                            className="min-w-44"
                          >
                            <DropdownMenuItem onSelect={() => setFormModal({ mode: "edit", form })}>
                              <Pencil className="size-4" /> Edit Form
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => setFormModal({ mode: "edit", form, tab: "builder" })}
                            >
                              <LayoutTemplate className="size-4" /> Open Builder
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onSelect={() => setPendingArchive(form)}
                            >
                              <ArchiveIcon className="size-4" /> Archive
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Pagination
            page={page}
            pageSize={formsPage.pageSize}
            total={formsPage.total}
            onPageChange={setPage}
          />
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 px-5 py-14 text-center">
          <FileText className="mx-auto size-7 text-muted-foreground" />
          <h2 className="mt-4 font-medium">
            {hasFilters
              ? "No matching forms"
              : status === "archived"
                ? "No archived forms"
                : "No forms yet"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {hasFilters
              ? "Try a different search or filter."
              : status === "archived"
                ? "Archived forms will appear here."
                : "Create the first form for this organization."}
          </p>
          {hasFilters ? (
            <Button variant="outline" className="mt-5" onClick={clearFilters}>
              Clear filters
            </Button>
          ) : canManageForms && status === "active" ? (
            <Button className="mt-5" onClick={() => setFormModal({ mode: "create" })}>
              Create form
            </Button>
          ) : null}
        </div>
      )}

      {canManageForms && formModal?.mode === "create" && (
        <CreateFormModal
          key="create"
          open
          onOpenChange={(open) => {
            if (!open) setFormModal(null);
          }}
          organizationSlug={organization.slug}
          onCreated={(form) => setFormModal({ mode: "edit", form, tab: "builder" })}
        />
      )}
      {canManageForms && formModal?.mode === "edit" && (
        <FormSettingsDrawer
          key={formModal.form.id}
          open
          onOpenChange={(open) => {
            if (!open) setFormModal(null);
          }}
          organizationSlug={organization.slug}
          formId={formModal.form.id}
          initialTab={formModal.tab}
        />
      )}

      <AlertDialog
        open={pendingArchive !== null}
        onOpenChange={(open) => {
          if (!open && !setArchived.isMutating) setPendingArchive(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive “{pendingArchive?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This form will leave the active list and its submission link will stop working.
              Existing submissions stay saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={setArchived.isMutating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={setArchived.isMutating}
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={(event) => {
                event.preventDefault();
                if (pendingArchive) void updateArchive(pendingArchive, true);
              }}
            >
              {setArchived.isMutating ? "Archiving…" : "Archive form"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </WorkspacePage>
  );
}

function FormCardIdentity({ form }: { form: OrganizationFormListItem }) {
  return (
    <>
      <span className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {form.type === "PUBLIC" ? (
          <Globe2 className="size-6" aria-hidden="true" />
        ) : (
          <UsersRound className="size-6" aria-hidden="true" />
        )}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-base font-semibold text-foreground" title={form.name}>
          {form.name}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary">{form.type === "PUBLIC" ? "Public" : "Users only"}</Badge>
          {form.archivedAt ? (
            <Badge variant="outline">Archived</Badge>
          ) : form.isClosed ? (
            <Badge variant="outline">Form closed</Badge>
          ) : null}
        </span>
      </span>
    </>
  );
}
