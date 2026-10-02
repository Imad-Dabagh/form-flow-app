import { Check, LockKeyhole, LoaderCircle, TriangleAlert } from "lucide-react";
import { Button } from "@/modules/shared/components/ui/button";

export function SubmissionState({
  kind,
  title,
  description,
  onRetry,
}: {
  kind: "loading" | "unavailable" | "error" | "closed" | "success";
  title: string;
  description?: string;
  onRetry?: () => void;
}) {
  const Icon = kind === "loading" ? LoaderCircle
    : kind === "success" ? Check
      : kind === "closed" ? LockKeyhole : TriangleAlert;

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center px-4 py-10 sm:px-6">
      <div
        role={kind === "loading" ? "status" : kind === "error" ? "alert" : undefined}
        className="w-full rounded-xl border bg-card px-6 py-10 text-center shadow-sm sm:px-10"
      >
        <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className={`size-5 ${kind === "loading" ? "animate-spin motion-reduce:animate-none" : ""}`} aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
        {description && <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>}
        {onRetry && <Button type="button" variant="outline" className="mt-6" onClick={onRetry}>Try again</Button>}
      </div>
    </main>
  );
}
