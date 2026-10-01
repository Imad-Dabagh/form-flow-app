"use client";

import { useParams } from "next/navigation";
import { RequireAuthentication } from "@/app/require-authentication";
import { AuthenticatedFormSubmissionTemplate, PublicFormSubmissionTemplate } from "@/modules/forms";
import API from "@/router";

export function FormSubmissionRoute() {
  const { organizationSlug, formId } = useParams<{
    organizationSlug: string;
    formId: string;
  }>();
  const { formLink, error, isLoading } = API.public.forms.useFindLink({
    organizationSlug,
    formId,
  });

  if (isLoading) {
    return <p className="mx-auto max-w-3xl px-4 py-10 text-sm text-muted-foreground">Loading form…</p>;
  }

  if (error || !formLink) {
    return (
      <p className="mx-auto max-w-3xl px-4 py-10 text-sm text-destructive">
        {error?.message ?? "Form not found."}
      </p>
    );
  }

  if (formLink.type === "PUBLIC") {
    return <PublicFormSubmissionTemplate />;
  }

  return (
    <RequireAuthentication requireProfile={false}>
      <AuthenticatedFormSubmissionTemplate key={`${organizationSlug}:${formId}`} />
    </RequireAuthentication>
  );
}
