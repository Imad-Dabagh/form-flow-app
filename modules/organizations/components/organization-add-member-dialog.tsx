"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/modules/shared/components/ui/avatar";
import { Button } from "@/modules/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/modules/shared/components/ui/dialog";
import { Input } from "@/modules/shared/components/ui/input";
import { Label } from "@/modules/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/shared/components/ui/select";
import API from "@/router";
import type { OrganizationTeamRole } from "@/router/orgs/types";
import { useOrganizationWorkspace } from "../organization-workspace-context";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function OrganizationAddMemberDialog() {
  const organization = useOrganizationWorkspace();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [lookupEmail, setLookupEmail] = useState("");
  const [role, setRole] = useState<OrganizationTeamRole>("MANAGER");
  const normalizedEmail = email.trim().toLowerCase();

  useEffect(() => {
    if (!open || !EMAIL_PATTERN.test(normalizedEmail) || normalizedEmail.length > 254) {
      setLookupEmail("");
      return;
    }
    const timeout = window.setTimeout(() => setLookupEmail(normalizedEmail), 350);
    return () => window.clearTimeout(timeout);
  }, [normalizedEmail, open]);

  const { lookup, error, isLoading, mutate } = API.orgs.members.useFindByEmail({
    organizationSlug: organization.slug,
    email: lookupEmail,
  });
  const { trigger: addMember, isMutating } = API.orgs.members.useCreateOne({
    organizationSlug: organization.slug,
  });
  const currentLookup =
    lookup?.email === normalizedEmail && lookupEmail === normalizedEmail ? lookup : null;
  const alreadyOnTeam =
    currentLookup?.kind === "existing" &&
    (currentLookup.currentRole === "ADMIN" || currentLookup.currentRole === "MANAGER");
  const alreadyInvited = currentLookup?.kind === "pending";

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setEmail("");
      setLookupEmail("");
      setRole("MANAGER");
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentLookup || alreadyOnTeam || alreadyInvited) return;

    try {
      const result = await addMember({ email: normalizedEmail, role });
      toast.success(result.kind === "member" ? "Team member added." : "Invitation sent.");
      handleOpenChange(false);
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Could not add this member.");
    }
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger asChild>
        <Button size="sm" type="button">
          <Plus className="size-4" />
          Add member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add team member</DialogTitle>
          <DialogDescription>
            Give an existing account access, or invite someone by email.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="team-member-email">Email</Label>
            <Input
              autoComplete="email"
              id="team-member-email"
              maxLength={254}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              required
              type="email"
              value={email}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="team-member-role">Role</Label>
            <Select onValueChange={(value) => setRole(value as OrganizationTeamRole)} value={role}>
              <SelectTrigger className="w-full" id="team-member-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MANAGER">Manager</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {lookupEmail === normalizedEmail && isLoading && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Checking email…
            </p>
          )}
          {lookupEmail === normalizedEmail && error && (
            <div className="flex items-center justify-between gap-3 text-sm text-destructive">
              <span>Could not check this email.</span>
              <Button onClick={() => void mutate()} size="sm" type="button" variant="outline">
                Retry
              </Button>
            </div>
          )}
          {currentLookup?.kind === "existing" && (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
              <Avatar className="size-9">
                {currentLookup.profilePic && <AvatarImage alt="" src={currentLookup.profilePic} />}
                <AvatarFallback className="text-xs">
                  {currentLookup.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{currentLookup.name}</p>
                <p className="truncate text-xs text-muted-foreground">{currentLookup.email}</p>
              </div>
              {alreadyOnTeam && (
                <span className="ml-auto text-xs text-muted-foreground">Already on team</span>
              )}
            </div>
          )}
          {currentLookup?.kind === "invite" && (
            <p className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
              No verified account found. We’ll send an invitation to {currentLookup.email}.
            </p>
          )}
          {currentLookup?.kind === "pending" && (
            <p className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
              An invitation is already pending for {currentLookup.email}.
            </p>
          )}

          <DialogFooter>
            <Button onClick={() => handleOpenChange(false)} type="button" variant="outline">
              Cancel
            </Button>
            <Button
              disabled={!currentLookup || alreadyOnTeam || alreadyInvited || isMutating}
              type="submit"
            >
              {isMutating && <Loader2 className="size-4 animate-spin" />}
              {currentLookup?.kind === "invite" ? "Send invite" : "Add member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
