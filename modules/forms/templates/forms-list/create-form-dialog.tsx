"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import API from "@/router";
import { toApiError } from "@/lib/api-error";
import { organizationWorkspacePath } from "@/modules/organizations";
import { Button } from "@/modules/shared/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/modules/shared/components/ui/dialog";
import { Input } from "@/modules/shared/components/ui/input";
import { Label } from "@/modules/shared/components/ui/label";

export function CreateFormDialog({ open, onOpenChange, organizationSlug }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationSlug: string;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const { trigger, isMutating } = API.orgs.forms.useCreateOne({ organizationSlug });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || isMutating) return;

    try {
      const form = await trigger(trimmedName);
      onOpenChange(false);
      setName("");
      router.push(organizationWorkspacePath(organizationSlug, `/forms/${form.id}/builder`));
    } catch (error) {
      toast.error(toApiError(error).message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!isMutating) onOpenChange(nextOpen); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create form</DialogTitle>
          <DialogDescription>Give your form a name to get started.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="form-name">Form name</Label>
            <Input id="form-name" autoFocus required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} placeholder="Customer feedback" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={isMutating} onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!name.trim() || isMutating}>{isMutating ? "Creating…" : "Create form"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
