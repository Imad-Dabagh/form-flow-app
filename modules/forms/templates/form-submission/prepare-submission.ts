import { ApiError } from "@/lib/api-error";
import type { FormPresentation } from "@/router/orgs/forms";
import type { FormAnswers } from "../form-renderer/types";
import { MAX_SUBMISSION_FILES, MAX_UPLOAD_BYTES, uploadExtensions } from "../../upload-policy";

export function prepareSubmission(form: FormPresentation | undefined, answers: FormAnswers): FormData | { formAnswers: Record<string, unknown> } {
  if (!form) throw new ApiError({ message: "The form is still loading." });
  const questions = new Map(form.sections.flatMap((section) => section.questions).map((question) => [question._id, question]));
  const formAnswers: Record<string, unknown> = {};
  const files: Array<{ questionId: string; file: File }> = [];

  for (const [questionId, value] of Object.entries(answers)) {
    const question = questions.get(questionId);
    if (Array.isArray(value) && value.some((item) => item instanceof File)) {
      if (question?.inputType !== "file" || !value.every((item) => item instanceof File)) {
        throw new ApiError({ message: "Choose valid files.", details: { questionId } });
      }
      const category = question.typeConfig?.uploadCategory ?? "all";
      const allowed = question.typeConfig?.allowedExtensions?.length
        ? question.typeConfig.allowedExtensions
        : uploadExtensions[category];
      for (const file of value as File[]) {
        const extension = file.name.split(".").pop()?.toLowerCase().replace(/^jpeg$/, "jpg") ?? "";
        if (file.size > MAX_UPLOAD_BYTES) {
          throw new ApiError({ message: "Each file must be 15 MB or smaller.", details: { questionId } });
        }
        if (!uploadExtensions[category].includes(extension) || !allowed.includes(extension)) {
          throw new ApiError({ message: "This file extension is not allowed for this question.", details: { questionId } });
        }
        files.push({ questionId, file });
      }
    } else if (question?.inputType !== "file") {
      formAnswers[questionId] = value;
    }
  }

  if (files.length > MAX_SUBMISSION_FILES) throw new ApiError({ message: `Submit at most ${MAX_SUBMISSION_FILES} files.` });
  if (!files.length) return { formAnswers };

  const payload = new FormData();
  payload.append("formAnswers", JSON.stringify({ formAnswers }));
  for (const { questionId, file } of files) payload.append(questionId, file);
  return payload;
}
