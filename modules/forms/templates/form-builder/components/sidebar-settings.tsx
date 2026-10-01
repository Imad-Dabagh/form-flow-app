import { useEffect, useState } from "react";
import { CalendarDays, Clock3, GripVertical, Plus, Trash2, X } from "lucide-react";
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { FormOption, FormQuestion, FormSection } from "@/router/orgs/forms";
import { Button } from "@/modules/shared/components/ui/button";
import { Input } from "@/modules/shared/components/ui/input";
import { Label } from "@/modules/shared/components/ui/label";
import { Textarea } from "@/modules/shared/components/ui/textarea";
import { uploadExtensions } from "@/modules/forms/upload-policy";

export function SidebarSettings({
  section,
  question,
  canEdit,
  onClose,
  onUpdateSection,
  onUpdateQuestion,
}: {
  section: FormSection;
  question?: FormQuestion;
  canEdit: boolean;
  onClose: () => void;
  onUpdateSection: (updates: Partial<FormSection>) => void;
  onUpdateQuestion: (updates: Partial<FormQuestion>) => void;
}) {
  return (
    <aside className="p-5 border shadow-sm rounded-xl bg-card lg:sticky lg:top-6">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="font-semibold">{question ? "Edit question" : "Edit section"}</h2>
          {question && <p className="mt-1 text-xs text-muted-foreground">{question.inputType}</p>}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Close settings"
          onClick={onClose}
        >
          <X className="size-4" />
        </Button>
      </div>
      {question ? (
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="question-title">Label</Label>
            <Input
              id="question-title"
              value={question.title}
              disabled={!canEdit}
              onChange={(event) => onUpdateQuestion({ title: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="question-description">Description</Label>
            <Textarea
              id="question-description"
              rows={3}
              value={question.description ?? ""}
              disabled={!canEdit}
              onChange={(event) => onUpdateQuestion({ description: event.target.value })}
            />
          </div>
          {["string", "text", "email", "number", "select", "multi-select"].includes(
            question.inputType,
          ) && (
            <div className="space-y-2">
              <Label htmlFor="question-placeholder">Placeholder</Label>
              <Input
                id="question-placeholder"
                value={question.placeholder ?? ""}
                disabled={!canEdit}
                onChange={(event) => onUpdateQuestion({ placeholder: event.target.value })}
              />
            </div>
          )}
          {["select", "radio", "multi-select", "checkboxes"].includes(question.inputType) && (
            <OptionsEditor
              options={question.options ?? []}
              canEdit={canEdit}
              onChange={(options) => onUpdateQuestion({ options })}
            />
          )}
          {question.inputType === "file" && (
            <FileUploadOptions question={question} canEdit={canEdit} onUpdate={onUpdateQuestion} />
          )}
          {question.inputType === "datetime" && (
            <div className="space-y-3 border-t pt-5">
              <Label>Input format</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["date", "time"] as const).map((type) => (
                  <Button
                    key={type}
                    type="button"
                    size="sm"
                    variant={(question.typeConfig?.type ?? "date") === type ? "default" : "outline"}
                    disabled={!canEdit}
                    onClick={() =>
                      onUpdateQuestion({
                        typeConfig: {
                          ...question.typeConfig,
                          type,
                          format: type === "date" ? "DD MMM YYYY" : "HH:mm",
                        },
                      })
                    }
                  >
                    {type === "date" ? (
                      <CalendarDays className="size-4" />
                    ) : (
                      <Clock3 className="size-4" />
                    )}
                    {type === "date" ? "Date" : "Time"}
                  </Button>
                ))}
              </div>
            </div>
          )}
          {question.inputType === "boolean" && (
            <label className="flex items-center gap-2 border-t pt-5 text-sm">
              <input
                type="checkbox"
                checked={question.defaultValue === true}
                disabled={!canEdit}
                onChange={(event) => onUpdateQuestion({ defaultValue: event.target.checked })}
              />
              Checked by default
            </label>
          )}
          {question.inputType === "linear-scale" && (
            <div className="space-y-4 border-t pt-5">
              <p className="text-sm font-medium">Scale range</p>
              <div className="flex items-end gap-3">
                <div className="space-y-2">
                  <Label htmlFor={`${question._id}-scale-min`}>From</Label>
                  <select
                    id={`${question._id}-scale-min`}
                    value={question.typeConfig?.min ?? 1}
                    disabled={!canEdit}
                    onChange={(event) =>
                      onUpdateQuestion({
                        typeConfig: { ...question.typeConfig, min: Number(event.target.value) },
                      })
                    }
                    className="flex h-9 min-w-20 rounded-md border border-input bg-background px-3 py-1 text-sm disabled:opacity-50"
                  >
                    <option value={0}>0</option>
                    <option value={1}>1</option>
                  </select>
                </div>
                <span className="pb-2 text-sm text-muted-foreground">to</span>
                <div className="space-y-2">
                  <Label htmlFor={`${question._id}-scale-max`}>To</Label>
                  <select
                    id={`${question._id}-scale-max`}
                    value={question.typeConfig?.max ?? 5}
                    disabled={!canEdit}
                    onChange={(event) =>
                      onUpdateQuestion({
                        typeConfig: { ...question.typeConfig, max: Number(event.target.value) },
                      })
                    }
                    className="flex h-9 min-w-20 rounded-md border border-input bg-background px-3 py-1 text-sm disabled:opacity-50"
                  >
                    {Array.from({ length: 9 }, (_, index) => index + 2).map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-3 border-t pt-4">
                <p className="text-sm font-medium">
                  End labels <span className="font-normal text-muted-foreground">(optional)</span>
                </p>
                <div className="space-y-2">
                  <Label htmlFor={`${question._id}-scale-min-label`}>
                    {question.typeConfig?.min ?? 1} label
                  </Label>
                  <Input
                    id={`${question._id}-scale-min-label`}
                    value={question.typeConfig?.minLabel ?? ""}
                    disabled={!canEdit}
                    placeholder="e.g. Not satisfied"
                    onChange={(event) =>
                      onUpdateQuestion({
                        typeConfig: { ...question.typeConfig, minLabel: event.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${question._id}-scale-max-label`}>
                    {question.typeConfig?.max ?? 5} label
                  </Label>
                  <Input
                    id={`${question._id}-scale-max-label`}
                    value={question.typeConfig?.maxLabel ?? ""}
                    disabled={!canEdit}
                    placeholder="e.g. Very satisfied"
                    onChange={(event) =>
                      onUpdateQuestion({
                        typeConfig: { ...question.typeConfig, maxLabel: event.target.value },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}
          {question.inputType === "email" && (
            <div className="grid grid-cols-2 gap-3 pt-5 border-t">
              <p className="col-span-2 text-sm font-medium">Character limits</p>
              <NumericSetting
                id={`${question._id}-min-length`}
                label="Minimum"
                value={question.validation?.minLength}
                integer
                min={0}
                disabled={!canEdit}
                onChange={(minLength) =>
                  onUpdateQuestion({ validation: { ...question.validation, minLength } })
                }
              />
              <NumericSetting
                id={`${question._id}-max-length`}
                label="Maximum"
                value={question.validation?.maxLength}
                integer
                min={0}
                disabled={!canEdit}
                onChange={(maxLength) =>
                  onUpdateQuestion({ validation: { ...question.validation, maxLength } })
                }
              />
            </div>
          )}
          {question.inputType === "number" && (
            <div className="grid grid-cols-2 gap-3 pt-5 border-t">
              <p className="col-span-2 text-sm font-medium">Allowed values</p>
              <NumericSetting
                id={`${question._id}-min-value`}
                label="Minimum"
                value={question.validation?.min}
                disabled={!canEdit}
                onChange={(min) =>
                  onUpdateQuestion({ validation: { ...question.validation, min } })
                }
              />
              <NumericSetting
                id={`${question._id}-max-value`}
                label="Maximum"
                value={question.validation?.max}
                disabled={!canEdit}
                onChange={(max) =>
                  onUpdateQuestion({ validation: { ...question.validation, max } })
                }
              />
            </div>
          )}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={question.isRequired ?? false}
              disabled={!canEdit}
              onChange={(event) => onUpdateQuestion({ isRequired: event.target.checked })}
            />{" "}
            Required
          </label>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="section-title">Title</Label>
            <Input
              id="section-title"
              value={section.title}
              disabled={!canEdit}
              onChange={(event) => onUpdateSection({ title: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="section-description">Description</Label>
            <Textarea
              id="section-description"
              rows={4}
              value={section.description ?? ""}
              disabled={!canEdit}
              onChange={(event) => onUpdateSection({ description: event.target.value })}
            />
          </div>
        </div>
      )}
    </aside>
  );
}

function FileUploadOptions({
  question,
  canEdit,
  onUpdate,
}: {
  question: FormQuestion;
  canEdit: boolean;
  onUpdate: (updates: Partial<FormQuestion>) => void;
}) {
  const category = question.typeConfig?.uploadCategory ?? "all";
  const extensions = uploadExtensions[category];
  const selected = question.typeConfig?.allowedExtensions?.length
    ? question.typeConfig.allowedExtensions
    : [...extensions];

  function changeCategory(uploadCategory: "all" | "documents" | "images") {
    onUpdate({ typeConfig: { ...question.typeConfig, uploadCategory, allowedExtensions: [] } });
  }

  function toggleExtension(extension: string) {
    const next = selected.includes(extension)
      ? selected.filter((value) => value !== extension)
      : [...selected, extension];
    if (next.length === 0) return;
    onUpdate({
      typeConfig: {
        ...question.typeConfig,
        uploadCategory: category,
        allowedExtensions:
          next.length === extensions.length
            ? []
            : extensions.filter((value) => next.includes(value)),
      },
    });
  }

  return (
    <div className="border-t pt-4">
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Allowed uploads</legend>
        <div className="flex flex-wrap gap-4">
          {(["all", "documents", "images"] as const).map((option) => (
            <label key={option} className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={`${question._id}-upload-category`}
                value={option}
                checked={category === option}
                disabled={!canEdit}
                onChange={() => changeCategory(option)}
              />
              {option === "all" ? "All" : option === "documents" ? "Documents" : "Images"}
            </label>
          ))}
        </div>
      </fieldset>
      {category !== "all" && (
        <div className="mt-4">
          <p className="mb-3 text-sm font-medium">Allowed extensions</p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
            {extensions.map((extension) => (
              <label key={extension} className="inline-flex items-center gap-2 text-sm uppercase">
                <input
                  type="checkbox"
                  checked={selected.includes(extension)}
                  disabled={!canEdit || (selected.length === 1 && selected.includes(extension))}
                  onChange={() => toggleExtension(extension)}
                />
                {extension === "jpg" ? "JPG / JPEG" : extension}
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            All are allowed by default. Uncheck any you want to exclude.
          </p>
        </div>
      )}
    </div>
  );
}

function OptionsEditor({
  options,
  canEdit,
  onChange,
}: {
  options: FormOption[];
  canEdit: boolean;
  onChange: (options: FormOption[]) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function addOption() {
    let number = 1;
    while (options.some((option) => option.value === `Option ${number}`)) number++;
    onChange([...options, { label: `Option ${number}`, value: `Option ${number}` }]);
  }

  return (
    <div className="space-y-3 border-t pt-5">
      <div className="flex items-center justify-between gap-2">
        <Label>Options</Label>
        <span className="text-xs text-muted-foreground">Drag to reorder</span>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
          if (!over || active.id === over.id) return;
          const from = options.findIndex((option) => option.value === active.id);
          const to = options.findIndex((option) => option.value === over.id);
          if (from >= 0 && to >= 0) onChange(arrayMove(options, from, to));
        }}
      >
        <SortableContext
          items={options.map((option) => option.value)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {options.map((option) => (
              <OptionRow
                key={option.value}
                option={option}
                options={options}
                canEdit={canEdit}
                canRemove={options.length > 1}
                onRename={(label) =>
                  onChange(
                    options.map((item) =>
                      item.value === option.value ? { ...item, label, value: label } : item,
                    ),
                  )
                }
                onRemove={() => onChange(options.filter((item) => item.value !== option.value))}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {canEdit && (
        <Button type="button" variant="outline" size="sm" className="w-full" onClick={addOption}>
          <Plus className="size-4" /> Add option
        </Button>
      )}
    </div>
  );
}

function OptionRow({
  option,
  options,
  canEdit,
  canRemove,
  onRename,
  onRemove,
}: {
  option: FormOption;
  options: FormOption[];
  canEdit: boolean;
  canRemove: boolean;
  onRename: (label: string) => void;
  onRemove: () => void;
}) {
  const [draft, setDraft] = useState(option.label);
  const [error, setError] = useState("");
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: option.value,
    disabled: !canEdit,
  });

  useEffect(() => {
    setDraft(option.label);
    setError("");
  }, [option.label, option.value]);

  function commit() {
    const label = draft.trim();
    if (!label) {
      setError("Enter an option.");
      return;
    }
    if (options.some((item) => item.value !== option.value && item.value === label)) {
      setError("Options must be unique.");
      return;
    }
    setError("");
    setDraft(label);
    if (label !== option.label || label !== option.value) onRename(label);
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="space-y-1"
    >
      <div className="flex items-center gap-1">
        {canEdit && (
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label={`Drag ${option.label}`}
            className="inline-flex size-7 shrink-0 items-center justify-center cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
          >
            <GripVertical className="size-4" />
          </button>
        )}
        <Input
          aria-label={`Option ${option.label}`}
          value={draft}
          disabled={!canEdit}
          aria-invalid={!!error}
          onChange={(event) => {
            setDraft(event.target.value);
            setError("");
          }}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
          }}
        />
        {canEdit && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Remove ${option.label}`}
            disabled={!canRemove}
            onClick={onRemove}
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>
      {error && <p className="pl-8 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function NumericSetting({
  id,
  label,
  value,
  onChange,
  disabled,
  integer = false,
  min,
}: {
  id: string;
  label: string;
  value?: number;
  onChange: (value: number | undefined) => void;
  disabled: boolean;
  integer?: boolean;
  min?: number;
}) {
  const [draft, setDraft] = useState(value === undefined ? "" : String(value));
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    setDraft(value === undefined ? "" : String(value));
    setInvalid(false);
  }, [id, value]);

  function commit() {
    if (draft.trim() === "") {
      if (value !== undefined) onChange(undefined);
      setInvalid(false);
      return;
    }
    const parsed = Number(draft);
    if (
      !Number.isFinite(parsed) ||
      (integer && !Number.isInteger(parsed)) ||
      (min !== undefined && parsed < min)
    ) {
      setInvalid(true);
      return;
    }
    setDraft(String(parsed));
    setInvalid(false);
    if (parsed !== value) onChange(parsed);
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        inputMode={integer ? "numeric" : "decimal"}
        step={integer ? 1 : "any"}
        min={min}
        value={draft}
        disabled={disabled}
        aria-invalid={invalid}
        onChange={(event) => {
          setDraft(event.target.value);
          setInvalid(false);
        }}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
      />
      {invalid && (
        <p className="text-xs text-destructive">
          Enter a valid {integer ? "whole number" : "number"}.
        </p>
      )}
    </div>
  );
}
