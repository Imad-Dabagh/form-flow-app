// Core field types
export type FieldType = "text" | "email" | "select" | "date" | "number"

// Field attributes
export interface IFieldAttributes {
  required: boolean
  hidden: boolean
  placeholder?: string
  defaultValue?: any
  options?: { label: string; value: string }[]
}

// Field entity
export interface IField {
  id: string
  type: FieldType
  title: string
  description?: string
  attributes: IFieldAttributes
}

// Section entity
export interface ISection {
  id: string
  title: string
  fieldIds: string[]
}

// Entity map for normalized state
export type EntityMap<T> = Record<string, T>

// Form builder state
export interface IFormBuilderState {
  sections: EntityMap<ISection>
  fields: EntityMap<IField>
  sectionOrder: string[]
  selectedFieldId: string | null
}

// Backend nested format
export interface IBackendField {
  id: string
  type: FieldType
  title: string
  description?: string
  attributes: IFieldAttributes
}

export interface IBackendSection {
  id: string
  title: string
  fields: IBackendField[]
}

export interface IBackendPayload {
  formContent: IBackendSection[]
}
