"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/modules/shared/components/ui/button";

export function Pagination({
  page,
  pageSize,
  total,
  isLoading = false,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const shown = Math.max(0, Math.min(pageSize, total - (page - 1) * pageSize));

  function changePage(nextPage: number) {
    onPageChange(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <nav
      aria-label="Results pagination"
      className="sticky bottom-4 z-10 flex w-full flex-col gap-3 rounded-2xl border border-border/60 bg-card/95 p-3 text-sm text-muted-foreground shadow-[0_8px_24px_-12px_rgba(0,0,0,0.18),0_2px_6px_rgba(0,0,0,0.04)] backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4"
    >
      <p aria-live="polite" className="text-center text-xs tabular-nums sm:text-left sm:text-sm">
        {isLoading ? (
          "Loading results…"
        ) : (
          <>
            Showing <span className="font-medium text-foreground">{shown}</span> of{" "}
            <span className="font-medium text-foreground">{total}</span> results
          </>
        )}
      </p>
      <div className="flex w-full items-center justify-between gap-2 sm:w-auto">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label="Previous page"
          className="h-11 w-11 rounded-xl px-0 text-muted-foreground transition-[background-color,color,transform] active:scale-95 sm:h-9 sm:w-auto sm:px-3"
          disabled={isLoading || page <= 1}
          onClick={() => changePage(page - 1)}
        >
          <ArrowLeft className="size-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>
        <span className="min-w-24 whitespace-nowrap rounded-lg bg-muted/60 px-3 py-2 text-center text-xs tabular-nums">
          Page <span className="font-semibold text-foreground">{page}</span> of{" "}
          <span className="font-medium text-foreground">{isLoading ? "…" : totalPages}</span>
        </span>
        <Button
          type="button"
          size="sm"
          aria-label="Next page"
          className="h-11 w-11 rounded-xl px-0 shadow-none transition-[background-color,color,transform] active:scale-95 sm:h-9 sm:w-auto sm:px-3"
          disabled={isLoading || page >= totalPages}
          onClick={() => changePage(page + 1)}
        >
          <span className="hidden sm:inline">Next</span>
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </nav>
  );
}
