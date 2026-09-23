import type { ReactNode } from "react";
import { RedirectAuthenticated } from "@/modules/auth";

export default function AuthRouteLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <main className="min-h-screen bg-background">
      <RedirectAuthenticated>{children}</RedirectAuthenticated>
    </main>
  );
}
