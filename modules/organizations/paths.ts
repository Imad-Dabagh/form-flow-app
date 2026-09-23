export function organizationManagePath(
  organizationSlug: string,
  path = "",
): string {
  return `/${organizationSlug}/manage${path}`;
}
