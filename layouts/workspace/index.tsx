import type { ReactNode } from "react";
import { LeftSidebar } from "./left-sidebar";
import { TopNavbar } from "./top-navbar";

export function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <LeftSidebar />
      <TopNavbar />
      <main className="fixed top-16 right-0 bottom-0 left-64 overflow-y-auto bg-background">
        {children}
      </main>
    </>
  );
}
