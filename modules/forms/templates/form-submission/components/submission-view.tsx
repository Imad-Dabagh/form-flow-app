import type { ApiError } from "@/lib/api-error";
import type { FormPresentation } from "@/router/orgs/forms";
import { FormRenderer } from "../../form-renderer";
import type { FormAnswers } from "../../form-renderer/types";
import { SubmissionState } from "./submission-state";

type SubmissionViewProps = {
  form?: FormPresentation;
  error?: ApiError;
  isLoading: boolean;
  submitted: boolean;
  completedAt?: string | null;
  statusLocked?: boolean;
  closed?: boolean;
  onRetry?: () => void;
  onOpenSubmittedForm?: () => void;
  initialValues?: Partial<FormAnswers>;
  hasSavedProgress?: boolean;
  onSave?: (answers: FormAnswers) => Promise<void>;
  onSubmit: (answers: FormAnswers, idempotencyKey: string) => Promise<void>;
};

export function SubmissionView({
  form,
  error,
  isLoading,
  submitted,
  completedAt,
  statusLocked = false,
  closed = false,
  onRetry,
  onOpenSubmittedForm,
  initialValues,
  hasSavedProgress,
  onSave,
  onSubmit,
}: SubmissionViewProps) {
  if (submitted) {
    const name = form?.name ?? "this form";
    const canUpdate = !statusLocked && !closed && !form?.isClosed;
    const description = form?.isClosed || closed
      ? `Your response to ${name} was received. This form is closed, so updates are unavailable.`
      : statusLocked
        ? `Your response to ${name} was received. Its current status does not allow updates.`
        : `Your response to ${name} was received.`;
    return <SubmissionState
      kind="success"
      title="Form submitted successfully"
      description={description}
      actionLabel={canUpdate ? "Update submission" : "View submission"}
      onAction={completedAt ? onOpenSubmittedForm : undefined}
    />;
  }

  if (isLoading) {
    return <SubmissionState kind="loading" title="Opening form" description="Please wait while we load the form." />;
  }

  if (closed && !completedAt) {
    return <SubmissionState kind="closed" title={form?.name ?? "Form closed"} description="This form is closed and is no longer accepting submissions." />;
  }

  if (error?.status === 400 || error?.status === 404 || (!error && !form)) {
    return <SubmissionState kind="unavailable" title="Form unavailable" description="This form could not be found. Check the link and try again." />;
  }

  if (error?.status === 403) {
    return <SubmissionState kind="unavailable" title="Form unavailable" description="You do not have access to this form." />;
  }

  if (error || !form) {
    return <SubmissionState kind="error" title="Couldn't open this form" description="Please check your connection and try again." onRetry={onRetry} />;
  }

  if (form.isClosed && !completedAt) {
    return <SubmissionState kind="closed" title={form.name} description="This form is closed and is no longer accepting submissions." />;
  }

  const readOnly = statusLocked || Boolean(completedAt && (form.isClosed || closed));
  const submissionNotice = form.isClosed || closed
    ? "This form is closed. Your submitted answers are shown for reference."
    : statusLocked
      ? "Answers are locked in this submission status."
      : undefined;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-7 sm:px-6">
      <FormRenderer
        key={form.id}
        form={form}
        initialValues={initialValues}
        hasSavedProgress={hasSavedProgress && !completedAt}
        readOnly={readOnly}
        notice={submissionNotice}
        onSave={readOnly || completedAt ? undefined : onSave}
        onSubmit={readOnly ? undefined : onSubmit}
      />
    </main>
  );
}
