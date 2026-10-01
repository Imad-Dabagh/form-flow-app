"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toApiError, type ApiError } from "@/lib/api-error";
import API from "@/router";
import type { FormAnswers } from "../form-renderer/types";
import { SubmissionView } from "./components/submission-view";
import { prepareSubmission } from "./prepare-submission";

export function AuthenticatedFormSubmissionTemplate() {
  const { organizationSlug, formId } = useParams<{ organizationSlug: string; formId: string }>();
  const [accessReady, setAccessReady] = useState(false);
  const [accessError, setAccessError] = useState<ApiError | undefined>();
  const { form, error, isLoading } = API.orgs.forms.response.useFindById({
    organizationSlug,
    formId,
    enabled: accessReady,
  });
  const { trigger: submitForm } = API.orgs.forms.response.useSubmit({ organizationSlug, formId });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let active = true;
    API.orgs.forms.response.ensureAccess({ formId, organizationSlug })
      .then(() => {
        if (active) setAccessReady(true);
      })
      .catch((error: unknown) => {
        if (active) setAccessError(toApiError(error));
      });
    return () => { active = false; };
  }, [formId, organizationSlug]);

  async function submit(answers: FormAnswers) {
    await submitForm(prepareSubmission(form, answers));
    setSubmitted(true);
  }

  return (
    <SubmissionView
      form={form}
      error={accessError ?? error}
      isLoading={!accessReady && !accessError || isLoading}
      submitted={submitted}
      onSubmit={submit}
    />
  );
}
