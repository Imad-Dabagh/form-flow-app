import type { ReactNode } from "react";
import { Suspense } from "react";
import { RedirectAuthenticated } from "./redirect-authenticated";

export default function AuthRouteLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <main className="min-h-screen bg-background">
      <Suspense
        fallback={
          <div className="grid min-h-screen place-items-center px-6 text-sm text-muted-foreground">
            Checking your session…
          </div>
        }
      >
        <RedirectAuthenticated>{children}</RedirectAuthenticated>
      </Suspense>
    </main>
  );
}
