"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Check,
  ChevronDown,
  ChevronsUpDown,
  FileText,
  LayoutDashboard,
  LogOut,
  User,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthenticatedProfile } from "@/modules/auth";
import {
  organizationWorkspacePath,
  useOrganizationWorkspace,
  type OrganizationSummary,
} from "@/modules/organizations";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/modules/shared/components/ui/avatar";
import { Button } from "@/modules/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/modules/shared/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/modules/shared/components/ui/sidebar";
import API from "@/router";

function getInitials(firstName: string, lastName: string, email: string): string {
  const name = [firstName, lastName].filter(Boolean).join(" ") || email;

  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getOrganizationInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function OrganizationLogo({ organization }: { organization: OrganizationSummary }) {
  return (
    <Avatar className="size-7 shrink-0 rounded-md border border-border bg-background">
      {organization.logo && (
        <AvatarImage
          alt=""
          className="object-contain"
          src={organization.logo}
        />
      )}
      <AvatarFallback className="rounded-md bg-primary-100 text-[10px] font-bold text-primary-800">
        {getOrganizationInitials(organization.name)}
      </AvatarFallback>
    </Avatar>
  );
}

export function LeftSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const organization = useOrganizationWorkspace();
  const { organizations } = API.organizations.useOrganizations();
  const profile = useAuthenticatedProfile();
  const { isMobile, setOpenMobile, state } = useSidebar();
  const dashboardPath = organizationWorkspacePath(
    organization.slug,
    "/dashboard",
  );
  const formsPath = organizationWorkspacePath(organization.slug, "/forms");
  const navItems = [
    { href: dashboardPath, label: "Overview", icon: LayoutDashboard },
    { href: formsPath, label: "Forms", icon: FileText },
  ];
  const displayName =
    [profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
    profile.email;
  const initials = getInitials(
    profile.firstName,
    profile.lastName,
    profile.email,
  );

  async function handleLogout() {
    await API.auth.signOut();
    router.replace("/sign-in");
  }

  function closeMobileSidebar() {
    if (isMobile) setOpenMobile(false);
  }

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border bg-sidebar shadow-[8px_0_30px_rgba(15,23,42,0.04)]"
    >
      <SidebarHeader className="h-14 shrink-0 justify-center px-3 py-0 group-data-[collapsible=icon]:px-1">
        <div className="flex min-w-0 items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label={`Switch organization, current: ${organization.name}`}
                className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-sidebar-border bg-card/80 px-2 text-left text-sidebar-foreground shadow-xs transition-colors hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:flex-none group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                title={organization.name}
                type="button"
              >
                <OrganizationLogo organization={organization} />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold group-data-[collapsible=icon]:hidden">
                  {organization.name}
                </span>
                <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="max-h-72 min-w-56 overflow-y-auto"
              side={state === "collapsed" && !isMobile ? "right" : "bottom"}
              sideOffset={8}
            >
              {organizations.map((candidate) => (
                <DropdownMenuItem asChild key={candidate.id}>
                  <Link
                    aria-current={candidate.id === organization.id ? "page" : undefined}
                    className="flex items-center gap-2"
                    href={organizationWorkspacePath(candidate.slug, "/dashboard")}
                    onClick={closeMobileSidebar}
                  >
                    <OrganizationLogo organization={candidate} />
                    <span className="min-w-0 flex-1 truncate">{candidate.name}</span>
                    {candidate.id === organization.id && (
                      <Check className="size-4 shrink-0 text-primary-600" />
                    )}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            aria-label="Close navigation menu"
            className="size-11 shrink-0 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground md:hidden"
            onClick={() => setOpenMobile(false)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X className="size-4" />
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-5 group-data-[collapsible=icon]:px-1">
        <div className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden">
          Workspace
        </div>
        <SidebarMenu className="gap-1.5 group-data-[collapsible=icon]:items-center">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);

            return (
              <SidebarMenuItem
                className="w-full group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center"
                key={href}
              >
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  tooltip={label}
                  className={cn(
                    "h-11 gap-3 rounded-lg px-3 text-sm transition-[background-color,color,box-shadow] duration-200 group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:p-0!",
                    active
                      ? "bg-primary-500! font-semibold text-primary-foreground! shadow-sm hover:bg-primary-600! hover:text-primary-foreground!"
                      : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  )}
                >
                  <Link
                    aria-current={active ? "page" : undefined}
                    href={href}
                    onClick={closeMobileSidebar}
                  >
                    <Icon className="size-[18px]! shrink-0" />
                    <span className="min-w-0 truncate group-data-[collapsible=icon]:hidden">
                      {label}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3 group-data-[collapsible=icon]:p-1">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  asChild
                  className="group h-12 gap-3 rounded-lg px-2 group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0!"
                  tooltip={displayName}
                >
                  <button aria-label="Open profile menu" type="button">
                    <Avatar className="size-8 shrink-0 rounded-lg shadow-sm">
                      {profile.profilePic && (
                        <AvatarImage alt="" src={profile.profilePic} />
                      )}
                      <AvatarFallback className="rounded-lg bg-primary-500 text-xs font-bold text-primary-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                      <span className="block truncate text-sm font-semibold text-sidebar-foreground">
                        {displayName}
                      </span>
                      <span className="block truncate text-xs text-sidebar-foreground/60">
                        {profile.email}
                      </span>
                    </span>
                    <ChevronDown className="size-4 shrink-0 text-sidebar-foreground/50 transition-transform duration-200 group-data-[state=open]:rotate-180 group-data-[collapsible=icon]:hidden" />
                  </button>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-56"
                side="top"
                sideOffset={8}
              >
                <div className="px-2 py-1.5">
                  <p className="truncate text-sm font-medium">{displayName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {profile.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" onClick={closeMobileSidebar}>
                    <User className="mr-2 size-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onSelect={handleLogout}
                >
                  <LogOut className="mr-2 size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
