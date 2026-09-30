"use client";

import Link from "next/link";
import { Button } from "@/modules/shared/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/modules/shared/components/ui/tabs";
import { organizationWorkspacePath } from "../../paths";
import { OrganizationGeneralSettings } from "../../patterns/general-settings";
import { OrganizationInvitations } from "../../patterns/invitations";
import { OrganizationTeamMembers } from "../../patterns/team-members";
import { useOrganizationWorkspace } from "../../organization-workspace-context";
import { useOrganizationPermissions } from "../../use-organization-permissions";

const activeTabClass =
  "data-[state=active]:bg-primary-500 data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-primary-500 dark:data-[state=active]:text-primary-foreground";

export function OrganizationSettingsTemplate() {
  const organization = useOrganizationWorkspace();
  const { canManageOrganization } = useOrganizationPermissions();

  if (!canManageOrganization) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center">
        <h1 className="text-xl font-semibold">Organization settings are restricted</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Only organization administrators and platform administrators can view its settings.
        </p>
        <Button asChild className="mt-5" variant="outline">
          <Link href={organizationWorkspacePath(organization.slug, "/dashboard")}>
            Back to overview
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[69rem] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
        Organization settings
      </h1>

      <Tabs className="mt-5 max-w-3xl gap-4" defaultValue="general">
        <TabsList aria-label="Organization settings sections" className="h-10">
          <TabsTrigger className={activeTabClass} value="general">
            General
          </TabsTrigger>
          <TabsTrigger className={activeTabClass} value="team-members">
            Team Members
          </TabsTrigger>
          <TabsTrigger className={activeTabClass} value="invitations">
            Invitations
          </TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <OrganizationGeneralSettings key={organization.id} organization={organization} />
        </TabsContent>
        <TabsContent value="team-members">
          <OrganizationTeamMembers />
        </TabsContent>
        <TabsContent value="invitations">
          <OrganizationInvitations />
        </TabsContent>
      </Tabs>
    </div>
  );
}
