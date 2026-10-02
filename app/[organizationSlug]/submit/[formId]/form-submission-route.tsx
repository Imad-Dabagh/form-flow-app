"use client";

import { useParams } from "next/navigation";
import { RequireAuthentication } from "@/app/require-authentication";
import { AuthenticatedFormSubmissionTemplate, PublicFormSubmissionTemplate, SubmissionState } from "@/modules/forms";
import API from "@/router";

export function FormSubmissionRoute() {
  const { organizationSlug, formId } = useParams<{
    organizationSlug: string;
    formId: string;
  }>();
  const { formLink, error, isLoading, mutate } = API.public.forms.useFindLink({
    organizationSlug,
    formId,
  });

  if (isLoading) {
    return <SubmissionState kind="loading" title="Opening form" description="Please wait while we load the form." />;
  }

  if (error?.status === 400 || error?.status === 404 || (!error && !formLink)) {
    return <SubmissionState kind="unavailable" title="Form unavailable" description="This form could not be found. Check the link and try again." />;
  }

  if (error || !formLink) {
    return <SubmissionState kind="error" title="Couldn't open this form" description="Please check your connection and try again." onRetry={() => void mutate()} />;
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
