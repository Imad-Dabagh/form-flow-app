"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import API from "@/router";
import { organizationWorkspacePath } from "@/modules/organizations";
import { Button } from "@/modules/shared/components/ui/button";
import { FormRenderer } from ".";

export function FormPreviewTemplate() {
  const { organizationSlug, formId } = useParams<{
    organizationSlug: string;
    formId: string;
  }>();
  const { form, error, isLoading } = API.orgs.forms.useFindById({ organizationSlug, formId });

  if (isLoading) {
    return (
      <p className="mx-auto max-w-3xl px-4 py-10 text-sm text-muted-foreground">Loading form…</p>
    );
  }
  if (error || !form) {
    return (
      <p className="mx-auto max-w-3xl px-4 py-10 text-sm text-destructive">
        {error?.message ?? "Form not found."}
      </p>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-7 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm" className="-ml-2 gap-2">
          <Link href={organizationWorkspacePath(organizationSlug, `/forms/${formId}/builder`)}>
            <ArrowLeft className="size-4" /> Back to builder
          </Link>
        </Button>
        <span className="text-xs text-muted-foreground">Preview · Answers are not saved</span>
      </div>
      <FormRenderer key={form.id} form={form} />
    </main>
  );
}
