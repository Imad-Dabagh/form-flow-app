"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowUpRight, ChartColumn, Clock3, FileText, Inbox, Plus, RefreshCw } from "lucide-react";
import API from "@/router";
import { CreateFormModal } from "@/modules/forms/components/create-form-modal";
import { FormSettingsDrawer } from "@/modules/forms/patterns/form-settings-drawer";
import { Button } from "@/modules/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/shared/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/modules/shared/components/ui/toggle-group";
import {
  WorkspacePage,
  PageNavigation,
  PageBreadcrumbs,
  PageSection,
} from "@/modules/shared/components/workspace";
import {
  organizationWorkspacePath,
  useOrganizationPermissions,
  useOrganizationWorkspace,
} from "@/lib/organization";
import { DashboardLoading } from "./components/dashboard-loading";
import { FormsOverview } from "./components/forms-overview";
import { LatestSubmission } from "./components/latest-submission";
import { SubmissionActivityChart } from "./components/submission-activity-chart";
import { SubmissionStatusBreakdown } from "./components/submission-status-breakdown";

function Metric({
  label,
  value,
  context,
  icon,
}: {
  label: string;
  value: number;
  context: ReactNode;
  icon: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <h2 className="font-medium">{label}</h2>
        {icon}
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight tabular-nums">
        {value.toLocaleString()}
      </p>
      <div className="mt-2 text-xs leading-5 text-muted-foreground">{context}</div>
    </section>
  );
}

function Comparison({
  current,
  previous,
  days,
}: {
  current: number;
  previous: number;
  days: number;
}) {
  if (previous === 0)
    return (
      <>
        {current === 0
          ? "No submissions in either period"
          : `${current.toLocaleString()} more than the previous ${days} days`}
      </>
    );
  const percentage = Math.round(((current - previous) / previous) * 100);
  return (
    <>
      <span className="font-medium text-foreground">
        {percentage > 0 ? "+" : ""}
        {percentage}%
      </span>{" "}
      vs previous {days} days
    </>
  );
}

export function OrganizationDashboardTemplate() {
  const organization = useOrganizationWorkspace();
  const { canManageForms } = useOrganizationPermissions();
  const [days, setDays] = useState<7 | 30>(30);
  const [selectedFormId, setSelectedFormId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [builderFormId, setBuilderFormId] = useState<string | null>(null);
  const { dashboard, error, isLoading, isValidating, mutate } = API.orgs.dashboard.useOverview({
    organizationSlug: canManageForms ? organization.slug : "",
    days,
  });
  const formsPath = organizationWorkspacePath(organization.slug, "/forms");
  const selectedForm =
    dashboard?.forms.find((form) => form.id === selectedFormId) ?? dashboard?.forms[0];
  const through = dashboard ? new Date(dashboard.period.before) : null;
  through?.setDate(through.getDate() - 1);

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
        {canManageForms && (
          <Button className="shrink-0" onClick={() => setIsCreating(true)}>
            <Plus className="size-4" />
            Create form
          </Button>
        )}
      </PageNavigation>
      {!canManageForms ? (
        <div className="rounded-xl border border-border bg-card px-5 py-12 text-center">
          <FileText className="mx-auto size-7 text-muted-foreground" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-semibold">Welcome to {organization.name}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Use a form link shared by your organization to open or resume your submission.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Workspace overview</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Keep up with your forms and the responses coming in.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ToggleGroup
                type="single"
                value={String(days)}
                aria-label="Dashboard activity period"
                onValueChange={(value) => {
                  if (value === "7" || value === "30") setDays(Number(value) as 7 | 30);
                }}
                className="gap-1 rounded-lg border border-border bg-muted/50 p-1"
              >
                {[7, 30].map((period) => (
                  <ToggleGroupItem
                    key={period}
                    value={String(period)}
                    className="h-9 rounded-md px-4 text-xs data-[state=on]:bg-card data-[state=on]:text-foreground data-[state=on]:shadow-sm"
                  >
                    {period} days
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <Button
                variant="outline"
                size="icon"
                className="size-11"
                disabled={isValidating}
                aria-label="Refresh dashboard"
                onClick={() => void mutate()}
              >
                <RefreshCw
                  className={`size-4 ${isValidating ? "animate-spin motion-reduce:animate-none" : ""}`}
                  aria-hidden="true"
                />
              </Button>
            </div>
          </div>
          {error && (
            <div
              role="alert"
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-5 py-4"
            >
              <p className="text-sm text-destructive">
                {dashboard
                  ? "Could not refresh the dashboard. Showing the last loaded data."
                  : error.message}
              </p>
              <Button
                variant="outline"
                size="sm"
                disabled={isValidating}
                onClick={() => void mutate()}
              >
                Try again
              </Button>
            </div>
          )}
          {isLoading && !dashboard ? (
            <DashboardLoading />
          ) : (
            dashboard && (
              <>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Metric
                    label={`Submissions · ${days} days`}
                    value={dashboard.summary.submissions}
                    icon={<Inbox className="size-4" aria-hidden="true" />}
                    context={
                      <Comparison
                        current={dashboard.summary.submissions}
                        previous={dashboard.summary.previousSubmissions}
                        days={days}
                      />
                    }
                  />
                  <Metric
                    label="Open forms"
                    value={dashboard.summary.openForms}
                    icon={<FileText className="size-4" aria-hidden="true" />}
                    context={
                      <>
                        {dashboard.summary.activeForms.toLocaleString()} active forms in this
                        workspace
                      </>
                    }
                  />
                  <Metric
                    label="Unfinished submissions"
                    value={dashboard.summary.unfinished}
                    icon={<Clock3 className="size-4" aria-hidden="true" />}
                    context="Current total · users-only forms"
                  />
                </div>
                {dashboard.summary.activeForms === 0 ? (
                  <div className="rounded-xl border border-dashed border-border bg-muted/20 px-5 py-14 text-center">
                    <FileText className="mx-auto size-8 text-primary" aria-hidden="true" />
                    <h3 className="mt-4 text-lg font-semibold">No active forms yet</h3>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                      Create a form and share its link. Responses and submission activity will
                      appear here as they arrive.
                    </p>
                    <div className="mt-5 flex flex-wrap justify-center gap-3">
                      <Button onClick={() => setIsCreating(true)}>
                        <Plus className="size-4" />
                        Create form
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href={formsPath}>View forms</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
                      <section className="min-w-0 rounded-xl border border-border bg-card p-5 shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold">Submission activity</h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Completed submissions per day
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(dashboard.period.from), "MMM d")} –{" "}
                            {through && format(through, "MMM d, yyyy")}
                          </span>
                        </div>
                        <div className="mt-6">
                          {dashboard.summary.submissions > 0 ? (
                            <SubmissionActivityChart dashboard={dashboard} />
                          ) : (
                            <div className="flex h-64 flex-col items-center justify-center px-4 text-center">
                              <ChartColumn
                                className="size-7 text-muted-foreground"
                                aria-hidden="true"
                              />
                              <p className="mt-4 text-sm font-medium">
                                No submissions in the last {days} days
                              </p>
                              <p className="mt-2 max-w-xs text-xs leading-5 text-muted-foreground">
                                Share an open form’s link to start collecting responses.
                              </p>
                            </div>
                          )}
                        </div>
                      </section>
                      <section className="min-w-0 rounded-xl border border-border bg-card p-5 shadow-sm">
                        <h3 className="font-semibold">Submission statuses</h3>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          Current totals, including started submissions.
                        </p>
                        {selectedForm && (
                          <>
                            <div className="mt-5 mb-3">
                              <Select value={selectedForm.id} onValueChange={setSelectedFormId}>
                                <SelectTrigger
                                  className="h-11 w-full"
                                  aria-label="Choose a form for the status breakdown"
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {dashboard.forms.map((form) => (
                                    <SelectItem key={form.id} value={form.id}>
                                      {form.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <p className="mt-2 text-xs text-muted-foreground">
                                Forms from the overview below
                              </p>
                            </div>
                            <SubmissionStatusBreakdown
                              key={selectedForm.id}
                              organizationSlug={organization.slug}
                              form={selectedForm}
                            />
                          </>
                        )}
                      </section>
                    </div>
                    <PageSection
                      title="Forms overview"
                      description={`Top ${dashboard.forms.length} by submissions in the selected period. Unfinished counts and last submission reflect current totals.`}
                      actions={
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={formsPath}>
                            View all forms
                            <ArrowUpRight className="size-4" />
                          </Link>
                        </Button>
                      }
                    >
                      <FormsOverview
                        forms={dashboard.forms}
                        dashboard={dashboard}
                        organizationSlug={organization.slug}
                      />
                    </PageSection>
                    <PageSection
                      title="Latest submissions"
                      description={`Recent responses across active forms in the last ${days} days.`}
                    >
                      {dashboard.recentSubmissions.length ? (
                        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                          {dashboard.recentSubmissions.map((submission) => (
                            <LatestSubmission
                              key={submission.id}
                              submission={submission}
                              organizationSlug={organization.slug}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-border bg-muted/20 px-5 py-10 text-center">
                          <Inbox
                            className="mx-auto size-6 text-muted-foreground"
                            aria-hidden="true"
                          />
                          <p className="mt-3 text-sm font-medium">No recent submissions</p>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            New responses will appear here with their form and status.
                          </p>
                        </div>
                      )}
                    </PageSection>
                  </>
                )}
              </>
            )
          )}
        </>
      )}
      {isCreating && (
        <CreateFormModal
          open
          organizationSlug={organization.slug}
          onOpenChange={setIsCreating}
          onCreated={(form) => {
            setIsCreating(false);
            setBuilderFormId(form.id);
            void mutate();
          }}
        />
      )}
      {builderFormId && (
        <FormSettingsDrawer
          key={builderFormId}
          open
          organizationSlug={organization.slug}
          formId={builderFormId}
          initialTab="builder"
          onOpenChange={(open) => {
            if (!open) {
              setBuilderFormId(null);
              void mutate();
            }
          }}
        />
      )}
    </WorkspacePage>
  );
}
