"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { X, Plus, Trash2 } from "lucide-react"
import type { Field } from "@/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FieldPropertiesPanelProps {
  field: Field | null
  onUpdateField: (fieldId: string, updates: Partial<Field>) => void
  onClose: () => void
}

export function FieldPropertiesPanel({ field, onUpdateField, onClose }: FieldPropertiesPanelProps) {
  if (!field) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">Select a field to edit its properties</p>
      </div>
    )
  }

  const hasOptions = ["select", "radio", "checkbox"].includes(field.type)
  const hasMinMax = ["number", "text", "textarea"].includes(field.type)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Field Properties</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="field-type">Field Type</Label>
          <Select
            value={field.type}
            onValueChange={(value) => onUpdateField(field.id, { type: value as Field["type"] })}
          >
            <SelectTrigger id="field-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="tel">Phone</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="textarea">Long Text</SelectItem>
              <SelectItem value="select">Dropdown</SelectItem>
              <SelectItem value="radio">Multiple Choice</SelectItem>
              <SelectItem value="checkbox">Checkboxes</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="time">Time</SelectItem>
              <SelectItem value="url">URL</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="field-title">Label</Label>
          <Input
            id="field-title"
            value={field.title}
            onChange={(e) => onUpdateField(field.id, { title: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="field-description">Description</Label>
          <Textarea
            id="field-description"
            value={field.description || ""}
            onChange={(e) => onUpdateField(field.id, { description: e.target.value })}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="field-placeholder">Placeholder</Label>
          <Input
            id="field-placeholder"
            value={field.placeholder || ""}
            onChange={(e) => onUpdateField(field.id, { placeholder: e.target.value })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="field-required">Required</Label>
          <Switch
            id="field-required"
            checked={field.required}
            onCheckedChange={(checked) => onUpdateField(field.id, { required: checked })}
          />
        </div>

        {hasOptions && (
          <div className="space-y-2">
            <Label>Options</Label>
            <div className="space-y-2">
              {(field.options || []).map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(field.options || [])]
                      newOptions[index] = e.target.value
                      onUpdateField(field.id, { options: newOptions })
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newOptions = (field.options || []).filter((_, i) => i !== index)
                      onUpdateField(field.id, { options: newOptions })
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`]
                  onUpdateField(field.id, { options: newOptions })
                }}
                className="w-full gap-2"
              >
                <Plus className="w-3 h-3" />
                Add Option
              </Button>
            </div>
          </div>
        )}

        {hasMinMax && field.type === "number" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="field-min">Minimum Value</Label>
              <Input
                id="field-min"
                type="number"
                value={field.min || ""}
                onChange={(e) =>
                  onUpdateField(field.id, { min: e.target.value ? Number.parseInt(e.target.value) : undefined })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="field-max">Maximum Value</Label>
              <Input
                id="field-max"
                type="number"
                value={field.max || ""}
                onChange={(e) =>
                  onUpdateField(field.id, { max: e.target.value ? Number.parseInt(e.target.value) : undefined })
                }
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
