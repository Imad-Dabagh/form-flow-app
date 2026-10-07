"use client";

import { useState, type FormEvent } from "react";
import { Globe2, LayoutGrid, ListOrdered, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import API from "@/router";
import type { FormDisplayMode, FormType, OrganizationForm } from "@/router/orgs/forms";
import { toApiError } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import { Button } from "@/modules/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/modules/shared/components/ui/dialog";
import { Input } from "@/modules/shared/components/ui/input";
import { Label } from "@/modules/shared/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/modules/shared/components/ui/radio-group";
import { Switch } from "@/modules/shared/components/ui/switch";

export function CreateFormModal({
  open,
  onOpenChange,
  organizationSlug,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationSlug: string;
  onCreated: (form: OrganizationForm) => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<FormType>("AUTHENTICATED");
  const [displayMode, setDisplayMode] = useState<FormDisplayMode>("SINGLE_PAGE");
  const [isClosed, setIsClosed] = useState(false);
  const create = API.orgs.forms.useCreateOne({ organizationSlug });
  const isMutating = create.isMutating;
  const submitLabel = isMutating ? "Creating…" : "Create form";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || isMutating) return;

    try {
      const created = await create.trigger({
        name: trimmedName,
        type,
        displayMode,
        isClosed,
      });
      onCreated(created);
    } catch (error) {
      toast.error(toApiError(error).message);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isMutating) onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="w-[calc(100%-2rem)] max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create form</DialogTitle>
          <DialogDescription>
            Set the form name, submission access, and display options.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="form-name">Form name</Label>
            <Input
              id="form-name"
              autoFocus
              required
              maxLength={100}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Customer feedback"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Who can respond</p>
            <RadioGroup
              aria-label="Who can respond"
              className="grid grid-cols-2 gap-3"
              value={type}
              onValueChange={(value) => setType(value as FormType)}
            >
              <Label
                htmlFor="form-type-authenticated"
                className={cn(
                  "group flex cursor-pointer items-center gap-3 rounded-xl border bg-card p-3 font-normal shadow-sm transition-[border-color,background-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md active:translate-y-0 focus-within:ring-2 focus-within:ring-ring",
                  type === "AUTHENTICATED" && "border-primary bg-primary/5",
                )}
              >
                <span
                  className={cn(
                    "hidden size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground sm:flex",
                    type === "AUTHENTICATED" && "bg-primary/10 text-primary",
                  )}
                >
                  <LockKeyhole className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1 space-y-1">
                  <span className="block text-sm font-semibold">Requires sign-in</span>
                  <span className="hidden text-xs leading-relaxed text-muted-foreground sm:block">
                    Users sign in before submitting.
                  </span>
                </span>
                <RadioGroupItem
                  id="form-type-authenticated"
                  value="AUTHENTICATED"
                  className="shrink-0"
                />
              </Label>
              <Label
                htmlFor="form-type-public"
                className={cn(
                  "group flex cursor-pointer items-center gap-3 rounded-xl border bg-card p-3 font-normal shadow-sm transition-[border-color,background-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md active:translate-y-0 focus-within:ring-2 focus-within:ring-ring",
                  type === "PUBLIC" && "border-primary bg-primary/5",
                )}
              >
                <span
                  className={cn(
                    "hidden size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground sm:flex",
                    type === "PUBLIC" && "bg-primary/10 text-primary",
                  )}
                >
                  <Globe2 className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1 space-y-1">
                  <span className="block text-sm font-semibold">Public</span>
                  <span className="hidden text-xs leading-relaxed text-muted-foreground sm:block">
                    Anyone with the link can respond.
                  </span>
                </span>
                <RadioGroupItem id="form-type-public" value="PUBLIC" className="shrink-0" />
              </Label>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Display mode</p>
            <RadioGroup
              aria-label="Display mode"
              className="grid grid-cols-2 gap-3"
              value={displayMode}
              onValueChange={(value) => setDisplayMode(value as FormDisplayMode)}
            >
              <Label
                htmlFor="form-display-single"
                className={cn(
                  "group flex cursor-pointer items-center gap-3 rounded-xl border bg-card p-3 font-normal shadow-sm transition-[border-color,background-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md active:translate-y-0 focus-within:ring-2 focus-within:ring-ring",
                  displayMode === "SINGLE_PAGE" && "border-primary bg-primary/5",
                )}
              >
                <span
                  className={cn(
                    "hidden size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground sm:flex",
                    displayMode === "SINGLE_PAGE" && "bg-primary/10 text-primary",
                  )}
                >
                  <LayoutGrid className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1 space-y-1">
                  <span className="block text-sm font-semibold">Single page</span>
                  <span className="hidden text-xs leading-relaxed text-muted-foreground sm:block">
                    Show all sections together.
                  </span>
                </span>
                <RadioGroupItem
                  id="form-display-single"
                  value="SINGLE_PAGE"
                  className="shrink-0"
                />
              </Label>
              <Label
                htmlFor="form-display-wizard"
                className={cn(
                  "group flex cursor-pointer items-center gap-3 rounded-xl border bg-card p-3 font-normal shadow-sm transition-[border-color,background-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md active:translate-y-0 focus-within:ring-2 focus-within:ring-ring",
                  displayMode === "WIZARD" && "border-primary bg-primary/5",
                )}
              >
                <span
                  className={cn(
                    "hidden size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground sm:flex",
                    displayMode === "WIZARD" && "bg-primary/10 text-primary",
                  )}
                >
                  <ListOrdered className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1 space-y-1">
                  <span className="block text-sm font-semibold">Step by step</span>
                  <span className="hidden text-xs leading-relaxed text-muted-foreground sm:block">
                    Show one section at a time.
                  </span>
                </span>
                <RadioGroupItem id="form-display-wizard" value="WIZARD" className="shrink-0" />
              </Label>
            </RadioGroup>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-md border px-3 py-3">
            <div className="space-y-0.5">
              <Label htmlFor="form-closed">Close form</Label>
              <p className="text-xs text-muted-foreground">
                Closed forms stop accepting submissions.
              </p>
            </div>
            <Switch id="form-closed" checked={isClosed} onCheckedChange={setIsClosed} />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isMutating}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isMutating}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
