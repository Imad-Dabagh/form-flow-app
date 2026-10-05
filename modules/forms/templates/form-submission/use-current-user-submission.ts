"use client";

import { useRef } from "react";
import { toApiError } from "@/lib/api-error";
import API from "@/router";
import type { SavedSubmissionFile } from "@/router/me/form-submission";
import type { FormAnswers } from "../form-renderer/types";

function isSavedFile(value: unknown): value is SavedSubmissionFile {
  return typeof value === "object" && value !== null &&
    "id" in value && typeof value.id === "string" &&
    "url" in value && typeof value.url === "string";
}

export function useCurrentUserSubmission(formId: string) {
  const { current, error, isLoading, mutate } = API.me.formSubmission.useCurrent(formId);
  const uploadedFiles = useRef(new WeakMap<File, string>());

  async function save(answers: FormAnswers) {
    if (!current) throw new Error("This submission is unavailable.");
    const { form } = current;
    const currentStatus = current.submissionStatuses.find(
      (status) => status.id === current.submission.submissionStatusId,
    );
    if (form.isClosed || !currentStatus || currentStatus.isSubmissionLocked) {
      throw new Error("This submission cannot be edited.");
    }
    let updated = current.submission;
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

    for (const { questionId, file } of newFiles) {
      const replaced = Array.isArray(updated.answers[questionId])
        ? updated.answers[questionId].filter(isSavedFile)
          .find((savedFile) => !keptFileIds.has(savedFile.id))
        : undefined;
      const before = new Set(
        Array.isArray(updated.answers[questionId])
          ? updated.answers[questionId].filter(isSavedFile).map((item) => item.id)
          : [],
      );
      updated = await API.me.formSubmission.uploadFile(formId, questionId, file, replaced?.id);
      const savedFiles = updated.answers[questionId];
      const uploaded = Array.isArray(savedFiles)
        ? savedFiles.filter(isSavedFile).find((item) => !before.has(item.id))
        : undefined;
      if (uploaded) {
        uploadedFiles.current.set(file, uploaded.id);
        keptFileIds.add(uploaded.id);
      }
      await mutate({ ...current, submission: updated }, { revalidate: false });
    }
    for (const raw of Object.values(updated.answers)) {
      if (!Array.isArray(raw)) continue;
      for (const file of raw.filter(isSavedFile)) {
        if (keptFileIds.has(file.id)) continue;
        updated = await API.me.formSubmission.removeFile(formId, file.id);
        await mutate({ ...current, submission: updated }, { revalidate: false });
      }
    }
    updated = await API.me.formSubmission.save(formId, formAnswers);
    await mutate({ ...current, submission: updated }, { revalidate: false });
    return updated;
  }

  async function finalize(answers: FormAnswers) {
    if (current?.submission.submittedAt) return save(answers);
    try {
      await save(answers);
    } catch (error) {
      if (toApiError(error).status === 409) {
        const latest = await mutate();
        if (latest?.submission.submittedAt) return latest.submission;
      }
      throw error;
    }
    const submitted = await API.me.formSubmission.submit(formId);
    if (current) await mutate({ ...current, submission: submitted }, { revalidate: false });
    return submitted;
  }

  return { current, error, isLoading, retry: mutate, save, finalize };
}
