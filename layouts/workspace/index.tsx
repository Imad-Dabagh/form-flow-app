"use client";

import type { ReactNode } from "react";
import { LeftSidebar } from "./left-sidebar";
import { TopNavbar } from "./top-navbar";
import {
  getOrganizationThemeStyle,
  useOrganizationWorkspace,
} from "@/modules/organizations";

export function WorkspaceLayout({ children }: { children: ReactNode }) {
  const organization = useOrganizationWorkspace();

  return (
    <div style={getOrganizationThemeStyle(organization.primaryColor)}>
      <LeftSidebar />
      <TopNavbar />
      <main className="fixed top-16 right-0 bottom-0 left-0 overflow-y-auto bg-background md:left-64">
        {children}
      </main>
    </div>
  );
}
