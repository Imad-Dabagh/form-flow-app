"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Plus,
  Send,
} from "lucide-react";
import { useFormsStore } from "@/modules/forms/lib/forms-store";
import { Badge } from "@/modules/shared/components/ui/badge";
import { Button } from "@/modules/shared/components/ui/button";
import { organizationManagePath } from "../paths";
import { useOrganizationWorkspace } from "./organization-workspace-boundary";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function OrganizationDashboard() {
  const organization = useOrganizationWorkspace();
  const forms = useFormsStore((state) =>
    state.forms.filter((form) => form.organizationId === organization.id),
  );
  const submissions = useFormsStore((state) => state.submissions);
  const formsPath = organizationManagePath(organization.slug, "/forms");
  const canManageForms = organization.role !== "USER";
  const publishedForms = forms.filter((form) => form.status === "published");
  const responseCount = submissions.filter((submission) =>
    forms.some((form) => form.id === submission.formId),
  ).length;
  const recentForms = [...forms]
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, 5);
  const accessLabel = organization.role ?? "Platform administrator";

  const metrics = [
    { label: "Forms", value: forms.length, icon: FileText },
    { label: "Published", value: publishedForms.length, icon: CheckCircle2 },
    { label: "Responses", value: responseCount, icon: Send },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-10">
      <header className="flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Organization workspace
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="truncate text-3xl font-semibold tracking-[-0.035em] text-foreground sm:text-4xl">
              {organization.name}
            </h1>
            <Badge className="rounded-full px-2.5 py-1 text-xs" variant="secondary">
              {accessLabel}
            </Badge>
          </div>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            Keep an eye on the forms and responses that belong to this organization.
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

      <section className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
        {metrics.map(({ icon: Icon, label, value }) => (
          <div className="bg-card px-5 py-5" key={label}>
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-sm font-medium">{label}</span>
              <Icon className="size-4" />
            </div>
            <p className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-foreground">
              {value}
            </p>
          </div>
        ))}
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

        {recentForms.length ? (
          <div className="mt-4 divide-y divide-border rounded-xl border border-border bg-card">
            {recentForms.map((form) => (
              <Link
                className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/50"
                href={organizationManagePath(
                  organization.slug,
                  `/forms/${form.id}/builder`,
                )}
                key={form.id}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{form.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Updated {formatDate(form.updatedAt)}
                  </p>
                </div>
                <Badge variant={form.status === "published" ? "default" : "secondary"}>
                  {form.status}
                </Badge>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/20 px-5 py-12 text-center">
            <FileText className="mx-auto size-7 text-muted-foreground" />
            <h3 className="mt-4 font-medium">No forms yet</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              {canManageForms
                ? "Create your first form to start collecting responses."
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
