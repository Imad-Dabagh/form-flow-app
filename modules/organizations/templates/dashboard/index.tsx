"use client";

import Link from "next/link";
import { ArrowUpRight, FileText } from "lucide-react";
import API from "@/router";
import { Button } from "@/modules/shared/components/ui/button";
import {
  WorkspacePage,
  PageNavigation,
  PageBreadcrumbs,
  PageSection,
} from "@/modules/shared/components/workspace";
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
  const { canManageForms } = useOrganizationPermissions();
  const { formsPage, error, isLoading } = API.orgs.forms.useFindAll({
    organizationSlug: organization.slug,
  });
  const formsPath = organizationWorkspacePath(organization.slug, "/forms");
  const recentForms = formsPage?.items.slice(0, 5) ?? [];

  return (
    <WorkspacePage>
      <PageNavigation title="Dashboard">
        <PageBreadcrumbs
          items={[
            {
              label: organization.name,
              href: organizationWorkspacePath(organization.slug, "/dashboard"),
            },
            { label: "Dashboard" },
          ]}
        />
      </PageNavigation>

      <section className="rounded-2xl border border-border bg-card px-5 py-5">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-sm font-medium">Forms</span>
          <FileText className="size-4" />
        </div>
        <p className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-foreground">
          {isLoading ? "…" : error ? "—" : (formsPage?.total ?? 0)}
        </p>
      </section>

      <PageSection
        title="Recent forms"
        description={`Latest work in ${organization.name}.`}
        actions={
          <Button asChild className="shrink-0" size="sm" variant="ghost">
            <Link href={formsPath}>
              View all <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        }
      >
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading forms…</p>
        ) : error ? (
          <p className="text-sm text-destructive">{error.message}</p>
        ) : recentForms.length ? (
          <div className="divide-y divide-border rounded-xl border border-border bg-card">
            {recentForms.map((form) => (
              <Link
                className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/50"
                href={organizationWorkspacePath(organization.slug, `/forms/${form.id}`)}
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
          <div className="rounded-xl border border-dashed border-border bg-muted/20 px-5 py-12 text-center">
            <FileText className="mx-auto size-7 text-muted-foreground" />
            <h3 className="mt-4 font-medium">No forms yet</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              {canManageForms
                ? "Open Forms to create your first form."
                : "Forms created by your organization will appear here."}
            </p>
          </div>
        )}
      </PageSection>
    </WorkspacePage>
  );
}
