"use client";

import { format, isValid, parseISO } from "date-fns";
import { ArrowUpRight, FileText, Link2 } from "lucide-react";
import type { FormQuestion, OrganizationFormDetails } from "@/router/orgs/forms";
import type { FormSubmission } from "@/router/orgs/forms/submissions";
import { Badge } from "@/modules/shared/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/modules/shared/components/ui/accordion";

type SubmissionDetailsProps = {
  form: OrganizationFormDetails;
  submission: FormSubmission;
};

type SavedFile = {
  name?: string;
  mimeType?: string;
  url: string;
};

function isSavedFile(value: unknown): value is SavedFile {
  return (
    typeof value === "object" && value !== null && "url" in value && typeof value.url === "string"
  );
}

function safeHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

function FileAnswer({ value }: { value: unknown }) {
  const files = Array.isArray(value) ? value.filter(isSavedFile) : [];

  if (files.length === 0) return <span className="text-muted-foreground">No files uploaded</span>;

  return (
    <ul className="space-y-2">
      {files.map((file, index) => {
        const name = file.name || `File ${index + 1}`;
        const url = safeHttpUrl(file.url);
        const content = (
          <>
            <FileText className="size-4 shrink-0 text-primary" aria-hidden="true" />
            <span className="flex-1 min-w-0 truncate" title={name}>
              {name}
            </span>
            {url && (
              <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            )}
          </>
        );

        return (
          <li key={`${file.url}-${index}`}>
            {url ? (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-md border bg-background p-2.5 transition-colors hover:border-primary/50 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {content}
              </a>
            ) : (
              <div className="flex items-center gap-2 rounded-md border bg-background p-2.5">
                {content}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function Answer({ question, value }: { question: FormQuestion; value: unknown }) {
  if (question.inputType === "file") return <FileAnswer value={value} />;

  if (value === null || value === undefined || (typeof value === "string" && value.trim() === "")) {
    return <span className="text-muted-foreground">—</span>;
  }

  if (["select", "radio", "multi-select", "checkboxes"].includes(question.inputType)) {
    const selected = Array.isArray(value) ? value : [value];
    const labels = selected.map(
      (item) => question.options?.find((option) => option.value === item)?.label ?? String(item),
    );

    if (labels.length === 0) return <span className="text-muted-foreground">—</span>;
    if (labels.length === 1) return <span>{labels[0]}</span>;

    return (
      <ul className="space-y-1 list-disc list-inside">
        {labels.map((label, index) => (
          <li key={`${label}-${index}`}>{label}</li>
        ))}
      </ul>
    );
  }

  if (question.inputType === "boolean") {
    return (
      <Badge variant={value === true ? "secondary" : "outline"}>
        {value === true ? "Yes" : "No"}
      </Badge>
    );
  }

  if (question.inputType === "datetime" && typeof value === "string") {
    if (question.typeConfig?.type === "time") return <span className="tabular-nums">{value}</span>;
    const date = parseISO(value);
    return <span>{isValid(date) ? format(date, "MMM d, yyyy") : value}</span>;
  }

  if (question.inputType === "linear-scale") {
    return (
      <span className="inline-flex flex-wrap items-baseline gap-2">
        <span className="text-lg font-semibold tabular-nums text-primary">{String(value)}</span>
        <span className="text-xs text-muted-foreground">
          Scale {question.typeConfig?.min ?? 1}–{question.typeConfig?.max ?? 5}
        </span>
      </span>
    );
  }

  if (question.inputType === "url" && typeof value === "string") {
    const url = safeHttpUrl(value);
    if (url) {
      const host = new URL(url).host;
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${value} in a new tab`}
          className="flex min-w-0 items-center gap-2.5 rounded-lg border border-border bg-background p-2.5 transition-[border-color,background-color] hover:border-primary/50 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex items-center justify-center rounded-md size-9 shrink-0 bg-primary/10 text-primary">
            <Link2 className="size-4" aria-hidden="true" />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block font-medium truncate text-foreground" title={host}>
              {host}
            </span>
            <span className="block text-xs truncate text-muted-foreground" title={value}>
              {value}
            </span>
          </span>
          <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </a>
      );
    }
  }

  if (Array.isArray(value)) return <span>{value.map(String).join(", ") || "—"}</span>;
  if (typeof value === "object") return <span>{JSON.stringify(value)}</span>;
  return <span>{String(value)}</span>;
}

export function SubmissionDetails({ form, submission }: SubmissionDetailsProps) {
  const sections = form.sections.filter((section) => section.questions.length > 0);

  if (sections.length === 0) {
    return <p className="text-sm text-muted-foreground">This form has no questions to display.</p>;
  }

  return (
    <Accordion type="multiple" defaultValue={[sections[0]._id]} className="space-y-3">
      {sections.map((section) => (
        <AccordionItem
          key={section._id}
          value={section._id}
          className="px-4 border rounded-lg bg-card last:border-b"
        >
          <AccordionTrigger className="hover:no-underline">
            <span className="min-w-0 space-y-1">
              <span className="block font-medium">{section.title}</span>
              {section.description && (
                <span className="block text-xs font-normal text-muted-foreground">
                  {section.description}
                </span>
              )}
            </span>
          </AccordionTrigger>
          <AccordionContent className="grid gap-4 pt-4 border-t md:grid-cols-2">
            {section.questions.map((question) => (
              <div key={question._id} className="min-w-0 space-y-1.5">
                <h3 className="text-xs font-medium text-muted-foreground">{question.title}</h3>
                <div className="min-w-0 p-3 text-sm whitespace-pre-wrap border rounded-md wrap-break-word bg-muted/30">
                  <Answer question={question} value={submission.answers[question._id]} />
                </div>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
