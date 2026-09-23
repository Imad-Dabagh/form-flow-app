import type { ReactNode } from "react";
import { RequireAuthentication } from "@/modules/auth";

export default function WorkspaceRouteLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <RequireAuthentication>{children}</RequireAuthentication>;
}
