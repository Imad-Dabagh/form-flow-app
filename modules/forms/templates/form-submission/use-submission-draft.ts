"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toApiError } from "@/lib/api-error";
import type { FormPresentation } from "@/router/orgs/forms";
import type { FormDraft, SavedDraftFile } from "@/router/form-drafts";
import * as drafts from "@/router/form-drafts";
import type { FormAnswer, FormAnswers } from "../form-renderer/types";
import { uploadExtensions } from "../../upload-policy";

type DraftState = {
  status: "loading" | "ready" | "error";
  draft: FormDraft | null;
  error?: Error;
};

function savedFileAllowed(file: SavedDraftFile, question: FormPresentation["sections"][number]["questions"][number]) {
  const category = question.typeConfig?.uploadCategory ?? "all";
  const extension = file.name.split(".").pop()?.toLowerCase().replace(/^jpeg$/, "jpg") ?? "";
  const allowed = question.typeConfig?.allowedExtensions?.length
    ? question.typeConfig.allowedExtensions
    : uploadExtensions[category];
  return uploadExtensions[category].includes(extension) && allowed.includes(extension);
}

function restoreDraft(form: FormPresentation, draft: FormDraft) {
  const questions = new Map(form.sections.filter((section) => !section.isHidden)
    .flatMap((section) => section.questions)
    .map((question) => [question._id, question]));
  const initialValues: Partial<FormAnswers> = {};
  let changed = false;

  for (const [id, raw] of Object.entries(draft.formAnswers)) {
    const question = questions.get(id);
    if (!question || question.inputType === "file") {
      changed = true;
      continue;
    }
    if (raw === null || raw === "" || (Array.isArray(raw) && raw.length === 0)) {
      initialValues[id] = raw as FormAnswer;
      continue;
    }
    if (question.inputType === "checkboxes" || question.inputType === "multi-select") {
      if (!Array.isArray(raw) || !raw.every((item) => typeof item === "string")) {
        changed = true;
        continue;
      }
      const allowed = new Set(question.options?.map((option) => option.value));
      const retained = raw.filter((item) => allowed.has(item));
      if (retained.length !== raw.length) changed = true;
      initialValues[id] = retained;
    } else if (question.inputType === "boolean") {
      if (typeof raw === "boolean") initialValues[id] = raw;
      else changed = true;
    } else if (question.inputType === "linear-scale") {
      if (typeof raw === "number" && raw >= (question.typeConfig?.min ?? 1) &&
        raw <= (question.typeConfig?.max ?? 5)) initialValues[id] = raw;
      else changed = true;
    } else if (question.inputType === "select" || question.inputType === "radio") {
      if (typeof raw === "string" && question.options?.some((option) => option.value === raw)) {
        initialValues[id] = raw;
      } else changed = true;
    } else if (typeof raw === "string" || typeof raw === "number" || raw === null) {
      initialValues[id] = raw as FormAnswer;
    } else changed = true;
  }

  for (const file of draft.files) {
    const question = questions.get(file.questionId);
    if (!question || question.inputType !== "file" || !savedFileAllowed(file, question)) {
      changed = true;
      continue;
    }
    const current = initialValues[file.questionId];
    const restoredFiles = Array.isArray(current) ? current.filter(isSavedFile) : [];
    initialValues[file.questionId] = [...restoredFiles, file];
  }

  return {
    initialValues,
    changed,
  };
}

function isSavedFile(value: unknown): value is SavedDraftFile {
  return typeof value === "object" && value !== null &&
    "id" in value && typeof value.id === "string" &&
    "url" in value && typeof value.url === "string";
}

export function useSubmissionDraft({
  form,
  formId,
  organizationSlug,
}: {
  form?: FormPresentation;
  formId: string;
  organizationSlug: string;
}) {
  const basePath = `/orgs/${organizationSlug}/forms/${formId}`;
  const readyFormId = form?.id;
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<DraftState>({ status: "loading", draft: null });
  const uploadedFiles = useRef(new WeakMap<File, string>());

  useEffect(() => {
    if (!readyFormId) return;
    let active = true;
    setState({ status: "loading", draft: null });
    async function load() {
      try {
        const draft = await drafts.getCurrentDraft({ basePath });
        if (active) setState({ status: "ready", draft });
      } catch (error) {
        if (active) setState({ status: "error", draft: null, error: toApiError(error) });
      }
    }
    void load();
    return () => { active = false; };
  }, [basePath, readyFormId, attempt]);

  const restored = useMemo(() => form && state.draft
    ? restoreDraft(form, state.draft)
    : { initialValues: {}, changed: false }, [form, state.draft]);

  async function save(answers: FormAnswers) {
    if (!form || state.status !== "ready") throw new Error("The form is not ready to save.");
    let working = state.draft;
    const access = { basePath };

    if (!working) {
      const created = await drafts.createDraft({ basePath });
      working = created;
      setState({ status: "ready", draft: working });
    }

    const visibleQuestions = form.sections.filter((section) => !section.isHidden)
      .flatMap((section) => section.questions);
    const formAnswers: Record<string, unknown> = {};
    const keptFileIds = new Set<string>();
    const newFiles: Array<{ questionId: string; file: File }> = [];

    for (const question of visibleQuestions) {
      const value = answers[question._id];
      if (question.inputType === "file") {
        if (!Array.isArray(value)) continue;
        for (const file of value) {
          if (isSavedFile(file)) keptFileIds.add(file.id);
          else if (typeof File !== "undefined" && file instanceof File) {
            const uploadedId = uploadedFiles.current.get(file);
            if (uploadedId) keptFileIds.add(uploadedId);
            else newFiles.push({ questionId: question._id, file });
          }
        }
      } else if (value === null || typeof value === "string" ||
        typeof value === "number" || typeof value === "boolean" ||
        (Array.isArray(value) && value.every((item) => typeof item === "string"))) {
        formAnswers[question._id] = value;
      }
    }

    for (const file of working.files) {
      if (!keptFileIds.has(file.id)) {
        working = await drafts.removeDraftFile(access, working, file.id);
        setState({ status: "ready", draft: working });
      }
    }
    for (const { questionId, file } of newFiles) {
      working = await drafts.uploadDraftFile(access, working, questionId, file);
      const uploaded = working.files.at(-1);
      if (uploaded) uploadedFiles.current.set(file, uploaded.id);
      setState({ status: "ready", draft: working });
    }
    working = await drafts.saveDraft(access, working, formAnswers);
    setState({ status: "ready", draft: working });
    return working;
  }

  async function finalize(answers: FormAnswers) {
    const access = { basePath };
    let saved: FormDraft;
    try {
      saved = await save(answers);
    } catch (error) {
      if (toApiError(error).status === 404 && state.draft) {
        return drafts.submitDraft(access, state.draft);
      }
      throw error;
    }
    try {
      return await drafts.submitDraft(access, saved);
    } catch (error) {
      const status = toApiError(error).status;
      if (!status || status === 409 || status >= 500) {
        try {
          return await drafts.submitDraft(access, saved);
        } catch { /* The original failure is more useful. */ }
      }
      throw error;
    }
  }

  return {
    ...state,
    ...restored,
    notice: restored.changed
      ? "This form changed since your draft was saved. Some answers or files could not be restored; review the form before submitting."
      : undefined,
    save,
    finalize,
    retry: () => setAttempt((current) => current + 1),
  };
}
