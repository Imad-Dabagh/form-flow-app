"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import API from "@/router";
import type { FormAnswers } from "../form-renderer/types";
import { SubmissionView } from "./components/submission-view";
import { prepareSubmission } from "./prepare-submission";

export function PublicFormSubmissionTemplate() {
  const { formId } = useParams<{ formId: string }>();
  const { form, error, isLoading } = API.public.forms.useFindById({ formId });
  const { trigger: submitForm } = API.public.forms.useSubmit({ formId });
  const [submitted, setSubmitted] = useState(false);

  async function submit(answers: FormAnswers) {
    await submitForm(prepareSubmission(form, answers));
    setSubmitted(true);
  }

  return (
    <SubmissionView
      form={form}
      error={error}
      isLoading={isLoading}
      submitted={submitted}
      onSubmit={submit}
    />
  );
}
