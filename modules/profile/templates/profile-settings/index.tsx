"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { ImagePlus, Loader2, UserRound, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCurrentProfileContext } from "../../current-profile-context";
import { FilePicker, IMAGE_FILE_ACCEPT } from "@/modules/shared/components/file-upload/file-picker";
import { Avatar, AvatarFallback, AvatarImage } from "@/modules/shared/components/ui/avatar";
import { Button } from "@/modules/shared/components/ui/button";
import { Input } from "@/modules/shared/components/ui/input";
import { Label } from "@/modules/shared/components/ui/label";
import { Textarea } from "@/modules/shared/components/ui/textarea";
import API from "@/router";

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U";
}

export function ProfileSettingsTemplate() {
  const profile = useCurrentProfileContext();
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [profilePic, setProfilePic] = useState(profile.profilePic);
  const [coverPhoto, setCoverPhoto] = useState(profile.coverPhoto ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [shortDescription, setShortDescription] = useState(profile.shortDescription ?? "");
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const { trigger: updateProfile, isMutating } = API.me.useUpdateOne();
  const isUploading = isPhotoUploading || isCoverUploading;
  const isDirty =
    firstName.trim() !== profile.firstName ||
    lastName.trim() !== profile.lastName ||
    profilePic !== profile.profilePic ||
    coverPhoto !== (profile.coverPhoto ?? "") ||
    phone.trim() !== (profile.phone ?? "") ||
    shortDescription.trim() !== (profile.shortDescription ?? "");

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First and last name are required.");
      return;
    }

    try {
      const updated = await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        profilePic,
        coverPhoto,
        phone: phone.trim(),
        shortDescription: shortDescription.trim(),
      });
      setFirstName(updated.firstName);
      setLastName(updated.lastName);
      setProfilePic(updated.profilePic);
      setCoverPhoto(updated.coverPhoto ?? "");
      setPhone(updated.phone ?? "");
      setShortDescription(updated.shortDescription ?? "");
      toast.success("Profile saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save your profile.");
    }
  }

  return (
    <div className="w-full max-w-4xl px-4 py-6 mx-auto sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">Your profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Keep the details your teammates see up to date.
        </p>
      </div>

      <form className="space-y-6" onSubmit={saveProfile}>
        <section className="overflow-hidden border rounded-xl border-border bg-card">
          <FilePicker
            accept={IMAGE_FILE_ACCEPT}
            disabled={isMutating}
            maxFiles={1}
            onFilesUploaded={(files) => {
              if (files[0]) setCoverPhoto(files[0].url);
            }}
            onUploadError={(message) => toast.error(message)}
            onUploadingChange={setIsCoverUploading}
            render={({
              getInputProps,
              getRootProps,
              isDragActive,
              isDragReject,
              isUploading,
              open,
            }) => (
              <div
                {...getRootProps({
                  className: cn(
                    "relative h-44 bg-muted/70 sm:h-56",
                    isDragActive && !isDragReject && "ring-2 ring-inset ring-primary",
                    isDragReject && "ring-2 ring-inset ring-destructive",
                  ),
                })}
              >
                <input {...getInputProps()} />
                {coverPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt="Profile cover" className="object-cover size-full" src={coverPhoto} />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 size-full text-muted-foreground">
                    <ImagePlus className="size-7" />
                    <span className="text-sm">Add a cover photo</span>
                  </div>
                )}
                <div className="absolute flex gap-2 bottom-3 right-3">
                  <Button
                    disabled={isUploading || isMutating}
                    onClick={open}
                    size="sm"
                    type="button"
                    variant="secondary"
                  >
                    {isUploading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <ImagePlus className="size-4" />
                    )}
                    {coverPhoto ? "Change cover" : "Upload cover"}
                  </Button>
                  {coverPhoto && (
                    <Button
                      aria-label="Remove cover photo"
                      disabled={isUploading || isMutating}
                      onClick={() => setCoverPhoto("")}
                      size="icon-sm"
                      title="Remove cover photo"
                      type="button"
                      variant="secondary"
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          />

          <div className="flex flex-wrap items-end gap-4 px-5 pb-5 sm:px-6">
            <FilePicker
              accept={IMAGE_FILE_ACCEPT}
              disabled={isMutating}
              maxFiles={1}
              onFilesUploaded={(files) => {
                if (files[0]) setProfilePic(files[0].url);
              }}
              onUploadError={(message) => toast.error(message)}
              onUploadingChange={setIsPhotoUploading}
              render={({
                getInputProps,
                getRootProps,
                isDragActive,
                isDragReject,
                isUploading,
                open,
              }) => (
                <div
                  {...getRootProps({
                    className: cn(
                      "relative -mt-9 shrink-0 rounded-full",
                      isDragActive && !isDragReject && "ring-2 ring-primary",
                      isDragReject && "ring-2 ring-destructive",
                    ),
                  })}
                >
                  <input {...getInputProps()} />
                  <Avatar className="border-4 shadow-sm size-20 border-card bg-muted">
                    {profilePic && <AvatarImage alt="" className="object-cover" src={profilePic} />}
                    <AvatarFallback className="text-xl font-semibold">
                      {getInitials(firstName, lastName) === "U" ? (
                        <UserRound className="size-8" />
                      ) : (
                        getInitials(firstName, lastName)
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    aria-label={profilePic ? "Change profile photo" : "Upload profile photo"}
                    className="absolute rounded-full shadow-sm -bottom-1 -right-1"
                    disabled={isUploading || isMutating}
                    onClick={open}
                    size="icon-sm"
                    title={profilePic ? "Change profile photo" : "Upload profile photo"}
                    type="button"
                    variant="secondary"
                  >
                    {isUploading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <ImagePlus className="size-4" />
                    )}
                  </Button>
                </div>
              )}
            />
            <div className="flex-1 min-w-0 pb-1">
              <p className="font-semibold truncate">
                {[firstName, lastName].filter(Boolean).join(" ") || profile.email}
              </p>
              <p className="text-sm truncate text-muted-foreground">{profile.email}</p>
            </div>
            {profilePic && (
              <Button
                disabled={isPhotoUploading || isMutating}
                onClick={() => setProfilePic("")}
                size="sm"
                type="button"
                variant="ghost"
              >
                Remove photo
              </Button>
            )}
          </div>
        </section>

        <section className="p-5 border rounded-xl border-border bg-card sm:p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">Personal details</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your name and contact details across workspaces.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="profile-first-name">First name</Label>
              <Input
                autoComplete="given-name"
                id="profile-first-name"
                maxLength={50}
                onChange={(event) => setFirstName(event.target.value)}
                required
                value={firstName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-last-name">Last name</Label>
              <Input
                autoComplete="family-name"
                id="profile-last-name"
                maxLength={50}
                onChange={(event) => setLastName(event.target.value)}
                required
                value={lastName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email">Email address</Label>
              <Input
                className="disabled:bg-muted/40 disabled:opacity-100"
                disabled
                id="profile-email"
                type="email"
                value={profile.email}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-phone">Phone</Label>
              <Input
                autoComplete="tel"
                id="profile-phone"
                maxLength={30}
                onChange={(event) => setPhone(event.target.value)}
                // placeholder="+212 ..."
                type="tel"
                value={phone}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="profile-description">Short description</Label>
                <span className="text-xs text-muted-foreground">{shortDescription.length}/500</span>
              </div>
              <Textarea
                id="profile-description"
                maxLength={500}
                onChange={(event) => setShortDescription(event.target.value)}
                placeholder="A little about yourself"
                rows={4}
                value={shortDescription}
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <Button disabled={!isDirty || isMutating || isUploading} type="submit">
            {isMutating && <Loader2 className="size-4 animate-spin" />}
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}
