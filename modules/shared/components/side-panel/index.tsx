"use client";

import { useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/modules/shared/components/ui/sheet";

type SidePanelProps = {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  footer?: ReactNode;
  className?: string;
  bodyClassName?: string;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
};

export function SidePanel({
  children,
  isOpen,
  onClose,
  title,
  description,
  footer,
  className,
  bodyClassName,
  closeOnEscape = true,
  closeOnOutsideClick = true,
}: SidePanelProps) {
  const returnFocusRef = useRef<HTMLElement | null>(null);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className={cn("w-[calc(100vw-4rem)] gap-0 sm:max-w-xl", className)}
        onOpenAutoFocus={() => {
          returnFocusRef.current =
            document.activeElement instanceof HTMLElement ? document.activeElement : null;
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusRef.current?.focus();
          returnFocusRef.current = null;
        }}
        onEscapeKeyDown={(event) => {
          if (!closeOnEscape) event.preventDefault();
        }}
        onPointerDownOutside={(event) => {
          if (!closeOnOutsideClick) event.preventDefault();
        }}
      >
        <SheetClose
          aria-label="Close panel"
          className="absolute top-2 -left-13 z-10 flex size-10 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-lg transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-4" aria-hidden="true" />
        </SheetClose>
        <SheetHeader className="border-b shrink-0">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription className={cn(!description && "sr-only")}>
            {description ?? "Review the content in this panel."}
          </SheetDescription>
        </SheetHeader>
        <div className={cn("min-h-0 flex-1 overflow-y-auto p-4", bodyClassName)}>{children}</div>
        {footer && <SheetFooter className="border-t shrink-0">{footer}</SheetFooter>}
      </SheetContent>
    </Sheet>
  );
}
