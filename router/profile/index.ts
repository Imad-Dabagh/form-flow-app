import { requestData } from "@/lib/request";
import type { CurrentProfile } from "@/modules/profile/types";

export function getCurrentProfile(): Promise<CurrentProfile> {
  return requestData<CurrentProfile>({ method: "GET", url: "/me" });
}
