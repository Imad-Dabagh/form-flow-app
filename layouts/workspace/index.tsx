"use client";

import type { ReactNode } from "react";
import { LeftSidebar } from "./left-sidebar";
import {
  OrganizationThemeScope,
  useOrganizationWorkspace,
} from "@/modules/organizations";

export function WorkspaceLayout({ children }: { children: ReactNode }) {
  const organization = useOrganizationWorkspace();

  return (
    <OrganizationThemeScope primaryColor={organization.primaryColor}>
      <LeftSidebar />
      <main className="fixed inset-y-0 right-0 left-16 overflow-y-auto bg-background sm:left-64">
        {children}
      </main>
    </OrganizationThemeScope>
  );
}
