"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import API from "@/router";
import { getAuthCallbackPath } from "../redirect-path";

export function RedirectAuthenticated({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = API.auth.useSession();
  const isAuthenticated = Boolean(session?.user.emailVerified);
  const callbackPath = getAuthCallbackPath(searchParams.get("next"));

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(callbackPath);
    }
  }, [callbackPath, isAuthenticated, router]);

  if (isPending || isAuthenticated) {
    return (
      <div className="grid min-h-screen place-items-center px-6 text-sm text-muted-foreground">
        Checking your session…
      </div>
    );
  }

  return children;
}
