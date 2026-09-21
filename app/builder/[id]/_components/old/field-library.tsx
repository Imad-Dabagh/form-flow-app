"use client"

import type React from "react"

import {
  Text,
  Mail,
  Phone,
  Calendar,
  Clock,
  Link2,
  Hash,
  AlignLeft,
  CheckSquare,
  Circle,
  ChevronDown,
} from "lucide-react"
import type { FieldType } from "@/types"

const fieldTypes: { type: FieldType; label: string; icon: React.ReactNode }[] = [
  { type: "text", label: "Text", icon: <Text className="w-4 h-4" /> },
  { type: "email", label: "Email", icon: <Mail className="w-4 h-4" /> },
  { type: "tel", label: "Phone", icon: <Phone className="w-4 h-4" /> },
  { type: "number", label: "Number", icon: <Hash className="w-4 h-4" /> },
  { type: "textarea", label: "Long Text", icon: <AlignLeft className="w-4 h-4" /> },
  { type: "select", label: "Dropdown", icon: <ChevronDown className="w-4 h-4" /> },
  { type: "radio", label: "Multiple Choice", icon: <Circle className="w-4 h-4" /> },
  { type: "checkbox", label: "Checkboxes", icon: <CheckSquare className="w-4 h-4" /> },
  { type: "date", label: "Date", icon: <Calendar className="w-4 h-4" /> },
  { type: "time", label: "Time", icon: <Clock className="w-4 h-4" /> },
  { type: "url", label: "URL", icon: <Link2 className="w-4 h-4" /> },
]

export function FieldLibrary() {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-3">Field Types</h3>
      <div className="space-y-1">
        {fieldTypes.map((field) => (
          <div
            key={field.type}
            className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer text-sm"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("fieldType", field.type)
            }}
          >
            {field.icon}
            <span className="text-foreground">{field.label}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-4">Drag fields to sections to add them</p>
    </div>
  )
}
