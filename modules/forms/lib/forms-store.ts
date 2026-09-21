import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Form, Submission } from "@/modules/forms/types";

interface FormsState {
  forms: Form[];
  submissions: Submission[];

  // Getters
  getFormById: (id: string) => Form | undefined;
  getSubmissionsByFormId: (formId: string) => Submission[];

  // Actions
  createForm: (form: Omit<Form, "id" | "createdAt" | "updatedAt">) => Form;
  updateForm: (id: string, updates: Partial<Form>) => void;
  deleteForm: (id: string) => void;
  duplicateForm: (id: string) => Form | undefined;

  // Submissions
  addSubmission: (submission: Omit<Submission, "id" | "submittedAt">) => void;
}

export const useFormsStore = create<FormsState>()(
  persist(
    (set, get) => ({
      forms: [],
      submissions: [],

      getFormById: (id) => {
        return get().forms.find((f) => f.id === id);
      },

      getSubmissionsByFormId: (formId) => {
        return get().submissions.filter((s) => s.formId === formId);
      },

      createForm: (formData) => {
        const newForm: Form = {
          ...formData,
          id: `form-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          forms: [...state.forms, newForm],
        }));

        return newForm;
      },

      updateForm: (id, updates) => {
        set((state) => ({
          forms: state.forms.map((form) =>
            form.id === id
              ? { ...form, ...updates, updatedAt: new Date().toISOString() }
              : form
          ),
        }));
      },

      deleteForm: (id) => {
        set((state) => ({
          forms: state.forms.filter((f) => f.id !== id),
          // Optional: Delete associated submissions
          submissions: state.submissions.filter((s) => s.formId !== id),
        }));
      },

      duplicateForm: (id) => {
        const original = get().forms.find((f) => f.id === id);
        if (!original) return undefined;

        const duplicated: Form = {
          ...original,
          id: `form-${Date.now()}`,
          title: `${original.title} (Copy)`,
          status: "draft",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          forms: [...state.forms, duplicated],
        }));

        return duplicated;
      },

      addSubmission: (submissionData) => {
        const newSubmission: Submission = {
          ...submissionData,
          id: `sub-${Date.now()}`,
          submittedAt: new Date().toISOString(),
        };

        set((state) => ({
          submissions: [...state.submissions, newSubmission],
        }));
      },
    }),
    {
      name: "form-builder-storage",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);
