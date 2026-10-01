import {
  AlignLeft,
  ArrowDown,
  ArrowUp,
  CalendarDays,
  ChartNoAxesCombined,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Copy,
  Hash,
  ListFilter,
  Mail,
  Paperclip,
  ToggleLeft,
  Trash2,
  Type,
} from "lucide-react";
import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { FormSection } from "@/router/orgs/forms";
import { Button } from "@/modules/shared/components/ui/button";
import { QuestionCard } from "./question-card";

export function SectionCard({
  section,
  activeQuestionId,
  isDropTarget,
  isFirst,
  isLast,
  canEdit,
  onSelectSection,
  onSelectQuestion,
  onAddQuestion,
  onMoveSectionUp,
  onMoveSectionDown,
  onDuplicateSection,
  onDeleteSection,
  onDuplicateQuestion,
  onDeleteQuestion,
}: {
  section: FormSection;
  activeQuestionId?: string;
  isDropTarget: boolean;
  isFirst: boolean;
  isLast: boolean;
  canEdit: boolean;
  onSelectSection: () => void;
  onSelectQuestion: (questionId: string) => void;
  onAddQuestion: (
    inputType:
      | "string"
      | "text"
      | "email"
      | "number"
      | "select"
      | "radio"
      | "multi-select"
      | "checkboxes"
      | "boolean"
      | "datetime"
      | "linear-scale"
      | "file",
  ) => void;
  onMoveSectionUp: () => void;
  onMoveSectionDown: () => void;
  onDuplicateSection: () => void;
  onDeleteSection: () => void;
  onDuplicateQuestion: (questionId: string) => void;
  onDeleteQuestion: (questionId: string) => void;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { setNodeRef, isOver } = useDroppable({ id: section._id });
  return (
    <div
      ref={setNodeRef}
      className={`overflow-hidden border shadow-sm rounded-xl bg-card ${isOver || isDropTarget ? "border-primary ring-2 ring-primary/20" : ""}`}
    >
      <div className="flex items-start gap-2 pr-3 border-b bg-muted/30">
        <div className="flex items-start flex-1 min-w-0 gap-2 px-4 py-3">
          <button
            type="button"
            aria-label={`${isCollapsed ? "Expand" : "Collapse"} ${section.title}`}
            aria-expanded={!isCollapsed}
            onClick={() => setIsCollapsed((collapsed) => !collapsed)}
            className="inline-flex items-center justify-center rounded-md size-8 shrink-0 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
          <button
            type="button"
            onClick={() => {
              if (isCollapsed) setIsCollapsed(false);
              onSelectSection();
            }}
            className="flex-1 min-w-0 py-1 text-left hover:text-primary"
          >
            <span className="block font-semibold">{section.title}</span>
            {!isCollapsed && section.description && (
              <span className="block mt-1 text-sm text-muted-foreground">
                {section.description}
              </span>
            )}
          </button>
        </div>
        {canEdit && (
          <div className="flex gap-1 pt-3 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              title="Move section up"
              aria-label={`Move ${section.title} up`}
              disabled={isFirst}
              onClick={onMoveSectionUp}
            >
              <ArrowUp className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              title="Move section down"
              aria-label={`Move ${section.title} down`}
              disabled={isLast}
              onClick={onMoveSectionDown}
            >
              <ArrowDown className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              title="Duplicate section"
              aria-label={`Duplicate ${section.title}`}
              onClick={onDuplicateSection}
            >
              <Copy className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              title="Delete section"
              aria-label={`Delete ${section.title}`}
              onClick={onDeleteSection}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        )}
      </div>
      {!isCollapsed && (
        <div className="p-4 space-y-3">
          {section.questions.length === 0 && (
            <p
              className={`px-4 text-sm text-center border border-dashed rounded-lg py-7 ${isDropTarget ? "border-primary bg-primary/5 text-primary" : "text-muted-foreground"}`}
            >
              {isDropTarget
                ? "Release to move the question here"
                : "No questions in this section yet."}
            </p>
          )}
          <SortableContext
            items={section.questions.map((question) => question._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {section.questions.map((question) => (
                <QuestionCard
                  key={question._id}
                  question={question}
                  canEdit={canEdit}
                  isActive={activeQuestionId === question._id}
                  onSelect={() => onSelectQuestion(question._id)}
                  onDuplicate={() => onDuplicateQuestion(question._id)}
                  onDelete={() => onDeleteQuestion(question._id)}
                />
              ))}
            </div>
          </SortableContext>
          {canEdit && (
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onAddQuestion("string")}
              >
                <Type className="size-4" /> Short text
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onAddQuestion("text")}
              >
                <AlignLeft className="size-4" /> Long text
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onAddQuestion("email")}
              >
                <Mail className="size-4" /> Email
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onAddQuestion("number")}
              >
                <Hash className="size-4" /> Number
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onAddQuestion("select")}
              >
                <ListFilter className="size-4" /> Dropdown
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onAddQuestion("radio")}
              >
                <CircleDot className="size-4" /> Single choice
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onAddQuestion("multi-select")}
              >
                <ListFilter className="size-4" /> Multi select
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onAddQuestion("checkboxes")}
              >
                <CheckSquare className="size-4" /> Checkboxes
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onAddQuestion("boolean")}
              >
                <ToggleLeft className="size-4" /> True / False
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onAddQuestion("datetime")}
              >
                <CalendarDays className="size-4" /> Date / Time
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onAddQuestion("linear-scale")}
              >
                <ChartNoAxesCombined className="size-4" /> Linear scale
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onAddQuestion("file")}
              >
                <Paperclip className="size-4" /> File upload
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
