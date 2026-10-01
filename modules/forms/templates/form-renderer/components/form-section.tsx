import type { FormSection as FormSectionData } from "@/router/orgs/forms";
import { QuestionField } from "./question-field";
import type { FormAnswer, FormAnswers } from "../types";

export function FormSection({
  section,
  answers,
  onAnswerChange,
}: {
  section: FormSectionData;
  answers: FormAnswers;
  onAnswerChange: (questionId: string, value: FormAnswer) => void;
}) {
  return (
    <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <header className="border-b bg-muted/30 px-5 py-4 sm:px-6">
        <h2 className="text-lg font-semibold">{section.title}</h2>
        {section.description && (
          <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
        )}
      </header>
      <div className="divide-y">
        {section.questions.map((question) => (
          <div key={question._id} className="px-5 py-5 sm:px-6">
            <QuestionField
              question={question}
              value={answers[question._id] ?? null}
              onChange={(value) => onAnswerChange(question._id, value)}
            />
          </div>
        ))}
        {section.questions.length === 0 && (
          <p className="px-5 py-6 text-sm text-muted-foreground sm:px-6">
            No questions in this section yet.
          </p>
        )}
      </div>
    </section>
  );
}
