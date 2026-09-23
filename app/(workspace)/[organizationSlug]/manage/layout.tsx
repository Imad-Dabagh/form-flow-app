import type { ReactNode } from "react";
import { WorkspaceLayout } from "@/layouts/workspace";
import { OrganizationWorkspaceBoundary } from "@/modules/organizations";

export default function OrganizationManageLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <OrganizationWorkspaceBoundary>
      <WorkspaceLayout>{children}</WorkspaceLayout>
    </OrganizationWorkspaceBoundary>
  );
}
