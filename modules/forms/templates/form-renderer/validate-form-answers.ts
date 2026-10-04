import type { FormPresentationQuestion, FormPresentationSection } from "@/router/orgs/forms";
import type { FormAnswer, FormAnswers } from "./types";

export type FormErrors = Record<string, string>;

function isEmpty(value: FormAnswer | undefined) {
  return value == null ||
    (typeof value === "string" && value.trim() === "") ||
    (Array.isArray(value) && value.length === 0);
}

function validateQuestion(question: FormPresentationQuestion, value: FormAnswer | undefined): string | undefined {
  if (isEmpty(value)) return question.isRequired ? "An answer is required." : undefined;

  if (question.inputType === "boolean") {
    return question.isRequired && value !== true ? "This must be checked." : undefined;
  }

  if (["string", "text", "email", "url", "countries"].includes(question.inputType)) {
    if (typeof value !== "string") return "Enter valid text.";
    if (question.validation?.minLength !== undefined && value.length < question.validation.minLength) {
      return `Enter at least ${question.validation.minLength} characters.`;
    }
    if (question.validation?.maxLength !== undefined && value.length > question.validation.maxLength) {
      return `Enter at most ${question.validation.maxLength} characters.`;
    }
    if (question.inputType === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Enter a valid email address.";
    }
    if (question.inputType === "url") {
      try {
        const url = new URL(value.trim());
        if (!["http:", "https:"].includes(url.protocol) || !url.hostname) {
          return "Enter a valid http or https URL.";
        }
      } catch {
        return "Enter a valid http or https URL.";
      }
    }
    return undefined;
  }

  if (question.inputType === "number") {
    const number = typeof value === "number" || (typeof value === "string" && value.trim() !== "")
      ? Number(value)
      : NaN;
    if (!Number.isFinite(number)) return "Enter a valid number.";
    if (question.validation?.min !== undefined && number < question.validation.min) {
      return `Enter a number of at least ${question.validation.min}.`;
    }
    if (question.validation?.max !== undefined && number > question.validation.max) {
      return `Enter a number of at most ${question.validation.max}.`;
    }
    return undefined;
  }

  if (question.inputType === "select" || question.inputType === "radio") {
    return typeof value === "string" && question.options?.some((option) => option.value === value)
      ? undefined : "Choose an available option.";
  }

  if (question.inputType === "checkboxes" || question.inputType === "multi-select") {
    return Array.isArray(value) && value.every((item) => typeof item === "string") &&
      new Set(value).size === value.length &&
      value.every((item) => question.options?.some((option) => option.value === item))
      ? undefined : "Choose available options without duplicates.";
  }

  if (question.inputType === "datetime") {
    if (typeof value !== "string") return "Enter a valid date or time.";
    if (question.typeConfig?.type === "time") {
      return /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? undefined : "Enter a valid date or time.";
    }
    const date = new Date(`${value}T00:00:00Z`);
    return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === value ? undefined : "Enter a valid date or time.";
  }

  if (question.inputType === "linear-scale") {
    const min = question.typeConfig?.min ?? 1;
    const max = question.typeConfig?.max ?? 5;
    return typeof value === "number" && Number.isInteger(value) && value >= min && value <= max
      ? undefined : "Choose a value on the scale.";
  }

  // File size and type are checked when the submission payload is prepared.
  return undefined;
}

export function validateSections(sections: FormPresentationSection[], answers: FormAnswers): FormErrors {
  const errors: FormErrors = {};
  for (const section of sections) {
    for (const question of section.questions) {
      const error = validateQuestion(question, answers[question._id]);
      if (error) errors[question._id] = error;
    }
  }
  return errors;
}
