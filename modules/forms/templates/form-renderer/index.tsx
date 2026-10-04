"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { toApiError } from "@/lib/api-error";
import type { FormPresentation, FormPresentationQuestion } from "@/router/orgs/forms";
import { Button } from "@/modules/shared/components/ui/button";
import { RichTextContent } from "@/modules/shared/components/rich-text-editor/content";
import { FormSection } from "./components/form-section";
import type { FormAnswer, FormAnswers } from "./types";
import { validateSections, type FormErrors } from "./validate-form-answers";

function initialAnswer(question: FormPresentationQuestion): FormAnswer {
  const value = question.defaultValue;
  if (question.inputType === "file") return [];
  if (question.inputType === "checkboxes" || question.inputType === "multi-select") {
    return Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string")
      : [];
  }
  if (question.inputType === "boolean") return value === true;
  if (question.inputType === "linear-scale") return typeof value === "number" ? value : null;
  return typeof value === "string" || typeof value === "number" ? value : "";
}

function initialAnswers(form: FormPresentation): FormAnswers {
  return Object.fromEntries(
    form.sections.flatMap((section) =>
      section.questions.map((question) => [question._id, initialAnswer(question)]),
    ),
  );
}

export function FormRenderer({
  form,
  initialValues,
  hasSavedProgress = false,
  readOnly = false,
  onSave,
  onSubmit,
}: {
  form: FormPresentation;
  initialValues?: Partial<FormAnswers>;
  hasSavedProgress?: boolean;
  readOnly?: boolean;
  onSave?: (answers: FormAnswers) => Promise<void>;
  onSubmit?: (answers: FormAnswers, idempotencyKey: string) => Promise<void> | void;
}) {
  const [answers, setAnswers] = useState<FormAnswers>(() => {
    const answers = initialAnswers(form);
    for (const [questionId, value] of Object.entries(initialValues ?? {})) {
      if (value !== undefined) answers[questionId] = value;
    }
    return answers;
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [progressSaved, setProgressSaved] = useState(false);
  const [step, setStep] = useState(0);
  const [focusTarget, setFocusTarget] = useState<{ kind: "question" | "section"; id: string } | null>(null);
  const submissionKey = useRef<string | null>(null);
  const sections = form.sections.filter((section) => !section.isHidden);
  const isWizard = form.displayMode === "WIZARD";
  const currentStep = Math.min(step, Math.max(0, sections.length - 1));
  const visibleSections = isWizard ? sections.slice(currentStep, currentStep + 1) : sections;

  useEffect(() => {
    if (!focusTarget) return;
    const frame = requestAnimationFrame(() => {
      const element = document.getElementById(`${focusTarget.kind}-${focusTarget.id}`);
      element?.scrollIntoView({ block: focusTarget.kind === "question" ? "center" : "start", behavior: "smooth" });
      element?.focus({ preventScroll: true });
      setFocusTarget(null);
    });
    return () => cancelAnimationFrame(frame);
  }, [currentStep, focusTarget]);

  function updateAnswer(questionId: string, value: FormAnswer) {
    submissionKey.current = null;
    setAnswers((current) => ({ ...current, [questionId]: value }));
    setErrors((current) => {
      if (!(questionId in current)) return current;
      const next = { ...current };
      delete next[questionId];
      return next;
    });
    setSubmitError(null);
    setSaveError(null);
  }

  function focusQuestion(questionId: string) {
    setFocusTarget({ kind: "question", id: questionId });
  }

  function validateAndShow(targetSections: typeof sections) {
    const nextErrors = validateSections(targetSections, answers);
    setErrors(nextErrors);
    const firstId = Object.keys(nextErrors)[0];
    if (firstId) focusQuestion(firstId);
    return !firstId;
  }

  function nextStep() {
    if (!readOnly && !validateAndShow([sections[currentStep]])) return;
    setStep(currentStep + 1);
    setFocusTarget({ kind: "section", id: sections[currentStep + 1]._id });
  }

  async function saveForLater() {
    if (!onSave || isSaving || isSubmitting) return;
    setSaveError(null);
    setIsSaving(true);
    try {
      await onSave(answers);
      setProgressSaved(true);
    } catch (error) {
      setSaveError(toApiError(error).message);
    } finally {
      setIsSaving(false);
    }
  }

  async function submit() {
    if (!onSubmit || isSubmitting || isSaving || !sections.length) return;
    const nextErrors = validateSections(sections, answers);
    const firstId = Object.keys(nextErrors)[0];
    if (firstId) {
      setErrors(nextErrors);
      const sectionIndex = sections.findIndex((section) => section.questions.some((question) => question._id === firstId));
      if (isWizard && sectionIndex >= 0) setStep(sectionIndex);
      focusQuestion(firstId);
      return;
    }

    const visibleQuestionIds = new Set(sections.flatMap((section) => section.questions.map((question) => question._id)));
    const submittedAnswers = Object.fromEntries(
      Object.entries(answers).filter(([id, value]) => visibleQuestionIds.has(id) &&
        value != null && !(typeof value === "string" && !value.trim()) &&
        !(Array.isArray(value) && value.length === 0)),
    ) as FormAnswers;
    setErrors({});
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      submissionKey.current ??= crypto.randomUUID();
      await onSubmit(submittedAnswers, submissionKey.current);
    } catch (error) {
      const apiError = toApiError(error);
      const questionId = apiError.details && typeof apiError.details === "object" &&
        "questionId" in apiError.details && typeof apiError.details.questionId === "string"
        ? apiError.details.questionId : null;
      if (questionId && visibleQuestionIds.has(questionId)) {
        setErrors({ [questionId]: apiError.message });
        const sectionIndex = sections.findIndex((section) => section.questions.some((question) => question._id === questionId));
        if (isWizard && sectionIndex >= 0) setStep(sectionIndex);
        focusQuestion(questionId);
      } else {
        setSubmitError(apiError.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (progressSaved) {
    return (
      <div className="rounded-xl border bg-card px-6 py-10 text-center shadow-sm sm:px-10">
        <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Check className="size-5" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-xl font-semibold tracking-tight sm:text-2xl">Progress saved</h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Return to this form while signed in to continue your submission.
        </p>
        <Button type="button" className="mt-6" onClick={() => setProgressSaved(false)}>
          Keep editing
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {readOnly && (
        <p role="status" className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
          Submitted · Your answers are shown below for reference.
        </p>
      )}
      <header className="rounded-xl border bg-card px-5 py-6 shadow-sm sm:px-7 sm:py-7">
        {hasSavedProgress && (
          <span className="mb-3 inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            Saved progress
          </span>
        )}
        <h1 className="text-2xl font-semibold tracking-tight">{form.name}</h1>
        {form.description && (
          <RichTextContent html={form.description} className="mt-3 text-muted-foreground" />
        )}
      </header>

      {isWizard && sections.length > 0 && (
        <div className="space-y-2 px-1">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Section {currentStep + 1} of {sections.length}
            </span>
            <span>{Math.round(((currentStep + 1) / sections.length) * 100)}%</span>
          </div>
          <div
            className="h-1.5 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-label="Form progress"
            aria-valuemin={0}
            aria-valuemax={sections.length}
            aria-valuenow={currentStep + 1}
            aria-valuetext={`Section ${currentStep + 1} of ${sections.length}`}
          >
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${((currentStep + 1) / sections.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      <fieldset disabled={readOnly || isSaving || isSubmitting} className="min-w-0 space-y-6 disabled:opacity-80">
        {visibleSections.map((section) => (
          <FormSection
            key={section._id}
            section={section}
            answers={answers}
            errors={errors}
            onAnswerChange={updateAnswer}
          />
        ))}
      </fieldset>

      {sections.length === 0 && (
        <div className="rounded-xl border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
          This form has no visible sections yet.
        </div>
      )}

      {sections.length > 0 && ((isWizard && sections.length > 1) || onSubmit) && (
        <div className="space-y-3">
          {submitError && <p role="alert" className="text-sm text-destructive">{submitError}</p>}
          {saveError && <p role="alert" className="text-sm text-destructive">{saveError}</p>}
          <div className="flex flex-wrap justify-between gap-3">
            {isWizard && sections.length > 1 && (
              <Button
                type="button"
                variant="outline"
                disabled={currentStep === 0 || isSubmitting || isSaving}
                onClick={() => {
                  setStep(currentStep - 1);
                  setFocusTarget({ kind: "section", id: sections[currentStep - 1]._id });
                }}
              >
                Previous
              </Button>
            )}
            {onSave && (
              <Button type="button" variant="outline" disabled={isSaving || isSubmitting} onClick={saveForLater}>
                {isSaving ? "Saving…" : "Continue later"}
              </Button>
            )}
            {isWizard && currentStep < sections.length - 1 ? (
              <Button type="button" className="ml-auto" disabled={isSubmitting || isSaving} onClick={nextStep}>
                Next
              </Button>
            ) : onSubmit ? (
              <Button type="button" className="ml-auto" disabled={isSubmitting || isSaving} onClick={submit}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
