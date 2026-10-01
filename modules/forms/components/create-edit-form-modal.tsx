"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import API from "@/router";
import type { FormDisplayMode, FormType, OrganizationForm } from "@/router/orgs/forms";
import { toApiError } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import { organizationWorkspacePath } from "@/modules/organizations";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/shared/components/ui/select";
import { Switch } from "@/modules/shared/components/ui/switch";

export function CreateEditFormModal({
  open,
  onOpenChange,
  organizationSlug,
  form,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationSlug: string;
  form?: OrganizationForm;
}) {
  const router = useRouter();
  const isEditing = Boolean(form);
  const [name, setName] = useState(form?.name ?? "");
  const [type, setType] = useState<FormType>(form?.type ?? "AUTHENTICATED");
  const [displayMode, setDisplayMode] = useState<FormDisplayMode>(
    form?.displayMode ?? "SINGLE_PAGE",
  );
  const [isClosed, setIsClosed] = useState(form?.isClosed ?? false);
  const create = API.orgs.forms.useCreateOne({ organizationSlug });
  const update = API.orgs.forms.settings.useUpdateById({
    organizationSlug,
    formId: form?.id ?? "",
  });
  const isMutating = isEditing ? update.isMutating : create.isMutating;
  const submitLabel = isMutating
    ? isEditing ? "Saving…" : "Creating…"
    : isEditing ? "Save settings" : "Create form";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || isMutating) return;

    try {
      if (form) {
        await update.trigger({ name: trimmedName, type, displayMode, isClosed });
        onOpenChange(false);
        toast.success("Form settings saved");
      } else {
        const created = await create.trigger({
          name: trimmedName,
          type,
          displayMode,
          isClosed,
        });
        onOpenChange(false);
        router.push(organizationWorkspacePath(organizationSlug, `/forms/${created.id}/builder`));
      }
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
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit form" : "Create form"}</DialogTitle>
          <DialogDescription>
            Set the form name, response access, and display options.
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
                  "flex h-full min-h-28 cursor-pointer items-start gap-2 rounded-lg border p-3 font-normal transition-colors hover:bg-muted/50",
                  type === "AUTHENTICATED" && "border-primary bg-primary/5",
                )}
              >
                <RadioGroupItem
                  id="form-type-authenticated"
                  value="AUTHENTICATED"
                  className="mt-0.5"
                />
                <span className="min-w-0 space-y-1">
                  <span className="block text-sm font-medium">Requires sign-in</span>
                  <span className="block text-xs text-muted-foreground">
                    Respondents use their account.
                  </span>
                </span>
              </Label>
              <Label
                htmlFor="form-type-public"
                className={cn(
                  "flex h-full min-h-28 cursor-pointer items-start gap-2 rounded-lg border p-3 font-normal transition-colors hover:bg-muted/50",
                  type === "PUBLIC" && "border-primary bg-primary/5",
                )}
              >
                <RadioGroupItem id="form-type-public" value="PUBLIC" className="mt-0.5" />
                <span className="min-w-0 space-y-1">
                  <span className="block text-sm font-medium">Public</span>
                  <span className="block text-xs text-muted-foreground">
                    Anyone with the link can respond.
                  </span>
                </span>
              </Label>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="form-display-mode">Display mode</Label>
            <Select
              value={displayMode}
              onValueChange={(value) => setDisplayMode(value as FormDisplayMode)}
            >
              <SelectTrigger id="form-display-mode" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SINGLE_PAGE">Single page</SelectItem>
                <SelectItem value="WIZARD">Step by step</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Show every section together or one section at a time.
            </p>
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
