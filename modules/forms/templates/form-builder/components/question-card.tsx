import {
  CalendarDays,
  ChevronDown,
  Clock3,
  Copy,
  GripVertical,
  Hash,
  Mail,
  Trash2,
  UploadCloud,
} from "lucide-react";
import type { ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { FormQuestion } from "@/router/orgs/forms";
import { Button } from "@/modules/shared/components/ui/button";

const previewText: Record<string, string> = {
  string: "Short answer text",
  text: "Long answer text",
  email: "name@example.com",
  number: "Enter a number",
};

export function QuestionCard({
  question,
  canEdit,
  isActive,
  onSelect,
  onDuplicate,
  onDelete,
}: {
  question: FormQuestion;
  canEdit: boolean;
  isActive: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question._id,
    disabled: !canEdit,
    transition: { duration: 150, easing: "cubic-bezier(0.25, 1, 0.5, 1)" },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
      }}
      className={`group relative rounded-lg border bg-background p-4 transition-shadow hover:shadow-sm ${isActive ? "border-primary ring-1 ring-primary/30" : "hover:border-primary/50"}`}
    >
      <QuestionCardContent
        question={question}
        onSelect={onSelect}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        showActions={canEdit}
        dragHandle={
          canEdit ? (
            <button
              type="button"
              {...attributes}
              {...listeners}
              title="Drag to reorder question"
              aria-label={`Drag ${question.title} to reorder`}
              className="inline-flex items-center justify-center -ml-1 rounded size-5 shrink-0 cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
            >
              <GripVertical className="size-4" />
            </button>
          ) : null
        }
      />
    </div>
  );
}

export function QuestionCardDragPreview({ question }: { question: FormQuestion }) {
  return (
    <div
      aria-hidden="true"
      inert
      className="pointer-events-none rounded-lg border border-primary bg-background p-4 shadow-xl ring-1 ring-primary/30"
    >
      <QuestionCardContent
        question={question}
        onSelect={() => undefined}
        onDuplicate={() => undefined}
        onDelete={() => undefined}
        showActions={false}
        dragHandle={<GripVertical className="-ml-1 size-5 shrink-0 text-muted-foreground" />}
      />
    </div>
  );
}

function QuestionCardContent({
  question,
  onSelect,
  onDuplicate,
  onDelete,
  showActions,
  dragHandle,
}: {
  question: FormQuestion;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  showActions: boolean;
  dragHandle: ReactNode;
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start flex-1 min-w-0 gap-2">
          {dragHandle}
          <button type="button" onClick={onSelect} className="flex-1 min-w-0 text-left">
            <span className="block text-sm font-semibold">
              {question.title}
              {question.isRequired && <span className="ml-1 text-destructive">*</span>}
            </span>
            {question.description && (
              <span className="block mt-1 text-xs text-muted-foreground">
                {question.description}
              </span>
            )}
          </button>
        </div>
        {showActions && (
          <div className="flex items-center gap-1 transition-opacity opacity-0 shrink-0 group-hover:opacity-100 group-focus-within:opacity-100 max-sm:opacity-100">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              title="Duplicate question"
              aria-label={`Duplicate ${question.title}`}
              onClick={onDuplicate}
            >
              <Copy className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              title="Delete question"
              aria-label={`Delete ${question.title}`}
              onClick={onDelete}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        )}
      </div>
      <button type="button" onClick={onSelect} className="block w-full mt-3 text-left">
        {question.inputType === "file" ? (
          <span className="flex flex-col items-center justify-center gap-2 px-4 py-5 text-sm border border-dashed rounded-md bg-muted/20 text-muted-foreground">
            <UploadCloud className="size-5" />
            <span>
              Choose{" "}
              {question.typeConfig?.uploadCategory === "images"
                ? "an image"
                : question.typeConfig?.uploadCategory === "documents"
                  ? "a document"
                  : "a file"}{" "}
              to upload
            </span>
          </span>
        ) : question.inputType === "linear-scale" ? (
          <span className="block px-3 py-4 border rounded-md bg-muted/20">
            <span className="block overflow-x-auto">
              <span className="flex justify-between gap-4 min-w-max">
                {Array.from(
                  {
                    length: Math.max(
                      0,
                      (question.typeConfig?.max ?? 5) - (question.typeConfig?.min ?? 1) + 1,
                    ),
                  },
                  (_, index) => (question.typeConfig?.min ?? 1) + index,
                ).map((value) => (
                  <span
                    key={value}
                    className="flex flex-col items-center gap-2 text-sm min-w-8 text-muted-foreground"
                  >
                    <span>{value}</span>
                    <span className="border-2 rounded-full size-5 border-muted-foreground/50 bg-background" />
                  </span>
                ))}
              </span>
            </span>
            {(question.typeConfig?.minLabel || question.typeConfig?.maxLabel) && (
              <span className="flex justify-between gap-4 mt-3 text-xs text-muted-foreground">
                <span className="max-w-[45%]">{question.typeConfig?.minLabel}</span>
                <span className="max-w-[45%] text-right">{question.typeConfig?.maxLabel}</span>
              </span>
            )}
          </span>
        ) : question.inputType === "boolean" ? (
          <span className="flex items-center gap-2 px-3 py-2 text-sm border rounded-md bg-muted/30 text-muted-foreground">
            <span
              className={`flex size-4 shrink-0 items-center justify-center rounded-none border ${question.defaultValue === true ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/60"}`}
            >
              {question.defaultValue === true && <span className="text-xs leading-none">✓</span>}
            </span>
            Checkbox
          </span>
        ) : question.inputType === "radio" || question.inputType === "checkboxes" ? (
          <span className="block space-y-2 text-sm text-muted-foreground">
            {(question.options ?? []).map((option, index) => (
              <span key={`${option.value}-${index}`} className="flex items-center gap-2">
                <span
                  className={`size-4 shrink-0 border border-muted-foreground/60 ${question.inputType === "radio" ? "rounded-full" : "rounded-none"}`}
                />
                {option.label}
              </span>
            ))}
          </span>
        ) : (
          <span className="flex items-center gap-2 px-3 py-2 text-sm border rounded-md bg-muted/30 text-muted-foreground">
            {question.inputType === "email" && <Mail className="size-4 shrink-0" />}
            {question.inputType === "number" && <Hash className="size-4 shrink-0" />}
            {question.inputType === "datetime" &&
              (question.typeConfig?.type === "time" ? (
                <Clock3 className="size-4 shrink-0" />
              ) : (
                <CalendarDays className="size-4 shrink-0" />
              ))}
            <span className="flex-1">
              {question.inputType === "select" || question.inputType === "multi-select"
                ? question.placeholder ||
                  (question.inputType === "select" ? "Select an option" : "Select options")
                : question.inputType === "datetime"
                  ? question.typeConfig?.type === "time"
                    ? "Select time"
                    : "Select date"
                  : previewText[question.inputType]
                    ? question.placeholder || previewText[question.inputType]
                    : "Field preview coming in a later step"}
            </span>
            {(question.inputType === "select" || question.inputType === "multi-select") && (
              <ChevronDown className="size-4 shrink-0" />
            )}
          </span>
        )}
      </button>
    </>
  );
}
