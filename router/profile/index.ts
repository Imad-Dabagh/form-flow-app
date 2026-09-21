import { requestData } from "@/lib/request";
import type { CurrentProfile } from "@/modules/profile/types";

export function getCurrentProfile(): Promise<CurrentProfile> {
  return requestData<CurrentProfile>({ method: "GET", url: "/me" });
}

export function completeOnboarding(username: string): Promise<{ username: string }> {
  return requestData<{ username: string }>({
    method: "POST",
    url: "/me/onboarding",
    data: { username },
  });
}
