import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { WorkspaceLayout } from "@/layouts/workspace";
import { OrganizationWorkspaceBoundary } from "@/modules/organizations";

export default async function OrganizationWorkspaceLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const cookieStore = await cookies();
  const sidebarOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return (
    <OrganizationWorkspaceBoundary>
      <WorkspaceLayout defaultSidebarOpen={sidebarOpen}>
        {children}
      </WorkspaceLayout>
    </OrganizationWorkspaceBoundary>
  );
}
