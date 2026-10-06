import { requestData } from "@/lib/request";
import type { CurrentUserSubmission } from "../index";

/** PUT /api/me/forms/:formId/submission/submit */
export function run(formId: string) {
  return requestData<CurrentUserSubmission>({
    method: "PUT", url: `/me/forms/${formId}/submission/submit`,
  });
}
