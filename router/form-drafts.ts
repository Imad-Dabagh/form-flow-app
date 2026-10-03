import { requestData } from "@/lib/request";

export interface SavedDraftFile {
  id: string;
  questionId: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
}

export interface FormDraft {
  id: string;
  formAnswers: Record<string, unknown>;
  files: SavedDraftFile[];
  updatedAt: string;
}

export interface DraftAccess {
  basePath: string;
}

export function createDraft({ basePath }: DraftAccess) {
  return requestData<FormDraft>({
    method: "POST",
    url: `${basePath}/submissions/drafts`,
  });
}

export function getCurrentDraft({ basePath }: DraftAccess) {
  return requestData<FormDraft | null>({
    method: "GET",
    url: `${basePath}/submissions/drafts/current`,
  });
}

export function saveDraft({ basePath }: DraftAccess, draft: FormDraft, formAnswers: Record<string, unknown>) {
  return requestData<FormDraft>({
    method: "PATCH",
    url: `${basePath}/submissions/drafts/${draft.id}`,
    data: { formAnswers },
  });
}

export function uploadDraftFile({ basePath }: DraftAccess, draft: FormDraft, questionId: string, file: File) {
  const payload = new FormData();
  payload.append("file", file);
  return requestData<FormDraft>({
    method: "POST",
    url: `${basePath}/submissions/drafts/${draft.id}/files/${questionId}`,
    data: payload,
  });
}

export function removeDraftFile({ basePath }: DraftAccess, draft: FormDraft, fileId: string) {
  return requestData<FormDraft>({
    method: "DELETE",
    url: `${basePath}/submissions/drafts/${draft.id}/files/${fileId}`,
  });
}

export function submitDraft({ basePath }: DraftAccess, draft: FormDraft) {
  return requestData<{ id: string; submittedAt: string }>({
    method: "POST",
    url: `${basePath}/submissions/drafts/${draft.id}/submit`,
  });
}
