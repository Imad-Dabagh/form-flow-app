"use client";

import { Button } from "@/modules/shared/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/modules/shared/components/ui/popover";
import {
  Type,
  AlignLeft,
  ChevronDown,
  CheckSquare,
  Calendar,
  Link2,
  Upload, // Import Upload icon
  Plus,
} from "lucide-react";
import type { FieldType } from "@/modules/forms/types";

interface AddFieldButtonProps {
  onAddField: (type: FieldType) => void;
}

const FIELD_TYPES: { type: FieldType; label: string; icon: any }[] = [
  { type: "text", label: "Text", icon: Type },
  { type: "textarea", label: "Long Text", icon: AlignLeft },
  { type: "select", label: "Dropdown", icon: ChevronDown },
  { type: "checkbox", label: "Checkboxes", icon: CheckSquare },
  { type: "date", label: "Date", icon: Calendar },
  { type: "url", label: "Website", icon: Link2 },
  { type: "upload", label: "Upload File", icon: Upload },
];

export function AddFieldButton({ onAddField }: AddFieldButtonProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full border-dashed gap-2 text-muted-foreground hover:text-foreground hover:border-solid"
        >
          <Plus className="w-4 h-4" /> Add Field
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-52 p-1" side="bottom">
        <div className="text-xs font-medium text-muted-foreground px-2 py-1.5">
          Generic Fields
        </div>
        <div className="flex flex-col gap-0.5">
          {FIELD_TYPES.map((t) => (
            <button
              key={t.type}
              onClick={() => onAddField(t.type)}
              className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground w-full text-left transition-colors"
            >
              <t.icon className="w-4 h-4 text-muted-foreground" />
              {t.label}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
