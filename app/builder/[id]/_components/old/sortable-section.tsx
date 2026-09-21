"use client";

import type React from "react";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SortableField } from "./sortable-field";
import type { Section, Field, FieldType } from "@/types";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface SortableSectionProps {
  section: Section;
  onUpdateSection: (sectionId: string, updates: Partial<Section>) => void;
  onDeleteSection: (sectionId: string) => void;
  onAddField: (sectionId: string, field: Field) => void;
  onUpdateField: (fieldId: string, updates: Partial<Field>) => void;
  onDeleteField: (sectionId: string, fieldId: string) => void;
  onSelectField: (fieldId: string) => void;
  selectedFieldId: string | null;
}

export function SortableSection({
  section,
  onUpdateSection,
  onDeleteSection,
  onAddField,
  onUpdateField,
  onDeleteField,
  onSelectField,
  selectedFieldId,
}: SortableSectionProps) {
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const fieldType = e.dataTransfer.getData("fieldType") as FieldType;

    if (fieldType) {
      const newField: Field = {
        id: `field-${Date.now()}`,
        type: fieldType,
        title: `New ${fieldType} field`,
        required: false,
      };

      if (["select", "radio", "checkbox"].includes(fieldType)) {
        newField.options = ["Option 1", "Option 2", "Option 3"];
      }

      onAddField(section.id, newField);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-card border border-border rounded-lg"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="p-4 border-b border-border flex items-center gap-2">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        >
          <GripVertical className="w-5 h-5" />
        </button>
        <Input
          value={section.title}
          onChange={(e) =>
            onUpdateSection(section.id, { title: e.target.value })
          }
          className="flex-1 border-0 bg-transparent px-0 focus-visible:ring-0 font-medium"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDeleteSection(section.id)}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-4">
        {section.fields.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed border-border rounded-lg">
            Drag fields here or click the button below
          </div>
        ) : (
          <SortableContext
            items={section.fields.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {section.fields.map((field) => (
                <SortableField
                  key={field.id}
                  field={field}
                  sectionId={section.id}
                  onUpdateField={onUpdateField}
                  onDeleteField={onDeleteField}
                  onSelectField={onSelectField}
                  isSelected={selectedFieldId === field.id}
                />
              ))}
            </div>
          </SortableContext>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const newField: Field = {
              id: `field-${Date.now()}`,
              type: "text",
              title: "New field",
              required: false,
            };
            onAddField(section.id, newField);
          }}
          className="w-full mt-3 gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Field
        </Button>
      </div>
    </div>
  );
}
