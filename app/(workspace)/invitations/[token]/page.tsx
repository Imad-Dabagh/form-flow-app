import { InvitationAcceptance } from "@/modules/invitations/components/invitation-acceptance";

export default async function InvitationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <InvitationAcceptance token={token} />;
}
