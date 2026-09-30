import { InvitationAcceptanceTemplate } from "@/modules/invitations";

export default async function InvitationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <InvitationAcceptanceTemplate token={token} />;
}
