"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
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
import { Badge } from "@/modules/shared/components/ui/badge";
import { Button, buttonVariants } from "@/modules/shared/components/ui/button";
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
import type { OrganizationInvitation } from "@/router/orgs/types";
import { OrganizationAddMemberDialog } from "../../components/organization-add-member-dialog";
import { useOrganizationWorkspace } from "../../organization-workspace-context";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function OrganizationInvitations() {
  const organization = useOrganizationWorkspace();
  const { invitations, error, isLoading, mutate } = API.orgs.invitations.useFindAll({
    organizationSlug: organization.slug,
  });
  const { trigger: addMember, isMutating: isReinviting } = API.orgs.members.useCreateOne({
    organizationSlug: organization.slug,
  });
  const [reinvitingId, setReinvitingId] = useState<string | null>(null);
  const [canceling, setCanceling] = useState<OrganizationInvitation | null>(null);
  const { trigger: cancelInvitation, isMutating: isCanceling } = API.orgs.invitations.useDeleteById(
    {
      organizationSlug: organization.slug,
      invitationId: canceling?.id ?? "",
    },
  );
  const activeCount = invitations.filter((invitation) => invitation.status === "PENDING").length;
  const expiredCount = invitations.length - activeCount;

  async function reinvite(invitation: OrganizationInvitation) {
    setReinvitingId(invitation.id);
    try {
      const result = await addMember({ email: invitation.email, role: invitation.role });
      toast.success(
        result.kind === "member" ? "Person added to the team." : "Invitation sent again.",
      );
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Could not send the invitation.");
    } finally {
      setReinvitingId(null);
    }
  }

  async function confirmCancel() {
    if (!canceling) return;
    try {
      await cancelInvitation();
      toast.success("Invitation canceled.");
      setCanceling(null);
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Could not cancel the invitation.");
    }
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
          <span className="text-sm text-muted-foreground">
            {isLoading ? "Invitations" : `${activeCount} active · ${expiredCount} expired`}
          </span>
          <OrganizationAddMemberDialog />
        </div>
        <Table className="min-w-[750px]" aria-label="Organization invitations">
          <TableHeader>
            <TableRow>
              <TableHead className="pl-5">Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="pr-5 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [0, 1, 2].map((row) => (
                <TableRow key={row}>
                  <TableCell className="pl-5">
                    <Skeleton className="h-5 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell className="pr-5">
                    <Skeleton className="ml-auto h-8 w-20" />
                  </TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell className="py-8 text-center" colSpan={6}>
                  <p className="text-sm text-muted-foreground">Could not load invitations.</p>
                  <Button
                    className="mt-3"
                    onClick={() => void mutate()}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    Try again
                  </Button>
                </TableCell>
              </TableRow>
            ) : invitations.length === 0 ? (
              <TableRow>
                <TableCell className="py-8 text-center text-sm text-muted-foreground" colSpan={6}>
                  No active or expired invitations.
                </TableCell>
              </TableRow>
            ) : (
              invitations.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell className="pl-5 font-medium">{invitation.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {invitation.role === "ADMIN" ? "Admin" : "Manager"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={invitation.status === "PENDING" ? "default" : "outline"}>
                      {invitation.status === "PENDING" ? "Pending" : "Expired"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <time dateTime={invitation.createdAt}>{formatDate(invitation.createdAt)}</time>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <time dateTime={invitation.expiresAt}>{formatDate(invitation.expiresAt)}</time>
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    {invitation.status === "PENDING" ? (
                      <Button
                        onClick={() => setCanceling(invitation)}
                        size="sm"
                        type="button"
                        variant="ghost"
                      >
                        Cancel
                      </Button>
                    ) : (
                      <Button
                        disabled={isReinviting}
                        onClick={() => void reinvite(invitation)}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        {reinvitingId === invitation.id && (
                          <Loader2 className="size-4 animate-spin" />
                        )}
                        Invite again
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) setCanceling(null);
        }}
        open={Boolean(canceling)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel invitation?</AlertDialogTitle>
            <AlertDialogDescription>
              {canceling
                ? `${canceling.email} will no longer be able to use their invitation link.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCanceling}>Keep invitation</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              disabled={isCanceling}
              onClick={(event) => {
                event.preventDefault();
                void confirmCancel();
              }}
            >
              {isCanceling && <Loader2 className="size-4 animate-spin" />}
              Cancel invitation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
