"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, FileText, Pencil, Plus } from "lucide-react";
import API from "@/router";
import type { OrganizationForm } from "@/router/orgs/forms";
import { CreateEditFormModal } from "@/modules/forms/components/create-edit-form-modal";
import { Badge } from "@/modules/shared/components/ui/badge";
import { Button } from "@/modules/shared/components/ui/button";
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

      {isLoading ? (
        <p className="py-12 text-sm text-muted-foreground">Loading forms…</p>
      ) : error ? (
        <p className="py-12 text-sm text-destructive">{error.message}</p>
      ) : formsPage?.items.length ? (
        <div className="space-y-5">
          <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {formsPage.items.map((form) => (
              <div
                key={form.id}
                className="flex items-center gap-2 pr-3 transition-colors hover:bg-muted/50"
              >
                <Link
                  href={organizationWorkspacePath(organization.slug, `/forms/${form.id}`)}
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
                    href={`/orgs/${organization.slug}/submit/${form.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${form.name} submission form`}
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
    </WorkspacePage>
  );
}
