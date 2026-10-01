"use client";

import { useState } from "react";
import type { FormQuestion, OrganizationFormDetails } from "@/router/orgs/forms";
import { Button } from "@/modules/shared/components/ui/button";
import { RichTextContent } from "@/modules/shared/components/rich-text-editor/content";
import { FormSection } from "./components/form-section";
import type { FormAnswer, FormAnswers } from "./types";

function initialAnswer(question: FormQuestion): FormAnswer {
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

function initialAnswers(form: OrganizationFormDetails): FormAnswers {
  return Object.fromEntries(
    form.sections.flatMap((section) =>
      section.questions.map((question) => [question._id, initialAnswer(question)]),
    ),
  );
}

export function FormRenderer({ form }: { form: OrganizationFormDetails }) {
  const [answers, setAnswers] = useState<FormAnswers>(() => initialAnswers(form));
  const [step, setStep] = useState(0);
  const sections = form.sections.filter((section) => !section.isHidden);
  const isWizard = form.displayMode === "WIZARD";
  const currentStep = Math.min(step, Math.max(0, sections.length - 1));
  const visibleSections = isWizard ? sections.slice(currentStep, currentStep + 1) : sections;

  function updateAnswer(questionId: string, value: FormAnswer) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  }

  return (
    <div className="space-y-6">
      <header className="rounded-xl border bg-card px-5 py-6 shadow-sm sm:px-7 sm:py-7">
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
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${((currentStep + 1) / sections.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {visibleSections.map((section) => (
        <FormSection
          key={section._id}
          section={section}
          answers={answers}
          onAnswerChange={updateAnswer}
        />
      ))}

      {sections.length === 0 && (
        <div className="rounded-xl border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
          This form has no visible sections yet.
        </div>
      )}

      {isWizard && sections.length > 1 && (
        <div className="flex justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={currentStep === 0}
            onClick={() => setStep(currentStep - 1)}
          >
            Previous
          </Button>
          {currentStep < sections.length - 1 && (
            <Button type="button" onClick={() => setStep(currentStep + 1)}>
              Next
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
