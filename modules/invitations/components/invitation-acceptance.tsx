"use client";

import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/modules/shared/components/ui/button";
import API from "@/router";

export function InvitationAcceptance({ token }: { token: string }) {
  const router = useRouter();
  const { invitation, error, isLoading } = API.invitations.useInvitation(token);
  const { trigger: accept, isMutating } = API.invitations.useAcceptInvitation(token);

  async function acceptInvitation() {
    try {
      const result = await accept();
      toast.success("Invitation accepted.");
      router.replace(`/orgs/${result.organizationSlug}/dashboard`);
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Could not accept this invitation.");
    }
  }

  async function switchAccount() {
    try {
      const result = await API.auth.signOut();
      if (result.error) throw result.error;
      router.replace(`/sign-in?next=${encodeURIComponent(`/invitations/${token}`)}`);
    } catch {
      toast.error("Could not sign out. Please try again.");
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-center shadow-sm">
        {isLoading ? (
          <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Loading invitation…
          </p>
        ) : error || !invitation ? (
          <>
            <h1 className="text-xl font-semibold">Invitation unavailable</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This link may have expired, or you may need to sign in with the invited email.
            </p>
            {error?.status === 403 && (
              <Button className="mt-5" onClick={() => void switchAccount()} type="button" variant="outline">
                Sign in with invited email
              </Button>
            )}
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold">Join {invitation.organizationName}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              You were invited as {invitation.role === "ADMIN" ? "an admin" : "a manager"} using {invitation.email}.
            </p>
            <Button className="mt-6 w-full" disabled={isMutating} onClick={() => void acceptInvitation()} type="button">
              {isMutating && <Loader2 className="size-4 animate-spin" />}
              Accept invitation
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
