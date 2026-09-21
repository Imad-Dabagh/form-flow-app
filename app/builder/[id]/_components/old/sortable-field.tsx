"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Field } from "@/types";
import { cn } from "@/lib/utils";

interface SortableFieldProps {
  field: Field;
  sectionId: string;
  onUpdateField: (fieldId: string, updates: Partial<Field>) => void;
  onDeleteField: (sectionId: string, fieldId: string) => void;
  onSelectField: (fieldId: string) => void;
  isSelected: boolean;
}

export function SortableField({
  field,
  sectionId,
  onDeleteField,
  onSelectField,
  isSelected,
}: SortableFieldProps) {
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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelectField(field.id)}
      className={cn(
        "bg-muted/50 border rounded-lg p-3 flex items-start gap-2 cursor-pointer hover:border-primary/50",
        isSelected && "border-primary ring-2 ring-primary/20"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground mt-0.5"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-foreground">
          {field.title}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </div>
        {field.description && (
          <div className="text-xs text-muted-foreground mt-1">
            {field.description}
          </div>
        )}
        <div className="text-xs text-muted-foreground mt-1 capitalize">
          {field.type}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onDeleteField(sectionId, field.id);
        }}
        className="text-muted-foreground hover:text-destructive h-8 w-8"
      >
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>
  );
}
