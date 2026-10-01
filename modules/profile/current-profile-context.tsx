"use client";

import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import type { CurrentProfile } from "@/router/me/types";

const CurrentProfileContext = createContext<CurrentProfile | null>(null);

export function CurrentProfileProvider({
  children,
  profile,
}: {
  children: ReactNode;
  profile: CurrentProfile;
}) {
  return (
    <CurrentProfileContext.Provider value={profile}>{children}</CurrentProfileContext.Provider>
  );
}

export function useCurrentProfileContext(): CurrentProfile {
  const profile = useContext(CurrentProfileContext);

  if (!profile) {
    throw new Error("useCurrentProfileContext must be used within CurrentProfileProvider.");
  }

  return profile;
}
