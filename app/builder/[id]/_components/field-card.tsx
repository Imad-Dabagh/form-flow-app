"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Plus, X, Upload, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Field } from "@/types";

interface FieldCardProps {
  field: Field;
  onUpdate: (updates: Partial<Field>) => void;
  onDelete: () => void;
}

export function FieldCard({ field, onUpdate, onDelete }: FieldCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const hasOptions = ["select", "radio", "checkbox"].includes(field.type);

  // Helper to render the visual preview of the input field
  const renderInputPreview = () => {
    switch (field.type) {
      case "text":
      case "url":
      case "email":
        return (
          <Input
            disabled
            placeholder={`Short answer text (${field.type})`}
            className="bg-muted/30 border-dashed"
          />
        );

      case "textarea":
        return (
          <Textarea
            disabled
            placeholder="Long answer text"
            className="bg-muted/30 border-dashed min-h-[120px] resize-none"
          />
        );

      case "date":
        return (
          <Button
            variant="outline"
            disabled
            className="w-full justify-start text-left font-normal border-dashed bg-muted/30"
          >
            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Pick a date</span>
          </Button>
        );

      case "upload":
        return (
          <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-4 flex items-center justify-center gap-2 text-muted-foreground bg-muted/10 cursor-pointer">
            <Upload className="w-5 h-5 opacity-50" />
            <span className="text-sm font-medium">Click to upload a file</span>
          </div>
        );

      case "select":
      case "radio":
      case "checkbox":
        return null;

      default:
        return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative bg-card border rounded-lg p-4 transition-all",
        isDragging && "shadow-xl z-50",
        !isDragging && "hover:border-primary/50"
      )}
    >
      {/* --- Header Row: Drag Handle | Type Label | Required | Delete --- */}
      <div className="flex items-center gap-3 mb-3">
        <button
          {...attributes}
          {...listeners}
          className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 px-2 py-1 bg-muted rounded text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {field.type}
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id={`req-${field.id}`}
              checked={field.required}
              onCheckedChange={(c) => onUpdate({ required: c })}
            />
            <Label
              htmlFor={`req-${field.id}`}
              className="text-xs font-medium cursor-pointer"
            >
              Required
            </Label>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* --- Main Content: Editable Label & Description --- */}
      <div className="pl-7 space-y-3">
        {/* Label Editor */}
        <Input
          value={field.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="font-medium text-base border-transparent hover:border-border focus:border-input px-2 -ml-2 h-auto py-1 transition-colors"
          placeholder="Field Label"
        />

        {/* Description Editor */}
        <Textarea
          value={field.description || ""}
          onChange={(e) => onUpdate({ description: e.target.value })}
          className="text-sm text-muted-foreground border-transparent hover:border-border focus:border-input px-2 -ml-2 min-h-10 py-1 resize-none transition-colors"
          placeholder="Add a description (optional)"
        />

        {/* --- Visual Preview of the Input --- */}
        <div className="pt-2">{renderInputPreview()}</div>

        {/* --- Options Editor (Only for Select/Checkbox/Radio) --- */}
        {hasOptions && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <Label className="text-xs text-muted-foreground mb-2 block uppercase tracking-wider">
              Options
            </Label>
            <div className="space-y-2">
              {field.options?.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2 group/opt">
                  <div
                    className={cn(
                      "w-4 h-4 border border-muted-foreground/30",
                      field.type === "radio" ? "rounded-full" : "rounded-sm"
                    )}
                  />
                  <Input
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...(field.options || [])];
                      newOpts[idx] = e.target.value;
                      onUpdate({ options: newOpts });
                    }}
                    className="h-8 text-sm"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover/opt:opacity-100 transition-opacity"
                    onClick={() => {
                      const newOpts = field.options?.filter(
                        (_, i) => i !== idx
                      );
                      onUpdate({ options: newOpts });
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary h-8 px-0 ml-6"
                onClick={() => {
                  const newOpts = [
                    ...(field.options || []),
                    `Option ${(field.options?.length || 0) + 1}`,
                  ];
                  onUpdate({ options: newOpts });
                }}
              >
                <Plus className="w-3 h-3 mr-2" /> Add Option
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
