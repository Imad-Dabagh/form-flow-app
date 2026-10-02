import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function WorkspacePage({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mx-auto w-full min-w-0 max-w-7xl space-y-8 px-4 pb-10 pt-7 sm:px-6 sm:pt-10 lg:px-8",
        className,
      )}
      {...props}
    />
  );
}
