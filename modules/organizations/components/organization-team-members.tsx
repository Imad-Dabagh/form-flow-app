"use client";

import { useState } from "react";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { OrganizationTeamMember, OrganizationTeamRole } from "../types";
import { Avatar, AvatarFallback, AvatarImage } from "@/modules/shared/components/ui/avatar";
import { Badge } from "@/modules/shared/components/ui/badge";
import { Button, buttonVariants } from "@/modules/shared/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/modules/shared/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/modules/shared/components/ui/dialog";
import { Label } from "@/modules/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/shared/components/ui/select";
import { Skeleton } from "@/modules/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/modules/shared/components/ui/table";
import API from "@/router";
import { OrganizationAddMemberDialog } from "./organization-add-member-dialog";
import { useOrganizationWorkspace } from "./organization-workspace-boundary";

function formatJoinedAt(value: string): string {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function memberName(member: OrganizationTeamMember): string {
  return [member.firstName, member.lastName].filter(Boolean).join(" ") || member.email || "Unknown member";
}

export function OrganizationTeamMembers() {
  const organization = useOrganizationWorkspace();
  const { members, error, isLoading, mutate } = API.organizations.useOrganizationMembers(organization.slug);
  const [editing, setEditing] = useState<OrganizationTeamMember | null>(null);
  const [removing, setRemoving] = useState<OrganizationTeamMember | null>(null);
  const [draftRole, setDraftRole] = useState<OrganizationTeamRole>("MANAGER");
  const { trigger: updateRole, isMutating: isUpdating } = API.organizations.useUpdateOrganizationMember(
    organization.slug,
    editing?.id ?? "",
  );
  const { trigger: removeMember, isMutating: isRemoving } = API.organizations.useRemoveOrganizationMember(
    organization.slug,
    removing?.id ?? "",
  );
  const adminCount = members.filter((member) => member.role === "ADMIN").length;
  const editingLastAdmin = editing?.role === "ADMIN" && adminCount === 1 && draftRole !== "ADMIN";

  function openEdit(member: OrganizationTeamMember) {
    setEditing(member);
    setDraftRole(member.role);
  }

  async function saveRole() {
    if (!editing || editingLastAdmin || editing.role === draftRole) return;
    try {
      await updateRole(draftRole);
      toast.success("Member role updated.");
      setEditing(null);
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Could not update this role.");
    }
  }

  async function confirmRemove() {
    if (!removing) return;
    try {
      await removeMember();
      toast.success("Member removed from the organization.");
      setRemoving(null);
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Could not remove this member.");
    }
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
          <span className="text-sm text-muted-foreground">
            {isLoading ? "Team members" : `${members.length} ${members.length === 1 ? "member" : "members"}`}
          </span>
          <OrganizationAddMemberDialog />
        </div>
        <Table className="min-w-[580px]" aria-label="Team members">
          <TableHeader>
            <TableRow>
              <TableHead className="pl-5">Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined at</TableHead>
              <TableHead className="w-24 pr-5 text-right"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? [0, 1, 2].map((row) => (
              <TableRow key={row}>
                <TableCell className="pl-5"><Skeleton className="h-9 w-40" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell className="pr-5"><Skeleton className="ml-auto h-8 w-16" /></TableCell>
              </TableRow>
            )) : error ? (
              <TableRow>
                <TableCell className="py-8 text-center" colSpan={4}>
                  <p className="text-sm text-muted-foreground">Could not load team members.</p>
                  <Button className="mt-3" onClick={() => void mutate()} size="sm" type="button" variant="outline">Try again</Button>
                </TableCell>
              </TableRow>
            ) : members.length === 0 ? (
              <TableRow>
                <TableCell className="py-8 text-center text-sm text-muted-foreground" colSpan={4}>
                  No admins or managers in this organization yet.
                </TableCell>
              </TableRow>
            ) : members.map((member) => {
              const name = memberName(member);
              const isLastAdmin = member.role === "ADMIN" && adminCount === 1;
              return (
                <TableRow key={member.id}>
                  <TableCell className="pl-5">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="size-9">
                        {member.profilePic && <AvatarImage alt="" src={member.profilePic} />}
                        <AvatarFallback className="text-xs font-medium">{name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{name}</p>
                        {member.email && name !== member.email && (
                          <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="secondary">{member.role === "ADMIN" ? "Admin" : "Manager"}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">
                    <time dateTime={member.joinedAt}>{formatJoinedAt(member.joinedAt)}</time>
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    <div className="flex justify-end gap-1">
                      <Button aria-label={`Edit ${name}'s role`} onClick={() => openEdit(member)} size="icon-sm" title="Edit role" type="button" variant="ghost">
                        <Pencil className="size-4" />
                      </Button>
                      <Button aria-label={`Remove ${name}`} disabled={isLastAdmin} onClick={() => setRemoving(member)} size="icon-sm" title={isLastAdmin ? "At least one admin must remain" : "Remove member"} type="button" variant="ghost">
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog onOpenChange={(open) => { if (!open) setEditing(null); }} open={Boolean(editing)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit role</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{memberName(editing)}</p>
              <div className="space-y-2">
                <Label htmlFor="edit-team-member-role">Role</Label>
                <Select onValueChange={(value) => setDraftRole(value as OrganizationTeamRole)} value={draftRole}>
                  <SelectTrigger className="w-full" id="edit-team-member-role"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editingLastAdmin && (
                <p className="text-sm text-destructive">Add another admin before changing this role.</p>
              )}
              <DialogFooter>
                <Button onClick={() => setEditing(null)} type="button" variant="outline">Cancel</Button>
                <Button disabled={isUpdating || editingLastAdmin || editing.role === draftRole} onClick={() => void saveRole()} type="button">
                  {isUpdating && <Loader2 className="size-4 animate-spin" />}
                  Save role
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog onOpenChange={(open) => { if (!open) setRemoving(null); }} open={Boolean(removing)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove team member?</AlertDialogTitle>
            <AlertDialogDescription>
              {removing ? `${memberName(removing)} will lose access to this organization. Their account will remain available.` : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              disabled={isRemoving}
              onClick={(event) => { event.preventDefault(); void confirmRemove(); }}
            >
              {isRemoving && <Loader2 className="size-4 animate-spin" />}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
