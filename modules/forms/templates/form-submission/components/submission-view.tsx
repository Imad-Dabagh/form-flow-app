import type { ApiError } from "@/lib/api-error";
import type { FormPresentation } from "@/router/orgs/forms";
import { FormRenderer } from "../../form-renderer";
import type { FormAnswers } from "../../form-renderer/types";
import { SubmissionState } from "./submission-state";

export function SubmissionView({
  form,
  error,
  isLoading,
  submitted,
  closed = false,
  onRetry,
  initialValues,
  hasDraft,
  draftNotice,
  onSave,
  onSubmit,
}: {
  form?: FormPresentation;
  error?: ApiError;
  isLoading: boolean;
  submitted: boolean;
  closed?: boolean;
  onRetry?: () => void;
  initialValues?: Partial<FormAnswers>;
  hasDraft?: boolean;
  draftNotice?: string;
  onSave?: (answers: FormAnswers) => Promise<void>;
  onSubmit: (answers: FormAnswers, idempotencyKey: string) => Promise<void>;
}) {
  if (submitted) {
    return <SubmissionState kind="success" title="Form submitted" description={`Your submission to ${form?.name ?? "this form"} has been received.`} />;
  }

  if (isLoading) {
    return <SubmissionState kind="loading" title="Opening form" description="Please wait while we load the form." />;
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

  if (closed || form.isClosed) {
    return <SubmissionState kind="closed" title={form.name} description="This form is closed and is no longer accepting submissions." />;
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-7 sm:px-6">
      <FormRenderer
        key={form.id}
        form={form}
        initialValues={initialValues}
        hasDraft={hasDraft}
        draftNotice={draftNotice}
        onSave={onSave}
        onSubmit={onSubmit}
      />
    </main>
  );
}
