"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { toApiError } from "@/lib/api-error";
import API from "@/router";
import type { FormAnswers } from "../form-renderer/types";
import { SubmissionView } from "./components/submission-view";
import { prepareSubmission } from "./prepare-submission";

export function PublicFormSubmissionTemplate() {
  const { formId } = useParams<{ formId: string }>();
  const { form, error, isLoading, mutate } = API.public.forms.useFindById({ formId });
  const { trigger: submitForm } = API.public.forms.useSubmit({ formId });
  const [submitted, setSubmitted] = useState(false);
  const [closed, setClosed] = useState(false);

  async function submit(answers: FormAnswers, idempotencyKey: string) {
    try {
      await submitForm({ payload: prepareSubmission(form, answers), idempotencyKey });
      setSubmitted(true);
    } catch (error) {
      if (toApiError(error).code === "FORM_CLOSED") setClosed(true);
      throw error;
    }
  }

  return (
    <SubmissionView
      form={form}
      isLoading={isLoading}
      error={error}
      submitted={submitted}
      closed={closed}
      onRetry={() => { void mutate(); }}
      onSubmit={submit}
    />
  );
}
