"use client";

import { useParams } from "next/navigation";
import API from "@/router";
import { organizationWorkspacePath, useOrganizationWorkspace } from "@/modules/organizations";
import {
  WorkspacePage,
  PageNavigation,
  PageBreadcrumbs,
} from "@/modules/shared/components/workspace";
import { FormRenderer } from ".";

export function FormPreviewTemplate() {
  const organization = useOrganizationWorkspace();
  const { organizationSlug, formId } = useParams<{
    organizationSlug: string;
    formId: string;
  }>();
  const { form, error, isLoading } = API.orgs.forms.useFindById({ organizationSlug, formId });

  return (
    <WorkspacePage>
      <PageNavigation title={form ? `Preview ${form.name}` : "Form preview"}>
        <PageBreadcrumbs
          items={[
            {
              label: organization.name,
              href: organizationWorkspacePath(organizationSlug, "/dashboard"),
            },
            { label: "Forms", href: organizationWorkspacePath(organizationSlug, "/forms") },
            {
              label: form?.name ?? "Builder",
              href: organizationWorkspacePath(organizationSlug, `/forms/${formId}/builder`),
            },
            { label: "Preview" },
          ]}
        />
        {!isLoading && !error && form && (
          <span className="text-xs text-muted-foreground">Preview · Answers are not saved</span>
        )}
      </PageNavigation>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading form…</p>
      ) : error || !form ? (
        <p className="text-sm text-destructive">{error?.message ?? "Form not found."}</p>
      ) : (
        <FormRenderer key={form.id} form={form} />
      )}
    </WorkspacePage>
  );
}
