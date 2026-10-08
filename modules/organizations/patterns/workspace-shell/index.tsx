"use client";

import type { ReactNode } from "react";
import { OrganizationWorkspaceSidebar } from "./organization-workspace-sidebar";
import { OrganizationThemeScope } from "./organization-theme-scope";
import { useOrganizationWorkspace } from "@/lib/organization";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/modules/shared/components/ui/sidebar";

export function OrganizationWorkspaceShell({
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
        <OrganizationWorkspaceSidebar />
        <SidebarInset className="min-h-svh min-w-0 bg-background">
          <div className="px-4 pt-3 md:hidden">
            <SidebarTrigger
              aria-label="Open navigation menu"
              className="size-9 text-muted-foreground"
            />
          </div>
          <div className="min-w-0 flex-1">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </OrganizationThemeScope>
  );
}
