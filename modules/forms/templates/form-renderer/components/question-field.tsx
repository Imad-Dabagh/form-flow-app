"use client";

import { ChevronDown, X } from "lucide-react";
import { MAX_SUBMISSION_FILES, MAX_UPLOAD_BYTES, uploadExtensions } from "@/modules/forms/upload-policy";
import type { FormPresentationQuestion } from "@/router/orgs/forms";
import { Button } from "@/modules/shared/components/ui/button";
import { Checkbox } from "@/modules/shared/components/ui/checkbox";
import { Input } from "@/modules/shared/components/ui/input";
import { Label } from "@/modules/shared/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/modules/shared/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/modules/shared/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/shared/components/ui/select";
import { Textarea } from "@/modules/shared/components/ui/textarea";
import type { FormAnswer } from "../types";

export function QuestionField({
  question,
  value,
  error,
  onChange,
}: {
  question: FormPresentationQuestion;
  value: FormAnswer;
  error?: string;
  onChange: (value: FormAnswer) => void;
}) {
  const inputId = `question-${question._id}`;
  const labelId = `${inputId}-label`;
  const errorId = `${inputId}-error`;
  const textValue = typeof value === "string" || typeof value === "number" ? String(value) : "";
  const selectedValues = Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];

  if (question.inputType === "boolean") {
    return (
      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <Checkbox
            id={inputId}
            checked={value === true}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            onCheckedChange={(checked) => onChange(checked === true)}
            className="mt-0.5"
          />
          <Label htmlFor={inputId} className="leading-5">
            {question.title}
            {question.isRequired && <span className="text-destructive">*</span>}
          </Label>
        </div>
        {question.description && (
          <p className="pl-7 text-sm text-muted-foreground">{question.description}</p>
        )}
        {error && <p id={errorId} role="alert" className="pl-7 text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  function toggleOption(optionValue: string, checked: boolean) {
    onChange(
      checked
        ? [...selectedValues, optionValue]
        : selectedValues.filter((item) => item !== optionValue),
    );
  }

  let control;
  switch (question.inputType) {
    case "string":
    case "email":
    case "number":
      control = (
        <Input
          id={inputId}
          type={question.inputType === "string" ? "text" : question.inputType}
          value={textValue}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          placeholder={question.placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      );
      break;
    case "text":
      control = (
        <Textarea
          id={inputId}
          value={textValue}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          rows={4}
          placeholder={question.placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      );
      break;
    case "select":
      control = (
        <Select value={textValue || undefined} onValueChange={onChange}>
          <SelectTrigger id={inputId} className="w-full" aria-invalid={!!error} aria-describedby={error ? errorId : undefined}>
            <SelectValue placeholder={question.placeholder || "Select an option"} />
          </SelectTrigger>
          <SelectContent>
            {(question.options ?? []).map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
      break;
    case "radio":
      control = (
        <RadioGroup id={inputId} value={textValue} onValueChange={onChange} aria-labelledby={labelId} aria-invalid={!!error} aria-describedby={error ? errorId : undefined} tabIndex={-1}>
          {(question.options ?? []).map((option) => (
            <div key={option.value} className="flex items-center gap-2">
              <RadioGroupItem id={`${inputId}-${option.value}`} value={option.value} />
              <Label htmlFor={`${inputId}-${option.value}`} className="font-normal">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      );
      break;
    case "checkboxes":
      control = (
        <div id={inputId} className="space-y-3" role="group" aria-labelledby={labelId} aria-invalid={!!error} aria-describedby={error ? errorId : undefined} tabIndex={-1}>
          {(question.options ?? []).map((option) => (
            <div key={option.value} className="flex items-center gap-2">
              <Checkbox
                id={`${inputId}-${option.value}`}
                checked={selectedValues.includes(option.value)}
                onCheckedChange={(checked) => toggleOption(option.value, checked === true)}
              />
              <Label htmlFor={`${inputId}-${option.value}`} className="font-normal">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      );
      break;
    case "multi-select":
      control = (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id={inputId}
              aria-invalid={!!error}
              aria-describedby={error ? errorId : undefined}
              type="button"
              variant="outline"
              className="w-full justify-between font-normal"
            >
              <span className="truncate">
                {selectedValues.length
                  ? (question.options ?? [])
                      .filter((option) => selectedValues.includes(option.value))
                      .map((option) => option.label)
                      .join(", ")
                  : question.placeholder || "Select options"}
              </span>
              <ChevronDown className="size-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-(--radix-popover-trigger-width) min-w-56 space-y-1 p-2"
          >
            {(question.options ?? []).map((option) => (
              <div key={option.value} className="flex items-center gap-2 rounded px-2 py-1.5">
                <Checkbox
                  id={`${inputId}-${option.value}`}
                  checked={selectedValues.includes(option.value)}
                  onCheckedChange={(checked) => toggleOption(option.value, checked === true)}
                />
                <Label htmlFor={`${inputId}-${option.value}`} className="font-normal">
                  {option.label}
                </Label>
              </div>
            ))}
          </PopoverContent>
        </Popover>
      );
      break;
    case "datetime":
      control = (
        <Input
          id={inputId}
          type={question.typeConfig?.type === "time" ? "time" : "date"}
          value={textValue}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => onChange(event.target.value)}
        />
      );
      break;
    case "linear-scale": {
      const min = question.typeConfig?.min ?? 1;
      const max = question.typeConfig?.max ?? 5;
      const choices = Array.from(
        { length: Math.max(0, Math.min(max - min + 1, 11)) },
        (_, index) => min + index,
      );
      control = (
        <div className="space-y-3">
          <RadioGroup
            value={textValue}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            onValueChange={(selected) => onChange(Number(selected))}
            aria-labelledby={labelId}
            tabIndex={-1}
            className="flex flex-wrap gap-3 sm:gap-5"
          >
            {choices.map((choice) => (
              <div key={choice} className="flex flex-col items-center gap-2">
                <Label htmlFor={`${inputId}-${choice}`} className="font-normal">
                  {choice}
                </Label>
                <RadioGroupItem id={`${inputId}-${choice}`} value={String(choice)} />
              </div>
            ))}
          </RadioGroup>
          {(question.typeConfig?.minLabel || question.typeConfig?.maxLabel) && (
            <div className="flex justify-between gap-4 text-xs text-muted-foreground">
              <span>{question.typeConfig?.minLabel}</span>
              <span>{question.typeConfig?.maxLabel}</span>
            </div>
          )}
        </div>
      );
      break;
    }
    case "file": {
      const category = question.typeConfig?.uploadCategory ?? "all";
      const extensions = question.typeConfig?.allowedExtensions?.length
        ? question.typeConfig.allowedExtensions
        : uploadExtensions[category];
      const accept = extensions
        .flatMap((extension) => extension === "jpg" ? [".jpg", ".jpeg"] : [`.${extension}`])
        .join(",");
      const files = Array.isArray(value)
        ? value.filter((item): item is File => typeof File !== "undefined" && item instanceof File)
        : [];
      const helpId = `${inputId}-help`;
      control = (
        <div className="space-y-3">
          <Input
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={`${helpId}${error ? ` ${errorId}` : ""}`}
            type="file"
            multiple
            accept={accept}
            className="h-auto py-2"
            onChange={(event) => {
              const selected = Array.from(event.currentTarget.files ?? []);
              if (!selected.length) return;
              onChange([
                ...files,
                ...selected.filter((candidate) => !files.some((file) =>
                  file.name === candidate.name && file.size === candidate.size && file.lastModified === candidate.lastModified,
                )),
              ]);
              event.currentTarget.value = "";
            }}
          />
          <p id={helpId} className="text-xs leading-5 text-muted-foreground">
            {`Allowed formats: ${extensions.map((extension) => extension.toUpperCase()).join(", ")}. `}
            {`${MAX_UPLOAD_BYTES / (1024 * 1024)} MB per file; up to ${MAX_SUBMISSION_FILES} files per response.`}
          </p>
          {files.length > 0 && (
            <ul className="space-y-2" aria-label="Selected files">
              {files.map((file, index) => (
                <li key={`${file.name}-${file.size}-${file.lastModified}-${index}`} className="flex min-w-0 items-center gap-2 rounded-md border bg-muted/30 py-1.5 pl-3 pr-1.5">
                  <span className="min-w-0 flex-1 truncate text-sm" title={file.name}>{file.name}</span>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {file.size < 1024 * 1024
                      ? `${(file.size / 1024).toFixed(1)} KB`
                      : `${(file.size / (1024 * 1024)).toFixed(1)} MB`}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-9 shrink-0"
                    aria-label={`Remove ${file.name}`}
                    onClick={() => onChange(files.filter((_, fileIndex) => fileIndex !== index))}
                  >
                    <X className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      );
      break;
    }
    default:
      control = <p className="text-sm text-muted-foreground">This question type is unavailable.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label
          id={labelId}
          htmlFor={
            ["radio", "checkboxes", "linear-scale"].includes(question.inputType)
              ? undefined
              : inputId
          }
          className="text-sm font-semibold leading-5"
        >
          {question.title}
          {question.isRequired && <span className="text-destructive">*</span>}
        </Label>
        {question.description && (
          <p className="text-sm text-muted-foreground">{question.description}</p>
        )}
      </div>
      {control}
      {error && <p id={errorId} role="alert" className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
