import type { ReactNode } from "react";

export default function AuthRouteLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <main className="min-h-screen bg-background">{children}</main>;
}
