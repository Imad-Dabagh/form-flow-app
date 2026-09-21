"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { GripVertical, Trash2 } from "lucide-react";
import { Input } from "@/modules/shared/components/ui/input";
import { Button } from "@/modules/shared/components/ui/button";
import { Textarea } from "@/modules/shared/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Section, Field, FieldType } from "@/modules/forms/types";

// Import our new components
import { FieldCard } from "./field-card";
import { AddFieldButton } from "./add-field-button";

interface BuilderSectionProps {
  section: Section;
  onUpdate: (updates: Partial<Section>) => void;
  onDelete: () => void;
  onAddField: (type: FieldType) => void;
  onUpdateField: (fieldId: string, updates: Partial<Field>) => void;
  onDeleteField: (fieldId: string) => void;
}

export function BuilderSection({
  section,
  onUpdate,
  onDelete,
  onAddField,
  onUpdateField,
  onDeleteField,
}: BuilderSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleAddField = (type: FieldType) => {
    onAddField(type);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-card border rounded-xl shadow-sm transition-all",
        isDragging && "ring-2 ring-primary opacity-50"
      )}
    >
      {/* Section Header */}
      <div className="flex items-start gap-4 p-6 border-b border-border/40">
        <button
          {...attributes}
          {...listeners}
          className="mt-2 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-5 h-5" />
        </button>
        <div className="flex-1 space-y-2">
          <Input
            value={section.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className="text-lg font-semibold border-transparent px-0 h-auto focus-visible:ring-0 hover:border-border/50 transition-colors bg-transparent"
            placeholder="Section Title"
          />
          <Textarea
            value={section.description || ""}
            onChange={(e) => onUpdate({ description: e.target.value })}
            className="text-sm text-muted-foreground border-transparent px-0 min-h-auto focus-visible:ring-0 resize-none hover:border-border/50 transition-colors bg-transparent"
            placeholder="Section description (optional)"
            rows={1}
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Fields List */}
      <div className="p-6 space-y-4 bg-muted/10">
        <SortableContext
          items={section.fields.map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          {section.fields.map((field) => (
            <FieldCard
              key={field.id}
              field={field}
              onUpdate={(updates) => onUpdateField(field.id, updates)}
              onDelete={() => onDeleteField(field.id)}
            />
          ))}
        </SortableContext>

        {/* Add Field Button - Bottom of Section */}
        <div className="pt-2">
          <AddFieldButton onAddField={handleAddField} />
        </div>
      </div>
    </div>
  );
}
