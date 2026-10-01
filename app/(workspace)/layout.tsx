import type { ReactNode } from "react";
import { RequireAuthentication } from "../require-authentication";

export default function WorkspaceRouteLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <RequireAuthentication>{children}</RequireAuthentication>;
}
