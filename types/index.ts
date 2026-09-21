export type FieldType =
  | "text"
  | "email"
  | "number"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "date"
  | "time"
  | "url"
  | "upload";

export interface Field {
  id: string;
  type: FieldType;
  title: string;
  description?: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  min?: number;
  max?: number;
}

export interface Section {
  id: string;
  title: string;
  description?: string;
  fields: Field[];
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  status: "draft" | "published";
  content: Section[];
}

export interface Submission {
  id: string;
  formId: string;
  submittedAt: string;
  answers: Record<string, string | string[]>;
}
