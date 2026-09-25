"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthenticatedProfile } from "@/modules/auth";
import API from "@/router";
import { OrganizationSetupStep } from "./organization-setup-step";
import { PersonalDetailsStep } from "./personal-details-step";

function FlowState({ children }: { children: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-[#f3f7f8] px-6 text-center text-sm text-slate-500 dark:bg-[#111719] dark:text-slate-400">
      {children}
    </div>
  );
}

export function OnboardingFlow() {
  const router = useRouter();
  const profile = useAuthenticatedProfile();
  const { organizations, error, isLoading } =
    API.organizations.useOrganizations();
  const hasPersonalDetails = Boolean(
    profile.firstName.trim() && profile.lastName.trim(),
  );

  useEffect(() => {
    if (profile.onboardingCompletedAt) {
      router.replace("/");
    }
  }, [profile.onboardingCompletedAt, router]);

  if (profile.onboardingCompletedAt) {
    return <FlowState>Opening your workspace…</FlowState>;
  }

  if (isLoading) {
    return <FlowState>Preparing your setup…</FlowState>;
  }

  if (error) {
    return (
      <FlowState>
        We couldn&apos;t load your organizations. Refresh the page and try again.
      </FlowState>
    );
  }

  if (!organizations[0] && hasPersonalDetails) {
    return <OrganizationSetupStep />;
  }

  return <PersonalDetailsStep />;
}
