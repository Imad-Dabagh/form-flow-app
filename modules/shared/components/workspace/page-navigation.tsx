import type { ReactNode } from "react";

export function PageNavigation({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div className="flex min-h-9 min-w-0 items-center justify-between gap-3">
      <h1 className="sr-only">{title}</h1>
      {children}
    </div>
  );
}
