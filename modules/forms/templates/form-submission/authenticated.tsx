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
  const currentStatusId = current?.submission.submissionStatusId;
  const currentStatus = current?.submissionStatuses.find(
    (status) => status.id === currentStatusId,
  );
  const [closed, setClosed] = useState(false);
  const [showSubmittedForm, setShowSubmittedForm] = useState(false);

  async function submit(answers: FormAnswers) {
    try {
      await submission.finalize(answers);
      setShowSubmittedForm(false);
    } catch (error) {
      const apiError = toApiError(error);
      if (apiError.code === "FORM_CLOSED") setClosed(true);
      if (apiError.status === 409) await submission.retry().catch(() => undefined);
      throw error;
    }
  }

  return (
    <SubmissionView
      form={current?.form}
      error={submission.error}
      isLoading={submission.isLoading}
      submitted={Boolean(current?.submission.submittedAt && !showSubmittedForm)}
      completedAt={current?.submission.submittedAt}
      statusLocked={Boolean(current && (!currentStatus || currentStatus.isSubmissionLocked))}
      closed={closed || submission.error?.code === "FORM_CLOSED"}
      onRetry={() => { void submission.retry(); }}
      onOpenSubmittedForm={() => setShowSubmittedForm(true)}
      initialValues={current?.submission.answers as Partial<FormAnswers> | undefined}
      hasSavedProgress={Boolean(current && Object.keys(current.submission.answers).length)}
      onSave={async (answers) => {
        try {
          await submission.save(answers);
        } catch (error) {
          const apiError = toApiError(error);
          if (apiError.code === "FORM_CLOSED") setClosed(true);
          if (apiError.status === 409) await submission.retry().catch(() => undefined);
          throw error;
        }
      }}
      onSubmit={submit}
    />
  );
}
