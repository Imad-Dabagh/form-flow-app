"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, FileText, Pencil, Plus } from "lucide-react";
import API from "@/router";
import type { OrganizationForm } from "@/router/orgs/forms";
import { CreateEditFormModal } from "@/modules/forms/components/create-edit-form-modal";
import { Badge } from "@/modules/shared/components/ui/badge";
import { Button } from "@/modules/shared/components/ui/button";
import {
  organizationWorkspacePath,
  useOrganizationPermissions,
  useOrganizationWorkspace,
} from "@/modules/organizations";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(value),
  );
}

export function FormsListTemplate() {
  const organization = useOrganizationWorkspace();
  const { canManageForms } = useOrganizationPermissions();
  const [page, setPage] = useState(1);
  const [formModal, setFormModal] = useState<
    { mode: "create" } | { mode: "edit"; form: OrganizationForm } | null
  >(null);
  const { formsPage, error, isLoading } = API.orgs.forms.useFindAll({
    organizationSlug: organization.slug,
    page,
  });

  return (
    <div className="mx-auto w-full max-w-[69rem] px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
      <header className="flex items-end justify-between gap-4 border-b border-border pb-7">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Organization workspace
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Forms</h1>
          <p className="mt-2 text-sm text-muted-foreground">Forms in {organization.name}.</p>
        </div>
        {canManageForms && (
          <Button onClick={() => setFormModal({ mode: "create" })} className="gap-2">
            <Plus className="size-4" /> Create form
          </Button>
        )}
      </header>

      {isLoading ? (
        <p className="py-12 text-sm text-muted-foreground">Loading forms…</p>
      ) : error ? (
        <p className="py-12 text-sm text-destructive">{error.message}</p>
      ) : formsPage?.items.length ? (
        <>
          <div className="mt-6 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {formsPage.items.map((form) => (
              <div
                key={form.id}
                className="flex items-center gap-2 pr-3 transition-colors hover:bg-muted/50"
              >
                <Link
                  href={organizationWorkspacePath(organization.slug, `/forms/${form.id}/builder`)}
                  className="flex min-w-0 flex-1 items-center gap-4 px-5 py-4"
                >
                  <FileText className="size-5 shrink-0 text-primary" />
                  <span className="min-w-0 flex-1 truncate font-medium">{form.name}</span>
                  <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                    {form.type === "PUBLIC" ? "Public" : "Requires sign-in"}
                  </span>
                  {form.isClosed && <Badge variant="secondary">Closed</Badge>}
                  <span className="hidden shrink-0 text-sm text-muted-foreground md:inline">
                    Updated {formatDate(form.updatedAt)}
                  </span>
                </Link>
                <Button asChild variant="ghost" size="icon">
                  <Link
                    href={`/${organization.slug}/submit/${form.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${form.name} response form`}
                  >
                    <ExternalLink className="size-4" />
                  </Link>
                </Button>
                {canManageForms && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit ${form.name}`}
                    onClick={() => setFormModal({ mode: "edit", form })}
                  >
                    <Pencil className="size-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between gap-4 text-sm text-muted-foreground">
            <span>
              {formsPage.total} {formsPage.total === 1 ? "form" : "forms"}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span>Page {page}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={page * formsPage.pageSize >= formsPage.total}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-border bg-muted/20 px-5 py-14 text-center">
          <FileText className="mx-auto size-7 text-muted-foreground" />
          <h2 className="mt-4 font-medium">No forms yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Create the first form for this organization.
          </p>
          {canManageForms && (
            <Button className="mt-5" onClick={() => setFormModal({ mode: "create" })}>
              Create form
            </Button>
          )}
        </div>
      )}

      {canManageForms && formModal && (
        <CreateEditFormModal
          key={formModal.mode === "edit" ? formModal.form.id : "create"}
          open
          onOpenChange={(open) => {
            if (!open) setFormModal(null);
          }}
          organizationSlug={organization.slug}
          form={formModal.mode === "edit" ? formModal.form : undefined}
        />
      )}
    </div>
  );
}
