"use client";

import type { FormEvent } from "react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, ImagePlus, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { organizationWorkspacePath } from "@/modules/organizations";
import {
  FilePicker,
  IMAGE_FILE_ACCEPT,
} from "@/modules/shared/components/file-upload/file-picker";
import { Button } from "@/modules/shared/components/ui/button";
import { Input } from "@/modules/shared/components/ui/input";
import { Label } from "@/modules/shared/components/ui/label";
import API from "@/router";
import { OnboardingFrame } from "./onboarding-frame";

const ORGANIZATION_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ORGANIZATION_SLUG_MAX_LENGTH = 20;

function normalizeSlugInput(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .replace(/-{2,}/g, "-")
    .slice(0, ORGANIZATION_SLUG_MAX_LENGTH);
}

function finalizeSlug(value: string): string {
  return normalizeSlugInput(value).replace(/-+$/, "");
}

export function OrganizationSetupStep() {
  const router = useRouter();
  const slugWasEdited = useRef(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [logo, setLogo] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { trigger, error, isMutating } =
    API.orgs.useCreateOne();

  function updateName(value: string) {
    setName(value);
    setValidationError(null);

    if (!slugWasEdited.current) {
      setSlug(finalizeSlug(value));
    }
  }

  function updateSlug(value: string) {
    slugWasEdited.current = true;
    setSlug(normalizeSlugInput(value));
    setValidationError(null);
  }

  async function createOrganization(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const finalSlug = finalizeSlug(slug);
    setSlug(finalSlug);
    setValidationError(null);

    if (!ORGANIZATION_SLUG_PATTERN.test(finalSlug)) {
      setValidationError(
        "Use lowercase letters, numbers, and single hyphens only.",
      );
      return;
    }

    try {
      const organization = await trigger({
        logo,
        name: name.trim(),
        slug: finalSlug,
      });
      router.replace(
        organizationWorkspacePath(organization.slug, "/dashboard"),
      );
    } catch {
      // The mutation exposes the API error for the form to render.
    }
  }

  return (
    <OnboardingFrame
      description="Create the workspace where your team will build forms. You can refine its branding later."
      eyebrow="One last step"
      step={2}
      title="Set up your organization."
    >
      <section className="rounded-[1.75rem] border border-white/80 bg-white p-6 shadow-[0_24px_80px_-38px_rgba(15,42,67,0.45)] sm:p-9 dark:border-white/10 dark:bg-[#182124] dark:shadow-black/30">
        <div>
          <p className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">
            Your workspace
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
            Create your first organization
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            This name and address identify your workspace throughout Form Flow.
          </p>
        </div>

        <FilePicker
          accept={IMAGE_FILE_ACCEPT}
          buttonTitle={logo ? "Change logo" : "Upload logo"}
          maxFiles={1}
          onFilesUploaded={(files) => {
            if (files[0]) {
              setLogo(files[0].url);
            }
          }}
          onUploadingChange={setIsUploading}
          render={({
            error: uploadError,
            getInputProps,
            getRootProps,
            isDragActive,
            isDragReject,
            isUploading: isLogoUploading,
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
                  "group/preview relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl border-2 bg-white text-slate-400 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-500",
                  !logo &&
                    "border-dashed border-slate-300 dark:border-slate-600",
                )}
              >
                {logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt="Organization logo preview"
                    className="size-full object-cover"
                    src={logo}
                  />
                ) : (
                  <Building2 className="size-7" />
                )}
                {logo && (
                  <button
                    aria-label="Remove organization logo"
                    className="absolute right-1 top-1 grid size-5 place-items-center rounded-full border border-slate-200 bg-white/95 text-slate-600 shadow-sm transition hover:text-red-600 focus-visible:opacity-100 sm:opacity-0 sm:group-hover/preview:opacity-100 dark:border-white/15 dark:bg-slate-900/90 dark:text-slate-300"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setLogo("");
                    }}
                    type="button"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <Button
                  disabled={isLogoUploading}
                  onClick={open}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  {isLogoUploading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ImagePlus className="size-4" />
                  )}
                  {isLogoUploading
                    ? "Uploading…"
                    : logo
                      ? "Change logo"
                      : "Upload logo"}
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

        <form className="mt-8" onSubmit={createOrganization}>
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="organizationName">Organization name</Label>
              <Input
                autoComplete="organization"
                autoFocus
                id="organizationName"
                maxLength={50}
                onChange={(event) => updateName(event.target.value)}
                placeholder="Acme Studio"
                required
                value={name}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="organizationSlug">Workspace address</Label>
                <span className="text-xs tabular-nums text-slate-400">
                  {slug.length}/{ORGANIZATION_SLUG_MAX_LENGTH}
                </span>
              </div>
              <Input
                aria-describedby="organizationSlugHelp"
                aria-invalid={Boolean(validationError)}
                id="organizationSlug"
                maxLength={ORGANIZATION_SLUG_MAX_LENGTH}
                onBlur={() => setSlug(finalizeSlug(slug))}
                onChange={(event) => updateSlug(event.target.value)}
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                placeholder="acme-studio"
                required
                spellCheck={false}
                value={slug}
              />
              <p
                className="text-xs leading-5 text-slate-500 dark:text-slate-400"
                id="organizationSlugHelp"
              >
                formflow.app/{slug || "your-workspace"} · lowercase letters,
                numbers, and hyphens
              </p>
            </div>
          </div>

          {(validationError || error) && (
            <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
              {validationError ?? error?.message}
            </p>
          )}

          <div className="mt-8 flex justify-end border-t border-slate-200 pt-6 dark:border-white/10">
            <Button disabled={isMutating || isUploading} size="lg" type="submit">
              {isMutating || isUploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ArrowRight className="size-4" />
              )}
              Create organization
            </Button>
          </div>
        </form>
      </section>
    </OnboardingFrame>
  );
}
