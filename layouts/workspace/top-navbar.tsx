"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings, User, Sun, Moon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/modules/shared/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/modules/shared/components/ui/avatar";
import { Button } from "@/modules/shared/components/ui/button";
import { useTheme } from "@/modules/shared/components/theme-provider";
import { useAuthenticatedProfile } from "@/modules/auth";
import {
  organizationManagePath,
  useOrganizationWorkspace,
} from "@/modules/organizations";
import API from "@/router";

export function TopNavbar() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const profile = useAuthenticatedProfile();
  const organization = useOrganizationWorkspace();
  const displayName = [profile.firstName, profile.lastName]
    .filter(Boolean)
    .join(" ") || profile.email;
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const handleLogout = async () => {
    await API.auth.signOut();
    router.replace("/sign-in");
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <nav className="fixed top-0 right-0 left-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background px-4 md:left-64 md:px-6">
      <Link
        className="truncate text-sm font-semibold md:hidden"
        href={organizationManagePath(organization.slug, "/dashboard")}
      >
        {organization.name}
      </Link>
      <div className="hidden flex-1 md:block" />

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="hover:bg-accent"
          aria-label="Toggle theme"
        >
          {theme === "light" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="truncate text-sm font-medium">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground">{profile.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="h-4 w-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
