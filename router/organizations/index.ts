import { requestData } from "@/lib/request";
import type { OrganizationSummary } from "@/modules/organizations/types";

export function getOrganizations(): Promise<OrganizationSummary[]> {
  return requestData<OrganizationSummary[]>({ method: "GET", url: "/orgs" });
}

export function createOrganization(input: {
  name: string;
  slug: string;
}): Promise<OrganizationSummary> {
  return requestData<OrganizationSummary>({
    method: "POST",
    url: "/orgs",
    data: input,
  });
}
