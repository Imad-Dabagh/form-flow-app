import type { SavedSubmissionFile } from "@/router/me/forms/submission";

export type FormAnswer = string | number | boolean | string[] | Array<File | SavedSubmissionFile> | null;
export type FormAnswers = Record<string, FormAnswer>;
