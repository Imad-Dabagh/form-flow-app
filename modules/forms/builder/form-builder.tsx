"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFormsStore } from "@/modules/forms/lib/forms-store";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  defaultDropAnimationSideEffects,
  type DropAnimation,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import {
  ArrowLeft,
  Save,
  Plus,
  Loader2,
  Settings,
  Share2,
  Eye,
} from "lucide-react";
import { Button } from "@/modules/shared/components/ui/button";
import { Input } from "@/modules/shared/components/ui/input";
import { Textarea } from "@/modules/shared/components/ui/textarea";
import { Label } from "@/modules/shared/components/ui/label";
import { useToast } from "@/modules/shared/hooks/use-toast";
import type { Section, Field, FieldType } from "@/modules/forms/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/modules/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/shared/components/ui/select";

import { BuilderSection } from "./components/builder-section";
import { FieldCard } from "./components/field-card";

const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: "0.5" } },
  }),
};

export function FormBuilder() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();

  // FIX: Use Selector for reactivity
  const form = useFormsStore((state) => state.forms.find((f) => f.id === id));
  const updateForm = useFormsStore((state) => state.updateForm);

  // --- State ---
  const [sections, setSections] = useState<Section[]>([]);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState("draft");
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<Section | Field | null>(null);

  useEffect(() => {
    if (form) {
      setSections(form.content);
      setFormTitle(form.title);
      setFormDescription(form.description || "");
      // IMPORTANT: Ensure status is synced from store
      setFormStatus(form.status);
    }
  }, [form]);

  // ... (Sensors and Drag handlers remain exactly the same as previous)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleSave = () => {
    if (!form) return;

    updateForm(id, {
      title: formTitle,
      description: formDescription,
      status: formStatus as "draft" | "published",
      content: sections,
    });

    toast({
      title: "Saved",
      description: "Form layout and settings saved successfully.",
    });
  };

  // ... (Rest of functions: handleAddSection, handleUpdateSection, handleAddField etc. - reuse previous implementation)
  const handleCopyShareLink = () => {
    const url = `${window.location.origin}/form/${id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied",
      description: "Form link copied to clipboard",
    });
  };

  const handleAddSection = () => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      title: "Untitled Section",
      description: "",
      fields: [],
    };
    setSections([...sections, newSection]);
  };

  const handleDeleteSection = (sectionId: string) =>
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
  const handleUpdateSection = (sectionId: string, updates: Partial<Section>) =>
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, ...updates } : s))
    );

  const handleAddField = (sectionId: string, type: FieldType) => {
    const newField: Field = {
      id: `field-${Date.now()}`,
      type,
      title: type === "text" ? "Untitled Question" : `New ${type}`,
      required: false,
      options: ["select", "radio", "checkbox"].includes(type)
        ? ["Option 1", "Option 2"]
        : undefined,
    };
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, fields: [...s.fields, newField] } : s
      )
    );
  };

  const handleUpdateField = (fieldId: string, updates: Partial<Field>) =>
    setSections((prev) =>
      prev.map((s) => ({
        ...s,
        fields: s.fields.map((f) =>
          f.id === fieldId ? { ...f, ...updates } : f
        ),
      }))
    );
  const handleDeleteField = (fieldId: string) =>
    setSections((prev) =>
      prev.map((s) => ({
        ...s,
        fields: s.fields.filter((f) => f.id !== fieldId),
      }))
    );

  const findSectionContainer = (id: string): Section | undefined =>
    sections.find((s) => s.fields.some((f) => f.id === id));

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const id = active.id as string;
    setActiveId(id);
    const section = sections.find((s) => s.id === id);
    if (section) {
      setActiveItem(section);
      return;
    }
    const fieldSection = findSectionContainer(id);
    const field = fieldSection?.fields.find((f) => f.id === id);
    if (field) setActiveItem(field);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    if (sections.some((s) => s.id === activeId)) return;
    const activeSection = findSectionContainer(activeId);
    const overSection =
      findSectionContainer(overId) || sections.find((s) => s.id === overId);
    if (!activeSection || !overSection) return;
    if (activeSection.id !== overSection.id) {
      setSections((prev) => {
        const activeSecIndex = prev.findIndex((s) => s.id === activeSection.id);
        const overSecIndex = prev.findIndex((s) => s.id === overSection.id);
        return prev.map((section, index) => {
          if (index === activeSecIndex)
            return {
              ...section,
              fields: section.fields.filter((f) => f.id !== activeId),
            };
          else if (index === overSecIndex) {
            const activeField = activeSection.fields.find(
              (f) => f.id === activeId
            )!;
            if (section.fields.some((f) => f.id === activeId)) return section;
            return { ...section, fields: [...section.fields, activeField] };
          }
          return section;
        });
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveItem(null);
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const activeSectionIndex = sections.findIndex((s) => s.id === activeId);
    if (activeSectionIndex !== -1) {
      const overSectionIndex = sections.findIndex((s) => s.id === overId);
      if (overSectionIndex !== -1)
        setSections((prev) =>
          arrayMove(prev, activeSectionIndex, overSectionIndex)
        );
      return;
    }

    const activeContainer = findSectionContainer(activeId);
    const overContainer = findSectionContainer(overId);
    if (
      activeContainer &&
      overContainer &&
      activeContainer.id === overContainer.id
    ) {
      const activeIndex = activeContainer.fields.findIndex(
        (f) => f.id === activeId
      );
      const overIndex = activeContainer.fields.findIndex(
        (f) => f.id === overId
      );
      if (activeIndex !== overIndex) {
        setSections((prev) =>
          prev.map((s) =>
            s.id === activeContainer.id
              ? { ...s, fields: arrayMove(s.fields, activeIndex, overIndex) }
              : s
          )
        );
      }
    }
  };

  if (!form) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/5">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container max-w-5xl px-4 py-3 mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/dashboard")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {formTitle}
                </h1>
                <p className="text-sm text-muted-foreground">Form Builder</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettingsDialog(true)}
                className="gap-2"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyShareLink}
                className="gap-2 bg-transparent"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/form/${id}`)}
                className="gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview
              </Button>
              <Button onClick={handleSave} className="gap-2">
                <Save className="w-4 h-4" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container flex-1 max-w-3xl px-4 py-8 mx-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="pb-20 space-y-6">
              {sections.length === 0 && (
                <div className="py-10 text-center border-2 border-dashed rounded-xl bg-card">
                  <p className="mb-4 text-muted-foreground">
                    Your form is empty. Start by adding a section.
                  </p>
                  <Button onClick={handleAddSection}>Add Section</Button>
                </div>
              )}
              {sections.map((section) => (
                <BuilderSection
                  key={section.id}
                  section={section}
                  onUpdate={(updates) =>
                    handleUpdateSection(section.id, updates)
                  }
                  onDelete={() => handleDeleteSection(section.id)}
                  onAddField={(type) => handleAddField(section.id, type)}
                  onUpdateField={handleUpdateField}
                  onDeleteField={handleDeleteField}
                />
              ))}
              {sections.length > 0 && (
                <div className="flex justify-center pt-8 pb-12">
                  <Button
                    onClick={handleAddSection}
                    variant="secondary"
                    size="lg"
                    className="gap-2 border shadow-sm hover:bg-muted-foreground/10"
                  >
                    <Plus className="w-5 h-5" />
                    Add Another Section
                  </Button>
                </div>
              )}
            </div>
          </SortableContext>
          <DragOverlay dropAnimation={dropAnimationConfig}>
            {activeId ? (
              sections.find((s) => s.id === activeId) ? (
                <div className="opacity-90 rotate-2 cursor-grabbing">
                  <BuilderSection
                    section={activeItem as Section}
                    onUpdate={() => {}}
                    onDelete={() => {}}
                    onAddField={() => {}}
                    onUpdateField={() => {}}
                    onDeleteField={() => {}}
                  />
                </div>
              ) : (
                <div className="opacity-90 rotate-2 cursor-grabbing w-[600px]">
                  <FieldCard
                    field={activeItem as Field}
                    onUpdate={() => {}}
                    onDelete={() => {}}
                  />
                </div>
              )
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>

      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Form Settings</DialogTitle>
            <DialogDescription>Configure your form settings</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="form-title">Form Title</Label>
              <Input
                id="form-title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="form-description">Description</Label>
              <Textarea
                id="form-description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="form-status">Status</Label>
              <Select value={formStatus} onValueChange={setFormStatus}>
                <SelectTrigger id="form-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSettingsDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                handleSave();
                setShowSettingsDialog(false);
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
