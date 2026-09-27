"use client";

import type { ReactNode } from "react";
import { LeftSidebar } from "./left-sidebar";
import {
  OrganizationThemeScope,
  useOrganizationWorkspace,
} from "@/modules/organizations";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
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
