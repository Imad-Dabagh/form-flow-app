"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { ArrowRight, Camera, Loader2 } from "lucide-react";
import { useAuthenticatedProfile } from "@/modules/auth";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/modules/shared/components/ui/avatar";
import { Button } from "@/modules/shared/components/ui/button";
import { Input } from "@/modules/shared/components/ui/input";
import { Label } from "@/modules/shared/components/ui/label";
import API from "@/router";
import { OnboardingFrame } from "./onboarding-frame";

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U";
}

export function PersonalDetailsStep() {
  const profile = useAuthenticatedProfile();
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const { trigger, error, isMutating } =
    API.profile.useUpdateCurrentProfile();

  async function savePersonalDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await trigger({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
    } catch {
      // The mutation exposes the API error for the form to render.
    }
  }

  return (
    <OnboardingFrame
      description="Start with the details your teammates will see. You can update them again later from your profile."
      eyebrow="Welcome aboard"
      step={1}
      title="Let's get to know you."
    >
      <section className="rounded-[1.75rem] border border-white/80 bg-white p-6 shadow-[0_24px_80px_-38px_rgba(15,42,67,0.45)] sm:p-9 dark:border-white/10 dark:bg-[#182124] dark:shadow-black/30">
        <div>
          <p className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">
            Your profile
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
            Add your personal details
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Your photo is optional. Your name helps people recognize you
            across workspaces.
          </p>
        </div>

        <div className="mt-8 flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <Avatar className="size-16 border-2 border-white shadow-sm dark:border-white/10">
            {profile.profilePic && (
              <AvatarImage alt="" src={profile.profilePic} />
            )}
            <AvatarFallback className="bg-[#dff7fa] text-base font-bold text-[#102a43] dark:bg-cyan-300 dark:text-slate-950">
              {getInitials(firstName, lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <Button disabled size="sm" type="button" variant="outline">
              <Camera className="size-4" />
              Upload photo
            </Button>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Optional · Uploads will be available soon
            </p>
          </div>
        </div>

        <form className="mt-8" onSubmit={savePersonalDetails}>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                autoComplete="given-name"
                autoFocus
                id="firstName"
                maxLength={50}
                onChange={(event) => setFirstName(event.target.value)}
                required
                value={firstName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                autoComplete="family-name"
                id="lastName"
                maxLength={50}
                onChange={(event) => setLastName(event.target.value)}
                required
                value={lastName}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                className="disabled:cursor-default disabled:bg-slate-100 disabled:opacity-100 dark:disabled:bg-white/[0.04]"
                disabled
                id="email"
                type="email"
                value={profile.email}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your email comes from your sign-in account and cannot be
                changed here.
              </p>
            </div>
          </div>

          {error && (
            <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
              {error.message}
            </p>
          )}

          <div className="mt-8 flex justify-end border-t border-slate-200 pt-6 dark:border-white/10">
            <Button disabled={isMutating} size="lg" type="submit">
              {isMutating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ArrowRight className="size-4" />
              )}
              Save and continue
            </Button>
          </div>
        </form>
      </section>
    </OnboardingFrame>
  );
}
