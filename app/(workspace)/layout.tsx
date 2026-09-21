import type { ReactNode } from "react";
import { WorkspaceLayout } from "@/layouts/workspace";

export default function WorkspaceRouteLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <WorkspaceLayout>{children}</WorkspaceLayout>;
}
