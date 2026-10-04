"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { toApiError } from "@/lib/api-error";
import type { FormAnswers } from "../form-renderer/types";
import { SubmissionView } from "./components/submission-view";
import { useCurrentUserSubmission } from "./use-current-user-submission";

export function AuthenticatedFormSubmissionTemplate() {
  const { formId } = useParams<{ formId: string }>();
  const submission = useCurrentUserSubmission(formId);
  const current = submission.current;
  const [closed, setClosed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function submit(answers: FormAnswers) {
    try {
      await submission.finalize(answers);
      setSubmitted(true);
    } catch (error) {
      if (toApiError(error).code === "FORM_CLOSED") setClosed(true);
      throw error;
    }
  }

  return (
    <SubmissionView
      form={current?.form}
      error={submission.error}
      isLoading={submission.isLoading}
      submitted={submitted}
      completedAt={current?.submission.submittedAt}
      closed={closed || submission.error?.code === "FORM_CLOSED"}
      onRetry={() => { void submission.retry(); }}
      initialValues={current?.submission.answers as Partial<FormAnswers> | undefined}
      hasSavedProgress={Boolean(current && Object.keys(current.submission.answers).length)}
      onSave={async (answers) => { await submission.save(answers); }}
      onSubmit={submit}
    />
  );
}
