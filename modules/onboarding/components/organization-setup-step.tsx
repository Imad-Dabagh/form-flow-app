"use client";

import type { FormEvent } from "react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, ImagePlus, Loader2 } from "lucide-react";
import { organizationManagePath } from "@/modules/organizations";
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
  const [validationError, setValidationError] = useState<string | null>(null);
  const { trigger, error, isMutating } =
    API.organizations.useCreateOrganization();

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
      const organization = await trigger({ name: name.trim(), slug: finalSlug });
      router.replace(
        organizationManagePath(organization.slug, "/dashboard"),
      );
    } catch {
      // The mutation exposes the API error for the form to render.
    }
  }

  return (
    <OnboardingFrame
      description="Create the workspace where your team will build forms and manage responses. You can refine its branding later."
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

        <div className="mt-8 flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="grid size-16 shrink-0 place-items-center rounded-2xl border-2 border-dashed border-slate-300 bg-white text-slate-400 dark:border-slate-600 dark:bg-white/[0.03] dark:text-slate-500">
            <Building2 className="size-7" />
          </div>
          <div className="min-w-0 flex-1">
            <Button disabled size="sm" type="button" variant="outline">
              <ImagePlus className="size-4" />
              Upload logo
            </Button>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Optional · Uploads will be available soon
            </p>
          </div>
        </div>

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
            <Button disabled={isMutating} size="lg" type="submit">
              {isMutating ? (
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
