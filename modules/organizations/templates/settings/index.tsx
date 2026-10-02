"use client";

import Link from "next/link";
import { Button } from "@/modules/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/modules/shared/components/ui/tabs";
import {
  WorkspacePage,
  PageNavigation,
  PageBreadcrumbs,
} from "@/modules/shared/components/workspace";
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
  const breadcrumbs = (
    <PageBreadcrumbs
      items={[
        {
          label: organization.name,
          href: organizationWorkspacePath(organization.slug, "/dashboard"),
        },
        { label: "Organization settings" },
      ]}
    />
  );

  if (!canManageOrganization) {
    return (
      <WorkspacePage>
        <PageNavigation title="Organization settings">{breadcrumbs}</PageNavigation>
        <div>
          <p className="text-sm text-muted-foreground">Organization settings are restricted.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Only organization administrators and platform administrators can view its settings.
          </p>
          <Button asChild className="mt-5" variant="outline">
            <Link href={organizationWorkspacePath(organization.slug, "/dashboard")}>
              Back to overview
            </Link>
          </Button>
        </div>
      </WorkspacePage>
    );
  }

  return (
    <WorkspacePage>
      <PageNavigation title="Organization settings">{breadcrumbs}</PageNavigation>

      <Tabs className="min-w-0 gap-6" defaultValue="general">
        <TabsList
          aria-label="Organization settings sections"
          className="h-10 max-w-full [&_[data-slot=tabs-trigger]]:px-2 sm:[&_[data-slot=tabs-trigger]]:px-4"
        >
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
    </WorkspacePage>
  );
}
