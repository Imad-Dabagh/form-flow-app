export function getAuthCallbackPath(requestedPath: string | null): string {
  if (
    requestedPath?.startsWith("/") &&
    !requestedPath.startsWith("//") &&
    requestedPath !== "/sign-in" &&
    !requestedPath.startsWith("/sign-in?")
  ) {
    return requestedPath;
  }

  return "/";
}
