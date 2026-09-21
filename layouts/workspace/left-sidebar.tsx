"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText } from "lucide-react";

export function LeftSidebar() {
  const pathname = usePathname();
  const isFormsActive = pathname === "/" || pathname.startsWith("/dashboard");

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col pt-6 z-50">
      {/* Logo */}
      <div className="px-6 mb-12">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg text-sidebar-foreground hover:opacity-80 transition-opacity"
        >
          <div className="h-8 w-8 rounded bg-sidebar-primary flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-bold">F</span>
          </div>
          <span>FormBuilder</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-3">
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isFormsActive
              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          }`}
        >
          <FileText className="h-5 w-5" />
          <span>Forms</span>
        </Link>
      </nav>

      {/* Footer section */}
      <div className="px-6 py-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground opacity-60">v1.0.0</p>
      </div>
    </aside>
  );
}
