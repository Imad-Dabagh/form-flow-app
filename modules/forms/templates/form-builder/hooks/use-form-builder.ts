import { useState } from "react";
import { uid } from "uid/secure";
import type {
  FormQuestion,
  FormSection,
  OrganizationFormDetails,
  UpdateOrganizationFormContentInput,
} from "@/router/orgs/forms";

type Selection =
  | { kind: "section"; sectionId: string }
  | { kind: "question"; sectionId: string; questionId: string }
  | null;

function editableForm(form: OrganizationFormDetails): UpdateOrganizationFormContentInput {
  return {
    description: form.description,
    sections: form.sections,
  };
}

export function useFormBuilder(initialForm: OrganizationFormDetails) {
  const [draft, setDraft] = useState(() => editableForm(initialForm));
  const [selection, setSelection] = useState<Selection>(null);
  const [isDirty, setIsDirty] = useState(false);

  function changeDraft(
    update: (current: UpdateOrganizationFormContentInput) => UpdateOrganizationFormContentInput,
  ) {
    setDraft(update);
    setIsDirty(true);
  }

  function updateDescription(description: string) {
    if (description === draft.description) return;
    changeDraft((current) => ({ ...current, description }));
  }

  function addSection() {
    const section: FormSection = {
      _id: uid(),
      title: "New section",
      description: "",
      isHidden: false,
      questions: [],
    };
    changeDraft((current) => ({ ...current, sections: [...current.sections, section] }));
    setSelection({ kind: "section", sectionId: section._id });
  }

  function updateSection(sectionId: string, updates: Partial<FormSection>) {
    changeDraft((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section._id === sectionId ? { ...section, ...updates } : section,
      ),
    }));
  }

  function duplicateSection(sectionId: string) {
    const source = draft.sections.find((section) => section._id === sectionId);
    if (!source) return;
    const copy: FormSection = {
      ...source,
      _id: uid(),
      title: `${source.title} (copy)`,
      questions: source.questions.map((question) => ({
        ...question,
        _id: uid(),
      })),
    };
    changeDraft((current) => {
      const index = current.sections.findIndex((section) => section._id === sectionId);
      const sections = [...current.sections];
      sections.splice(index + 1, 0, copy);
      return { ...current, sections };
    });
    setSelection({ kind: "section", sectionId: copy._id });
  }

  function deleteSection(sectionId: string) {
    changeDraft((current) => ({
      ...current,
      sections: current.sections.filter((section) => section._id !== sectionId),
    }));
    if (selection?.sectionId === sectionId) setSelection(null);
  }

  function moveSection(sectionId: string, direction: "up" | "down") {
    const index = draft.sections.findIndex((section) => section._id === sectionId);
    const target = index + (direction === "up" ? -1 : 1);
    if (index < 0 || target < 0 || target >= draft.sections.length) return;
    changeDraft((current) => {
      const sections = [...current.sections];
      [sections[index], sections[target]] = [sections[target], sections[index]];
      return { ...current, sections };
    });
  }

  function addQuestion(
    sectionId: string,
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
  ) {
    const titles = {
      string: "Short text",
      text: "Long text",
      email: "Email address",
      number: "Number",
      select: "Dropdown",
      radio: "Single choice",
      "multi-select": "Multiple choice dropdown",
      checkboxes: "Checkboxes",
      boolean: "True / False",
      datetime: "Select date",
      "linear-scale": "Linear scale",
      file: "Upload file",
    };
    const question: FormQuestion = {
      _id: uid(),
      title: titles[inputType],
      description: "",
      placeholder: "",
      inputType,
      isRequired: false,
      defaultValue: inputType === "boolean" ? false : inputType === "linear-scale" ? null : "",
      ...(inputType === "datetime"
        ? { typeConfig: { type: "date" as const, format: "DD MMM YYYY" } }
        : {}),
      ...(inputType === "linear-scale"
        ? { typeConfig: { min: 1, max: 5, minLabel: "", maxLabel: "" } }
        : {}),
      ...(inputType === "file"
        ? { typeConfig: { uploadCategory: "all" as const, allowedExtensions: [] } }
        : {}),
      ...(["select", "radio", "multi-select", "checkboxes"].includes(inputType)
        ? {
            options: [
              { label: "Option 1", value: "Option 1" },
              { label: "Option 2", value: "Option 2" },
            ],
          }
        : {}),
    };
    changeDraft((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section._id === sectionId
          ? { ...section, questions: [...section.questions, question] }
          : section,
      ),
    }));
    setSelection({ kind: "question", sectionId, questionId: question._id });
  }

  function updateQuestion(sectionId: string, questionId: string, updates: Partial<FormQuestion>) {
    changeDraft((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section._id === sectionId
          ? {
              ...section,
              questions: section.questions.map((question) =>
                question._id === questionId ? { ...question, ...updates } : question,
              ),
            }
          : section,
      ),
    }));
  }

  function duplicateQuestion(sectionId: string, questionId: string) {
    const source = draft.sections
      .find((section) => section._id === sectionId)
      ?.questions.find((question) => question._id === questionId);
    if (!source) return;
    const copy: FormQuestion = {
      ...source,
      _id: uid(),
      title: `${source.title} (copy)`,
    };
    changeDraft((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section._id !== sectionId) return section;
        const questions = [...section.questions];
        const index = questions.findIndex((question) => question._id === questionId);
        questions.splice(index + 1, 0, copy);
        return { ...section, questions };
      }),
    }));
    setSelection({ kind: "question", sectionId, questionId: copy._id });
  }

  function deleteQuestion(sectionId: string, questionId: string) {
    changeDraft((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section._id === sectionId
          ? {
              ...section,
              questions: section.questions.filter((question) => question._id !== questionId),
            }
          : section,
      ),
    }));
    if (selection?.kind === "question" && selection.questionId === questionId) setSelection(null);
  }

  function moveQuestionAcrossSections(questionId: string, overId: string) {
    const sourceSection = draft.sections.find((section) =>
      section.questions.some((question) => question._id === questionId),
    );
    const targetSection = draft.sections.find(
      (section) =>
        section._id === overId || section.questions.some((question) => question._id === overId),
    );
    if (!sourceSection || !targetSection || sourceSection._id === targetSection._id) return false;

    changeDraft((current) => {
      const source = current.sections.find((section) => section._id === sourceSection._id);
      const question = source?.questions.find((item) => item._id === questionId);
      if (!source || !question) return current;

      const sections = current.sections.map((section) => ({
        ...section,
        questions: [...section.questions],
      }));
      const nextSource = sections.find((section) => section._id === sourceSection._id)!;
      const nextTarget = sections.find((section) => section._id === targetSection._id)!;
      nextSource.questions = nextSource.questions.filter((item) => item._id !== questionId);
      const targetIndex =
        overId === nextTarget._id
          ? nextTarget.questions.length
          : nextTarget.questions.findIndex((item) => item._id === overId);
      nextTarget.questions.splice(
        targetIndex < 0 ? nextTarget.questions.length : targetIndex,
        0,
        question,
      );
      return { ...current, sections };
    });
    if (selection?.kind === "question" && selection.questionId === questionId) {
      setSelection({ kind: "question", sectionId: targetSection._id, questionId });
    }
    return true;
  }

  function dropQuestion(questionId: string, overId: string) {
    if (questionId === overId) return;
    const sourceSection = draft.sections.find((section) =>
      section.questions.some((question) => question._id === questionId),
    );
    const targetSection = draft.sections.find(
      (section) =>
        section._id === overId || section.questions.some((question) => question._id === overId),
    );
    if (!sourceSection || !targetSection) return;

    const sourceIndex = sourceSection.questions.findIndex(
      (question) => question._id === questionId,
    );
    const targetIndex =
      overId === targetSection._id
        ? targetSection.questions.length
        : targetSection.questions.findIndex((question) => question._id === overId);
    if (
      targetIndex < 0 ||
      (sourceSection._id === targetSection._id &&
        (sourceIndex === targetIndex ||
          (overId === targetSection._id && sourceIndex === targetIndex - 1)))
    )
      return;

    changeDraft((current) => {
      const movedQuestion = current.sections.find((section) => section._id === sourceSection._id)
        ?.questions[sourceIndex];
      if (!movedQuestion) return current;
      const sections = current.sections.map((section) => ({
        ...section,
        questions: [...section.questions],
      }));
      const source = sections.find((section) => section._id === sourceSection._id)!;
      const target = sections.find((section) => section._id === targetSection._id)!;
      source.questions.splice(sourceIndex, 1);
      target.questions.splice(targetIndex, 0, movedQuestion);
      return { ...current, sections };
    });
    if (selection?.kind === "question" && selection.questionId === questionId) {
      setSelection({ kind: "question", sectionId: targetSection._id, questionId });
    }
  }

  function markSaved(form: OrganizationFormDetails) {
    setDraft(editableForm(form));
    setIsDirty(false);
  }

  function restoreDrag(sections: FormSection[], wasDirty: boolean, previousSelection: Selection) {
    setDraft((current) => ({ ...current, sections }));
    setIsDirty(wasDirty);
    setSelection(previousSelection);
  }

  return {
    draft,
    selection,
    setSelection,
    isDirty,
    updateDescription,
    addSection,
    updateSection,
    duplicateSection,
    deleteSection,
    moveSection,
    addQuestion,
    updateQuestion,
    duplicateQuestion,
    deleteQuestion,
    moveQuestionAcrossSections,
    dropQuestion,
    restoreDrag,
    markSaved,
  };
}
