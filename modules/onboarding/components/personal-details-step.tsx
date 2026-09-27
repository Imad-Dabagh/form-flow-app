"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { ArrowRight, ImagePlus, Loader2, UserRound, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthenticatedProfile } from "@/modules/auth";
import {
  FilePicker,
  IMAGE_FILE_ACCEPT,
} from "@/modules/shared/components/file-upload/file-picker";
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
  const [profilePic, setProfilePic] = useState(profile.profilePic);
  const [isUploading, setIsUploading] = useState(false);
  const { trigger, error, isMutating } =
    API.profile.useUpdateCurrentProfile();

  async function savePersonalDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await trigger({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        profilePic,
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

        <FilePicker
          accept={IMAGE_FILE_ACCEPT}
          buttonTitle={profilePic ? "Change photo" : "Upload photo"}
          maxFiles={1}
          onFilesUploaded={(files) => {
            if (files[0]) {
              setProfilePic(files[0].url);
            }
          }}
          onUploadingChange={setIsUploading}
          render={({
            error: uploadError,
            getInputProps,
            getRootProps,
            isDragActive,
            isDragReject,
            isUploading: isPhotoUploading,
            open,
          }) => (
            <div
              {...getRootProps({
                className: cn(
                  "mt-8 flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition-colors dark:border-white/10 dark:bg-white/[0.03]",
                  isDragActive &&
                    !isDragReject &&
                    "border-primary-500 bg-primary-50 dark:bg-primary-950/30",
                  isDragReject &&
                    "border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-500/10",
                ),
              })}
            >
              <input {...getInputProps()} />
              <div
                className={cn(
                  "group/preview relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-full border-2 bg-white text-slate-400 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-500",
                  !profilePic &&
                    "border-dashed border-slate-300 dark:border-slate-600",
                )}
              >
                {profilePic ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt="Profile preview"
                    className="size-full object-cover"
                    src={profilePic}
                  />
                ) : getInitials(firstName, lastName) !== "U" ? (
                  <span className="text-base font-bold text-[#102a43] dark:text-cyan-200">
                    {getInitials(firstName, lastName)}
                  </span>
                ) : (
                  <UserRound className="size-7" />
                )}
                {profilePic && (
                  <button
                    aria-label="Remove profile photo"
                    className="absolute right-1 top-1 grid size-5 place-items-center rounded-full border border-slate-200 bg-white/95 text-slate-600 shadow-sm transition hover:text-red-600 focus-visible:opacity-100 sm:opacity-0 sm:group-hover/preview:opacity-100 dark:border-white/15 dark:bg-slate-900/90 dark:text-slate-300"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setProfilePic("");
                    }}
                    type="button"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <Button
                  disabled={isPhotoUploading}
                  onClick={open}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  {isPhotoUploading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ImagePlus className="size-4" />
                  )}
                  {isPhotoUploading
                    ? "Uploading…"
                    : profilePic
                      ? "Change photo"
                      : "Upload photo"}
                </Button>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  {isDragActive
                    ? "Drop the image here"
                    : "Optional · PNG, JPG, WebP, GIF, or AVIF · 15 MB max"}
                </p>
                {uploadError && (
                  <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                    {uploadError}
                  </p>
                )}
              </div>
            </div>
          )}
        />

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
            <Button disabled={isMutating || isUploading} size="lg" type="submit">
              {isMutating || isUploading ? (
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
