"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { ChevronDown, ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { FilePicker } from "@/modules/shared/components/file-upload";
import { Button } from "@/modules/shared/components/ui/button";
import { Input } from "@/modules/shared/components/ui/input";
import { Label } from "@/modules/shared/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/modules/shared/components/ui/popover";
import { Textarea } from "@/modules/shared/components/ui/textarea";
import API from "@/router";
import {
  ORGANIZATION_PRIMARY_COLORS,
  getOrganizationColorSwatch,
} from "@/lib/organization";
import type { OrganizationSummary } from "@/router/orgs/types";

const ORGANIZATION_LOGO_ACCEPT = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
};

export function OrganizationGeneralSettings({
  organization,
}: {
  organization: OrganizationSummary;
}) {
  const [name, setName] = useState(organization.name);
  const [logo, setLogo] = useState(organization.logo);
  const [primaryColor, setPrimaryColor] = useState(organization.primaryColor);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [slogan, setSlogan] = useState(organization.slogan ?? "");
  const [shortDescription, setShortDescription] = useState(organization.shortDescription ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const { trigger, isMutating } = API.orgs.useUpdateBySlug({
    organizationSlug: organization.slug,
  });
  const isDirty =
    name.trim() !== organization.name ||
    logo !== organization.logo ||
    primaryColor !== organization.primaryColor ||
    slogan.trim() !== (organization.slogan ?? "") ||
    shortDescription.trim() !== (organization.shortDescription ?? "");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      toast.error("Organization name is required.");
      return;
    }

    try {
      const updated = await trigger({
        name: name.trim(),
        logo,
        primaryColor,
        slogan: slogan.trim(),
        shortDescription: shortDescription.trim(),
      });
      setName(updated.name);
      setLogo(updated.logo);
      setPrimaryColor(updated.primaryColor);
      setSlogan(updated.slogan);
      setShortDescription(updated.shortDescription);
      toast.success("Organization settings saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save settings.");
    }
  }

  return (
    <form className="rounded-xl border border-border bg-card p-5 sm:p-6" onSubmit={save}>
      <div className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-[9rem_minmax(0,1fr)]">
          <FilePicker
            accept={ORGANIZATION_LOGO_ACCEPT}
            disabled={isMutating}
            maxFiles={1}
            onFilesUploaded={(files) => {
              if (files[0]) setLogo(files[0].url);
            }}
            onUploadError={(message) => toast.error(message)}
            onUploadingChange={setIsUploading}
            organizationSlug={organization.slug}
            render={({
              getInputProps,
              getRootProps,
              isDragActive,
              isDragReject,
              isUploading: uploading,
              open,
            }) => (
              <div
                {...getRootProps({
                  tabIndex: -1,
                  className: cn(
                    "relative size-36 overflow-hidden rounded-xl border border-border bg-muted/30 transition-colors hover:border-primary-400",
                    isDragActive &&
                      !isDragReject &&
                      "border-primary-500 bg-primary-50/50 dark:bg-primary-950/20",
                    isDragReject && "border-destructive",
                  ),
                })}
              >
                <input {...getInputProps()} />
                <button
                  aria-label={logo ? "Replace organization logo" : "Upload organization logo"}
                  className="grid size-full cursor-pointer place-items-center text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring disabled:cursor-not-allowed"
                  disabled={uploading || isMutating}
                  onClick={open}
                  type="button"
                >
                  {uploading ? (
                    <Loader2 className="size-6 animate-spin" />
                  ) : logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img alt="" className="size-full object-contain" src={logo} />
                  ) : (
                    <ImagePlus className="size-7" />
                  )}
                </button>
                {logo && (
                  <button
                    aria-label="Remove organization logo"
                    className="absolute right-2 top-2 grid size-7 cursor-pointer place-items-center rounded-full border border-border bg-background/95 text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed"
                    disabled={uploading || isMutating}
                    onClick={() => setLogo("")}
                    title="Remove logo"
                    type="button"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            )}
          />
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="organization-settings-name">Organization name</Label>
              <Input
                autoComplete="organization"
                id="organization-settings-name"
                maxLength={50}
                onChange={(event) => setName(event.target.value)}
                required
                value={name}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organization-settings-slug">Slug</Label>
              <Input disabled id="organization-settings-slug" value={organization.slug} />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="organization-settings-slogan">Slogan</Label>
          <Input
            id="organization-settings-slogan"
            maxLength={120}
            onChange={(event) => setSlogan(event.target.value)}
            placeholder="A short line about your organization"
            value={slogan}
          />
          <p className="text-xs text-muted-foreground">{slogan.length}/120 characters</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="organization-settings-description">Description</Label>
          <Textarea
            id="organization-settings-description"
            maxLength={500}
            onChange={(event) => setShortDescription(event.target.value)}
            placeholder="What does your organization do?"
            rows={4}
            value={shortDescription}
          />
          <p className="text-xs text-muted-foreground">{shortDescription.length}/500 characters</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="organization-settings-color">Primary color</Label>
          <Popover open={isColorPickerOpen} onOpenChange={setIsColorPickerOpen}>
            <PopoverTrigger asChild>
              <Button
                className="w-44 justify-between capitalize"
                id="organization-settings-color"
                type="button"
                variant="outline"
              >
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="size-4 rounded-full border border-black/10"
                    style={{ backgroundColor: getOrganizationColorSwatch(primaryColor) }}
                  />
                  {primaryColor}
                </span>
                <ChevronDown className="size-4 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" aria-label="Choose primary color" className="w-64 p-3">
              <div className="grid grid-cols-5 justify-items-center gap-2">
                {ORGANIZATION_PRIMARY_COLORS.map((color) => (
                  <button
                    aria-label={color}
                    aria-pressed={primaryColor === color}
                    className={cn(
                      "size-9 cursor-pointer rounded-full border border-black/10 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover",
                      primaryColor === color &&
                        "ring-2 ring-primary ring-offset-2 ring-offset-popover",
                    )}
                    key={color}
                    onClick={() => {
                      setPrimaryColor(color);
                      setIsColorPickerOpen(false);
                    }}
                    style={{ backgroundColor: getOrganizationColorSwatch(color) }}
                    title={color[0].toUpperCase() + color.slice(1)}
                    type="button"
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="mt-6 flex justify-end border-t border-border pt-5">
        <Button disabled={!isDirty || isMutating || isUploading} type="submit">
          {isMutating && <Loader2 className="size-4 animate-spin" />}
          Save changes
        </Button>
      </div>
    </form>
  );
}
