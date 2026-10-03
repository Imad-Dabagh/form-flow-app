import type { SavedDraftFile } from "@/router/form-drafts";

export type FormAnswer = string | number | boolean | string[] | Array<File | SavedDraftFile> | null;
export type FormAnswers = Record<string, FormAnswer>;
