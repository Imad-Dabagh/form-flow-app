"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toApiError, type ApiError } from "@/lib/api-error";
import API from "@/router";
import type { FormAnswers } from "../form-renderer/types";
import { SubmissionView } from "./components/submission-view";
import { useSubmissionDraft } from "./use-submission-draft";

export function AuthenticatedFormSubmissionTemplate() {
  const { organizationSlug, formId } = useParams<{ organizationSlug: string; formId: string }>();
  const [accessReady, setAccessReady] = useState(false);
  const [accessError, setAccessError] = useState<ApiError | undefined>();
  const [accessAttempt, setAccessAttempt] = useState(0);
  const [closed, setClosed] = useState(false);
  const { form, error, isLoading, mutate } = API.orgs.forms.submission.useForm({
    organizationSlug,
    formId,
    enabled: accessReady,
  });
  const [submitted, setSubmitted] = useState(false);
  const draft = useSubmissionDraft({ form, formId, organizationSlug });

  useEffect(() => {
    let active = true;
    API.orgs.forms.submission.ensureAccess({ formId, organizationSlug })
      .then(() => {
        if (active) setAccessReady(true);
      })
      .catch((error: unknown) => {
        if (active) setAccessError(toApiError(error));
      });
    return () => { active = false; };
  }, [accessAttempt, formId, organizationSlug]);

  async function submit(answers: FormAnswers) {
    try {
      await draft.finalize(answers);
      setSubmitted(true);
    } catch (error) {
      if (toApiError(error).code === "FORM_CLOSED") setClosed(true);
      throw error;
    }
  }

  function retry() {
    if (accessError) {
      setAccessReady(false);
      setAccessError(undefined);
      setAccessAttempt((current) => current + 1);
    } else {
      void mutate();
      draft.retry();
    }
  }

  return (
    <SubmissionView
      form={form}
      error={accessError ?? error ?? (draft.status === "error" ? toApiError(draft.error) : undefined)}
      isLoading={!accessReady && !accessError || isLoading || Boolean(form && draft.status === "loading")}
      submitted={submitted}
      closed={closed}
      onRetry={retry}
      initialValues={draft.initialValues}
      hasDraft={Boolean(draft.draft)}
      draftNotice={draft.notice}
      onSave={async (answers) => { await draft.save(answers); }}
      onSubmit={submit}
    />
  );
}
