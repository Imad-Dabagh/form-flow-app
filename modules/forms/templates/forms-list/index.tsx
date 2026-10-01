"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import API from "@/router";
import { Button } from "@/modules/shared/components/ui/button";
import {
  organizationWorkspacePath,
  useOrganizationPermissions,
  useOrganizationWorkspace,
} from "@/modules/organizations";
import { CreateFormDialog } from "./create-form-dialog";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(value),
  );
}

export function FormsListTemplate() {
  const organization = useOrganizationWorkspace();
  const { canManageForms } = useOrganizationPermissions();
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
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
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
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
              <Link
                key={form.id}
                href={organizationWorkspacePath(organization.slug, `/forms/${form.id}/builder`)}
                className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/50"
              >
                <FileText className="size-5 shrink-0 text-primary" />
                <span className="min-w-0 flex-1 truncate font-medium">{form.name}</span>
                <span className="shrink-0 text-sm text-muted-foreground">
                  Updated {formatDate(form.updatedAt)}
                </span>
              </Link>
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
            <Button className="mt-5" onClick={() => setCreateOpen(true)}>
              Create form
            </Button>
          )}
        </div>
      )}

      {canManageForms && (
        <CreateFormDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          organizationSlug={organization.slug}
        />
      )}
    </div>
  );
}
