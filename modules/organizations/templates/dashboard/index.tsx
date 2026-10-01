"use client";

import Link from "next/link";
import { ArrowUpRight, FileText, Plus } from "lucide-react";
import API from "@/router";
import { Badge } from "@/modules/shared/components/ui/badge";
import { Button } from "@/modules/shared/components/ui/button";
import { organizationWorkspacePath } from "../../paths";
import { useOrganizationWorkspace } from "../../organization-workspace-context";
import { useOrganizationPermissions } from "../../use-organization-permissions";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function OrganizationDashboardTemplate() {
  const organization = useOrganizationWorkspace();
  const { canManageForms, accessLabel } = useOrganizationPermissions();
  const { formsPage, error, isLoading } = API.orgs.forms.useFindAll({
    organizationSlug: organization.slug,
  });
  const formsPath = organizationWorkspacePath(organization.slug, "/forms");
  const recentForms = formsPage?.items.slice(0, 5) ?? [];

  return (
    <div className="mx-auto w-full max-w-[69rem] px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
      <header className="flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Organization workspace
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="min-w-0 max-w-full truncate text-2xl font-semibold tracking-[-0.035em] text-foreground sm:text-3xl">
              {organization.name}
            </h1>
            <Badge className="rounded-full px-2.5 py-1 text-xs" variant="secondary">
              {accessLabel}
            </Badge>
          </div>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            Manage the forms that belong to this organization.
          </p>
        </div>

        {canManageForms && (
          <Button asChild className="min-h-11 shrink-0 gap-2">
            <Link href={formsPath}>
              <Plus className="size-4" />
              Create form
            </Link>
          </Button>
        )}
      </header>

      <section className="rounded-2xl border border-border bg-card px-5 py-5">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-sm font-medium">Forms</span>
          <FileText className="size-4" />
        </div>
        <p className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-foreground">
          {isLoading ? "…" : error ? "—" : (formsPage?.total ?? 0)}
        </p>
      </section>

      <section className="mt-9">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Recent forms</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Latest work in {organization.name}.
            </p>
          </div>
          <Button asChild className="shrink-0" size="sm" variant="ghost">
            <Link href={formsPath}>
              View all <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading forms…</p>
        ) : error ? (
          <p className="mt-4 text-sm text-destructive">{error.message}</p>
        ) : recentForms.length ? (
          <div className="mt-4 divide-y divide-border rounded-xl border border-border bg-card">
            {recentForms.map((form) => (
              <Link
                className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/50"
                href={organizationWorkspacePath(organization.slug, `/forms/${form.id}/builder`)}
                key={form.id}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{form.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Updated {formatDate(form.updatedAt)}
                  </p>
                </div>
                <ArrowUpRight className="size-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/20 px-5 py-12 text-center">
            <FileText className="mx-auto size-7 text-muted-foreground" />
            <h3 className="mt-4 font-medium">No forms yet</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              {canManageForms
                ? "Create your first form to get started."
                : "Forms created by your organization will appear here."}
            </p>
            {canManageForms && (
              <Button asChild className="mt-5 min-h-11">
                <Link href={formsPath}>Create your first form</Link>
              </Button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
