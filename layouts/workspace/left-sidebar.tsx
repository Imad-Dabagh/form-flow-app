"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { FileText, LayoutDashboard, LogOut, User } from "lucide-react";
import {
  organizationWorkspacePath,
  useOrganizationWorkspace,
} from "@/modules/organizations";
import { useAuthenticatedProfile } from "@/modules/auth";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/modules/shared/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/modules/shared/components/ui/dropdown-menu";
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

export function LeftSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const organization = useOrganizationWorkspace();
  const profile = useAuthenticatedProfile();
  const dashboardPath = organizationWorkspacePath(organization.slug, "/dashboard");
  const formsPath = organizationWorkspacePath(organization.slug, "/forms");
  const isDashboardActive = pathname === dashboardPath;
  const isFormsActive = pathname.startsWith(formsPath);
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

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-16 flex-col border-r border-sidebar-border bg-sidebar pt-4 sm:w-64 sm:pt-6">
      <div className="px-3 sm:mb-12 sm:px-6">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 text-lg font-bold text-sidebar-foreground transition-opacity hover:opacity-80 sm:justify-start"
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <span className="text-sidebar-primary-foreground font-bold">F</span>
          </div>
          <span className="hidden sm:inline">Form Flow</span>
        </Link>
      </div>

      <nav className="mt-8 flex-1 space-y-1 px-2 sm:mt-0 sm:px-3">
        <Link
          href={dashboardPath}
          className={`flex items-center justify-center gap-3 rounded-lg px-3 py-3 transition-colors sm:justify-start sm:px-4 ${
            isDashboardActive
              ? "bg-primary-100 font-medium text-primary-700 dark:bg-primary-950 dark:text-primary-300"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          }`}
        >
          <LayoutDashboard className="size-5" />
          <span className="hidden sm:inline">Overview</span>
        </Link>
        <Link
          href={formsPath}
          className={`flex items-center justify-center gap-3 rounded-lg px-3 py-3 transition-colors sm:justify-start sm:px-4 ${
            isFormsActive
              ? "bg-primary-100 font-medium text-primary-700 dark:bg-primary-950 dark:text-primary-300"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          }`}
        >
          <FileText className="size-5" />
          <span className="hidden sm:inline">Forms</span>
        </Link>
      </nav>

      <div className="mt-auto border-t border-sidebar-border p-2 sm:p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center justify-center gap-3 rounded-lg p-2 text-left outline-none transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring sm:justify-start">
              <Avatar className="size-8">
                {profile.profilePic && (
                  <AvatarImage alt="" src={profile.profilePic} />
                )}
                <AvatarFallback className="bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden min-w-0 flex-1 sm:block">
                <span className="block truncate text-sm font-medium text-sidebar-foreground">
                  {displayName}
                </span>
                <span className="block truncate text-xs text-sidebar-foreground/60">
                  {profile.email}
                </span>
              </span>
            </button>
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
              <Link href="/profile">
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
      </div>
    </aside>
  );
}
