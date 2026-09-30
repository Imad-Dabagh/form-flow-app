"use client";

import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { useParams } from "next/navigation";
import API from "@/router";
import { organizationWorkspacePath } from "@/modules/organizations";
import { Button } from "@/modules/shared/components/ui/button";

export function FormBuilderTemplate() {
  const { organizationSlug, formId } = useParams<{ organizationSlug: string; formId: string }>();
  const { form, error, isLoading } = API.orgs.forms.useFindById({
    organizationSlug,
    formId,
  });

  return (
    <div className="mx-auto w-full max-w-[69rem] px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
      <Button asChild size="sm" variant="ghost" className="mb-6 gap-2">
        <Link href={organizationWorkspacePath(organizationSlug, "/forms")}><ArrowLeft className="size-4" /> Forms</Link>
      </Button>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading form…</p>
      ) : error || !form ? (
        <p className="text-sm text-destructive">{error?.message ?? "Form not found."}</p>
      ) : (
        <>
          <h1 className="text-3xl font-semibold tracking-tight">{form.name}</h1>
          <div className="mt-8 rounded-xl border border-dashed border-border bg-muted/20 px-6 py-20 text-center">
            <FileText className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-4 font-medium">Form builder</p>
            <p className="mt-2 text-sm text-muted-foreground">The builder will appear here.</p>
          </div>
        </>
      )}
    </div>
  );
}
