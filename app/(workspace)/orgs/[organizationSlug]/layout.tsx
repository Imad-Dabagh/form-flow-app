import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { OrganizationAccessBoundary } from "./organization-access-boundary";
import { OrganizationWorkspaceShell } from "@/modules/organizations";

export default async function OrganizationWorkspaceLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const cookieStore = await cookies();
  const sidebarOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return (
    <OrganizationAccessBoundary>
      <OrganizationWorkspaceShell defaultSidebarOpen={sidebarOpen}>
        {children}
      </OrganizationWorkspaceShell>
    </OrganizationAccessBoundary>
  );
}
