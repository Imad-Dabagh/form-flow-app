"use client";

import type { ReactNode } from "react";
import { useAuthenticatedProfile } from "./require-authentication";

export function RequireSuperAdmin({ children }: { children: ReactNode }) {
  const profile = useAuthenticatedProfile();

  if (!profile.isSuperAdmin) {
    return (
      <div className="grid min-h-screen place-items-center px-6 text-center text-sm text-muted-foreground">
        You do not have access to the platform administration area.
      </div>
    );
  }

  return <>{children}</>;
}
