export function organizationWorkspacePath(
  organizationSlug: string,
  path = "",
): string {
  return `/orgs/${organizationSlug}${path}`;
}
