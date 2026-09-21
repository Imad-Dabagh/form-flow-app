import type { IFormBuilderState, IBackendPayload } from "@/types/form-builder.types"

export function convertStateToPayload(state: IFormBuilderState): IBackendPayload {
  const formContent = state.sectionOrder.map((sectionId) => {
    const section = state.sections[sectionId]

    return {
      id: section.id,
      title: section.title,
      fields: section.fieldIds.map((fieldId) => {
        const field = state.fields[fieldId]
        return {
          id: field.id,
          type: field.type,
          title: field.title,
          description: field.description,
          attributes: field.attributes,
        }
      }),
    }
  })

  return { formContent }
}
