import type { ApiError } from "@/lib/api-error";
import type { FormPresentation } from "@/router/orgs/forms";
import { FormRenderer } from "../../form-renderer";
import type { FormAnswers } from "../../form-renderer/types";

export function SubmissionView({
  form,
  error,
  isLoading,
  submitted,
  onSubmit,
}: {
  form?: FormPresentation;
  error?: ApiError;
  isLoading: boolean;
  submitted: boolean;
  onSubmit: (answers: FormAnswers) => Promise<void>;
}) {
  if (isLoading) {
    return <p className="mx-auto max-w-3xl px-4 py-10 text-sm text-muted-foreground">Loading form…</p>;
  }

  if (error || !form) {
    return (
      <p className="mx-auto max-w-3xl px-4 py-10 text-sm text-destructive">
        {error?.message ?? "Form not found."}
      </p>
    );
  }

  if (submitted) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <div className="rounded-xl border bg-card px-6 py-10 text-center shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight">Response submitted</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your response to {form.name} has been received.
          </p>
        </div>
      </main>
    );
  }

  if (form.isClosed) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <div className="rounded-xl border bg-card px-6 py-10 text-center shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight">{form.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This form is closed and is no longer accepting responses.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-7 sm:px-6">
      <FormRenderer key={form.id} form={form} onSubmit={onSubmit} />
    </main>
  );
}
