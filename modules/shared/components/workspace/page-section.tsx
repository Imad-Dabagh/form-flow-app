import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageSection({
  title,
  description,
  actions,
  children,
  className,
  ...props
}: Omit<ComponentProps<"section">, "title"> & {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className={cn("min-w-0 space-y-4", className)} {...props}>
      {(title || description || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            {title && <h2 className="text-lg font-semibold tracking-tight">{title}</h2>}
            {description && (
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
