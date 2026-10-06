import { requestData } from "@/lib/request";
import type { CurrentUserSubmission } from "../index";

/** POST /api/me/forms/:formId/submission/files/:questionId */
export function upload(formId: string, questionId: string, file: File, replaceFileId?: string) {
  const data = new FormData();
  data.append("file", file);
  return requestData<CurrentUserSubmission>({
    method: "POST",
    url: `/me/forms/${formId}/submission/files/${questionId}${replaceFileId
      ? `?replaceFileId=${encodeURIComponent(replaceFileId)}` : ""}`,
    data,
  });
}

/** DELETE /api/me/forms/:formId/submission/files/:fileId */
export function remove(formId: string, fileId: string) {
  return requestData<CurrentUserSubmission>({
    method: "DELETE", url: `/me/forms/${formId}/submission/files/${fileId}`,
  });
}
