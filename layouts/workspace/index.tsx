"use client";

import type { ReactNode } from "react";
import { LeftSidebar } from "./left-sidebar";
import { WorkspaceHeader } from "./workspace-header";
import {
  OrganizationThemeScope,
  useOrganizationWorkspace,
} from "@/modules/organizations";
import {
  SidebarInset,
  SidebarProvider,
} from "@/modules/shared/components/ui/sidebar";

export function WorkspaceLayout({
  children,
  defaultSidebarOpen,
}: {
  children: ReactNode;
  defaultSidebarOpen: boolean;
}) {
  const organization = useOrganizationWorkspace();

  return (
    <OrganizationThemeScope primaryColor={organization.primaryColor}>
      <SidebarProvider defaultOpen={defaultSidebarOpen}>
        <LeftSidebar />
        <SidebarInset className="min-h-svh min-w-0 bg-background">
          <WorkspaceHeader />
          <div className="min-w-0 flex-1">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </OrganizationThemeScope>
  );
}
