"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type CollisionDetection,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { ArrowLeft, Eye, FileText, Plus, Save } from "lucide-react";
import { toast } from "sonner";
import API from "@/router";
import type { FormQuestion, OrganizationFormDetails } from "@/router/orgs/forms";
import { toApiError } from "@/lib/api-error";
import { organizationWorkspacePath, useOrganizationPermissions } from "@/modules/organizations";
import { Button } from "@/modules/shared/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/modules/shared/components/ui/alert-dialog";
import { RichTextEditor } from "@/modules/shared/components/rich-text-editor";
import { SectionCard } from "./components/section-card";
import { QuestionCardDragPreview } from "./components/question-card";
import { SidebarSettings } from "./components/sidebar-settings";
import { useFormBuilder } from "./hooks/use-form-builder";

export function FormBuilderTemplate() {
  const { organizationSlug, formId } = useParams<{
    organizationSlug: string;
    formId: string;
  }>();
  const { canManageForms } = useOrganizationPermissions();
  const { form, error, isLoading } = API.orgs.forms.useFindById({
    organizationSlug,
    formId,
  });

  if (isLoading)
    return (
      <div className="max-w-6xl px-4 py-10 mx-auto text-sm text-muted-foreground">
        Loading form…
      </div>
    );
  if (error || !form)
    return (
      <div className="max-w-6xl px-4 py-10 mx-auto text-sm text-destructive">
        {error?.message ?? "Form not found."}
      </div>
    );

  return (
    <Builder
      key={form.id}
      form={form}
      organizationSlug={organizationSlug}
      canEdit={canManageForms}
    />
  );
}

function Builder({
  form,
  organizationSlug,
  canEdit,
}: {
  form: OrganizationFormDetails;
  organizationSlug: string;
  canEdit: boolean;
}) {
  const editor = useFormBuilder(form);
  const [draggedQuestion, setDraggedQuestion] = useState<FormQuestion | null>(null);
  const [dropSectionId, setDropSectionId] = useState<string | null>(null);
  const dragStart = useRef<{
    sections: typeof editor.draft.sections;
    isDirty: boolean;
    selection: typeof editor.selection;
    lastCrossOverId?: string;
  } | null>(null);
  const dragSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const [pendingDelete, setPendingDelete] = useState<
    | { kind: "section"; sectionId: string; title: string }
    | { kind: "question"; sectionId: string; questionId: string; title: string }
    | null
  >(null);
  const { trigger: save, isMutating } = API.orgs.forms.useUpdateById({
    organizationSlug,
    formId: form.id,
  });
  const selectedSection = editor.selection
    ? editor.draft.sections.find((section) => section._id === editor.selection?.sectionId)
    : undefined;
  const selectedQuestionId =
    editor.selection?.kind === "question" ? editor.selection.questionId : undefined;
  const selectedQuestion = selectedSection?.questions.find(
    (question) => question._id === selectedQuestionId,
  );

  const detectCollision: CollisionDetection = (args) => {
    const droppableContainers = args.droppableContainers.filter(
      (container) => container.id !== args.active.id,
    );
    const candidates = { ...args, droppableContainers };
    const pointerHits = pointerWithin(candidates);
    const sectionIds = new Set(editor.draft.sections.map((section) => section._id));
    const questionHit = pointerHits.find((hit) => !sectionIds.has(String(hit.id)));
    if (questionHit) return [questionHit];
    if (pointerHits.length) return [pointerHits[0]];
    return args.pointerCoordinates ? [] : closestCenter(candidates);
  };

  function restoreDrag() {
    if (dragStart.current) {
      editor.restoreDrag(
        dragStart.current.sections,
        dragStart.current.isDirty,
        dragStart.current.selection,
      );
    }
  }

  function clearDrag() {
    dragStart.current = null;
    setDraggedQuestion(null);
    setDropSectionId(null);
  }

  function confirmDelete() {
    if (pendingDelete?.kind === "section") editor.deleteSection(pendingDelete.sectionId);
    if (pendingDelete?.kind === "question")
      editor.deleteQuestion(pendingDelete.sectionId, pendingDelete.questionId);
    setPendingDelete(null);
  }

  async function handleSave() {
    for (const section of editor.draft.sections) {
      if (!section.title.trim()) {
        editor.setSelection({ kind: "section", sectionId: section._id });
        return toast.error("Every section needs a title.");
      }
      for (const question of section.questions) {
        if (!question.title.trim()) {
          editor.setSelection({
            kind: "question",
            sectionId: section._id,
            questionId: question._id,
          });
          return toast.error("Every question needs a label.");
        }
        if (["select", "radio", "multi-select", "checkboxes"].includes(question.inputType)) {
          const options = question.options ?? [];
          const values = options.map((option) => option.value.trim());
          if (
            !options.length ||
            options.some((option) => !option.label.trim()) ||
            values.some((value) => !value) ||
            new Set(values).size !== values.length
          ) {
            editor.setSelection({
              kind: "question",
              sectionId: section._id,
              questionId: question._id,
            });
            return toast.error(`Add at least one unique, named option for “${question.title}”.`);
          }
        }
        if (question.inputType === "linear-scale") {
          const scaleMin = question.typeConfig?.min ?? 1;
          const scaleMax = question.typeConfig?.max ?? 5;
          if (![0, 1].includes(scaleMin) || scaleMax < 2 || scaleMax > 10 || scaleMin >= scaleMax) {
            editor.setSelection({
              kind: "question",
              sectionId: section._id,
              questionId: question._id,
            });
            return toast.error(`Choose a valid range for “${question.title}”.`);
          }
        }
        const { min, max, minLength, maxLength } = question.validation ?? {};
        if (
          question.inputType === "number" &&
          min !== undefined &&
          max !== undefined &&
          min > max
        ) {
          editor.setSelection({
            kind: "question",
            sectionId: section._id,
            questionId: question._id,
          });
          return toast.error(`The minimum for “${question.title}” must not exceed the maximum.`);
        }
        if (
          question.inputType === "email" &&
          minLength !== undefined &&
          maxLength !== undefined &&
          minLength > maxLength
        ) {
          editor.setSelection({
            kind: "question",
            sectionId: section._id,
            questionId: question._id,
          });
          return toast.error(
            `The minimum length for “${question.title}” must not exceed the maximum.`,
          );
        }
      }
    }
    try {
      const updated = await save(editor.draft);
      editor.markSaved(updated);
      toast.success("Form saved");
    } catch (error) {
      toast.error(toApiError(error).message);
    }
  }

  return (
    <div className="w-full px-4 pb-10 mx-auto max-w-7xl pt-7 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Button asChild size="sm" variant="ghost" className="gap-2">
          <Link href={organizationWorkspacePath(organizationSlug, "/forms")}>
            <ArrowLeft className="size-4" /> Forms
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="gap-2">
          <Link
            href={organizationWorkspacePath(organizationSlug, `/forms/${form.id}/preview`)}
            onClick={(event) => {
              if (editor.isDirty) {
                event.preventDefault();
                toast.info("Save your changes before previewing the form.");
              }
            }}
          >
            <Eye className="size-4" /> Preview
          </Link>
        </Button>
      </div>

      <fieldset disabled={isMutating} className="min-w-0 disabled:opacity-80">
        <RichTextEditor
          id="form-description"
          ariaLabel="Form description"
          value={editor.draft.description}
          disabled={!canEdit || isMutating}
          minHeight={190}
          className="rounded-xl border-border bg-card shadow-sm [&_.rich-text-editor-content]:p-5"
          placeholder="Add a description to introduce this form"
          onChange={editor.updateDescription}
        />
        <div
          className={`mt-8 grid items-start gap-6 ${selectedSection ? "lg:grid-cols-[minmax(0,1fr)_20rem]" : "grid-cols-1"}`}
        >
          <div className="flex min-w-0 flex-col gap-5 self-stretch">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold">Sections & questions</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Build the content people will fill out.
                </p>
              </div>
              {canEdit && (
                <Button type="button" size="sm" onClick={editor.addSection}>
                  <Plus className="size-4" /> Add section
                </Button>
              )}
            </div>

            {editor.draft.sections.length === 0 && (
              <div className="px-6 text-center border border-dashed rounded-xl bg-muted/20 py-14">
                <FileText className="mx-auto size-8 text-muted-foreground" />
                <h2 className="mt-4 font-medium">Start with a section</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Sections group related questions together.
                </p>
                {canEdit && (
                  <Button type="button" className="mt-5" onClick={editor.addSection}>
                    <Plus className="size-4" /> Add section
                  </Button>
                )}
              </div>
            )}

            <DndContext
              sensors={dragSensors}
              collisionDetection={detectCollision}
              onDragStart={({ active }) => {
                const question = editor.draft.sections
                  .flatMap((section) => section.questions)
                  .find((item) => item._id === active.id);
                if (!question) return;
                dragStart.current = {
                  sections: editor.draft.sections,
                  isDirty: editor.isDirty,
                  selection: editor.selection,
                };
                setDraggedQuestion(question);
              }}
              onDragOver={({ active, over }) => {
                if (!over) {
                  setDropSectionId(null);
                  return;
                }
                const overId = String(over.id);
                const section = editor.draft.sections.find(
                  (item) =>
                    item._id === overId ||
                    item.questions.some((question) => question._id === overId),
                );
                setDropSectionId(section?._id ?? null);
                if (
                  editor.moveQuestionAcrossSections(String(active.id), overId) &&
                  dragStart.current
                ) {
                  dragStart.current.lastCrossOverId = overId;
                }
              }}
              onDragEnd={({ active, over }) => {
                if (over) {
                  const overId = String(over.id);
                  if (overId !== dragStart.current?.lastCrossOverId) {
                    editor.dropQuestion(String(active.id), overId);
                  }
                } else restoreDrag();
                clearDrag();
              }}
              onDragCancel={() => {
                restoreDrag();
                clearDrag();
              }}
            >
              {editor.draft.sections.map((section, index) => (
                <SectionCard
                  key={section._id}
                  section={section}
                  canEdit={canEdit}
                  isDropTarget={draggedQuestion !== null && dropSectionId === section._id}
                  activeQuestionId={
                    editor.selection?.kind === "question" &&
                    editor.selection.sectionId === section._id
                      ? editor.selection.questionId
                      : undefined
                  }
                  isFirst={index === 0}
                  isLast={index === editor.draft.sections.length - 1}
                  onSelectSection={() =>
                    editor.setSelection({
                      kind: "section",
                      sectionId: section._id,
                    })
                  }
                  onSelectQuestion={(questionId) =>
                    editor.setSelection({
                      kind: "question",
                      sectionId: section._id,
                      questionId,
                    })
                  }
                  onAddQuestion={(inputType) => editor.addQuestion(section._id, inputType)}
                  onMoveSectionUp={() => editor.moveSection(section._id, "up")}
                  onMoveSectionDown={() => editor.moveSection(section._id, "down")}
                  onDuplicateSection={() => editor.duplicateSection(section._id)}
                  onDeleteSection={() =>
                    setPendingDelete({
                      kind: "section",
                      sectionId: section._id,
                      title: section.title,
                    })
                  }
                  onDuplicateQuestion={(questionId) =>
                    editor.duplicateQuestion(section._id, questionId)
                  }
                  onDeleteQuestion={(questionId) => {
                    const question = section.questions.find((item) => item._id === questionId);
                    if (question)
                      setPendingDelete({
                        kind: "question",
                        sectionId: section._id,
                        questionId,
                        title: question.title,
                      });
                  }}
                />
              ))}
              <DragOverlay
                dropAnimation={{ duration: 120, easing: "cubic-bezier(0.25, 1, 0.5, 1)" }}
                zIndex={50}
              >
                {draggedQuestion ? <QuestionCardDragPreview question={draggedQuestion} /> : null}
              </DragOverlay>
            </DndContext>

            {canEdit && editor.draft.sections.length > 0 && (
              <button
                type="button"
                onClick={editor.addSection}
                className="flex min-h-[3.75rem] w-full items-center justify-center gap-2 rounded-xl border-2 border-dotted border-border bg-card/50 px-4 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/60 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Plus className="size-4" /> Add section
              </button>
            )}

            {canEdit && (
              <div className="sticky bottom-4 z-20 mt-auto flex flex-col gap-4 rounded-xl border bg-card/95 p-4 shadow-lg backdrop-blur-sm sm:bottom-6 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <span
                  role="status"
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <span
                    className={`size-2 rounded-full ${editor.isDirty ? "bg-amber-500" : "bg-emerald-500"}`}
                  />
                  {editor.isDirty ? "Unsaved changes" : "All changes saved"}
                </span>
                <Button
                  type="button"
                  className="sm:ml-auto"
                  disabled={isMutating || !editor.isDirty}
                  onClick={handleSave}
                >
                  <Save className="size-4" /> {isMutating ? "Saving…" : "Save changes"}
                </Button>
              </div>
            )}
          </div>

          {selectedSection && (
            <SidebarSettings
              section={selectedSection}
              question={selectedQuestion}
              canEdit={canEdit}
              onClose={() => editor.setSelection(null)}
              onUpdateSection={(updates) => editor.updateSection(selectedSection._id, updates)}
              onUpdateQuestion={(updates) =>
                selectedQuestion &&
                editor.updateQuestion(selectedSection._id, selectedQuestion._id, updates)
              }
            />
          )}
        </div>
      </fieldset>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {pendingDelete?.kind === "section" ? "section" : "question"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete?.kind === "section"
                ? `“${pendingDelete.title}” and all its questions will be removed from this form.`
                : `“${pendingDelete?.title}” will be removed from this section.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="text-white bg-destructive hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
