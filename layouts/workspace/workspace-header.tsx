"use client";

import { Bell, Moon, Sun } from "lucide-react";
import { useTheme } from "@/modules/shared/components/theme-provider";
import { Button } from "@/modules/shared/components/ui/button";
import {
  SidebarTrigger,
  useSidebar,
} from "@/modules/shared/components/ui/sidebar";

export function WorkspaceHeader() {
  const { isMobile, state } = useSidebar();
  const { resolvedTheme, setTheme } = useTheme();
  const sidebarLabel = isMobile
    ? "Open navigation menu"
    : state === "collapsed"
      ? "Expand sidebar"
      : "Collapse sidebar";
  const themeLabel =
    resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/95 px-3 backdrop-blur-sm sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger
          aria-label={sidebarLabel}
          className="size-11 rounded-md text-muted-foreground hover:text-foreground md:size-8 [&_svg]:size-3.5!"
          title={sidebarLabel}
        />
        <span className="text-sm font-medium text-muted-foreground">
          Workspace
        </span>
      </div>

      <div className="flex items-center gap-1">
        <span title="Notifications coming soon">
          <Button
            aria-label="Notifications coming soon"
            className="size-11 text-muted-foreground md:size-8"
            disabled
            size="icon"
            variant="ghost"
          >
            <Bell className="size-4" />
          </Button>
        </span>
        <Button
          aria-label={themeLabel}
          className="size-11 text-muted-foreground hover:text-foreground md:size-8"
          disabled={!resolvedTheme}
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          size="icon"
          title={themeLabel}
          variant="ghost"
        >
          <Sun className="hidden size-4 dark:block" />
          <Moon className="size-4 dark:hidden" />
        </Button>
      </div>
    </header>
  );
}
