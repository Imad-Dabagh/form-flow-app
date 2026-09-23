"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import API from "@/router";
import type { CurrentProfile } from "@/modules/profile/types";
import { useCurrentProfile } from "@/modules/profile/hooks/use-current-profile";

const AuthenticatedProfileContext = createContext<CurrentProfile | null>(null);

export function useAuthenticatedProfile(): CurrentProfile {
  const profile = useContext(AuthenticatedProfileContext);

  if (!profile) {
    throw new Error("useAuthenticatedProfile must be used within RequireAuthentication.");
  }

  return profile;
}

function AccessState({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center px-6 text-center text-sm text-muted-foreground">
      <div>{children}</div>
    </div>
  );
}

export function RequireAuthentication({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = API.auth.useSession();
  const isVerified = Boolean(session?.user.emailVerified);
  const { profile, error, isLoading } = useCurrentProfile(isVerified);

  useEffect(() => {
    if (isPending || session) {
      return;
    }

    const next = pathname === "/" ? "" : `?next=${encodeURIComponent(pathname)}`;
    router.replace(`/sign-in${next}`);
  }, [isPending, pathname, router, session]);

  if (isPending) {
    return <AccessState>Checking your session…</AccessState>;
  }

  if (!session) {
    return null;
  }

  if (!isVerified) {
    return (
      <AccessState>
        Verify your email before accessing your workspace. Check your inbox for the verification link.
      </AccessState>
    );
  }

  if (isLoading) {
    return <AccessState>Loading your workspace…</AccessState>;
  }

  if (error || !profile) {
    return (
      <AccessState>
        We couldn&apos;t load your profile. Refresh the page and try again.
      </AccessState>
    );
  }

  return (
    <AuthenticatedProfileContext.Provider value={profile}>
      {children}
    </AuthenticatedProfileContext.Provider>
  );
}
