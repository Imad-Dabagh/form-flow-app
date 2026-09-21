import type { IFormBuilderState } from "@/types/form-builder.types"

export const mockInitialState: IFormBuilderState = {
  sections: {
    section_1: {
      id: "section_1",
      title: "Personal Information",
      fieldIds: ["field_1", "field_2", "field_3"],
    },
    section_2: {
      id: "section_2",
      title: "Contact Details",
      fieldIds: ["field_4", "field_5"],
    },
  },
  fields: {
    field_1: {
      id: "field_1",
      type: "text",
      title: "Full Name",
      description: "Enter your first and last name",
      attributes: {
        required: true,
        hidden: false,
        placeholder: "John Doe",
      },
    },
    field_2: {
      id: "field_2",
      type: "email",
      title: "Email Address",
      attributes: {
        required: true,
        hidden: false,
        placeholder: "john@example.com",
      },
    },
    field_3: {
      id: "field_3",
      type: "date",
      title: "Date of Birth",
      attributes: {
        required: false,
        hidden: false,
      },
    },
    field_4: {
      id: "field_4",
      type: "select",
      title: "Country",
      attributes: {
        required: true,
        hidden: false,
        options: [
          { label: "United States", value: "us" },
          { label: "United Kingdom", value: "uk" },
          { label: "Canada", value: "ca" },
          { label: "Australia", value: "au" },
        ],
      },
    },
    field_5: {
      id: "field_5",
      type: "number",
      title: "Phone Number",
      description: "Enter your mobile number",
      attributes: {
        required: false,
        hidden: false,
        placeholder: "+1 (555) 123-4567",
      },
    },
  },
  sectionOrder: ["section_1", "section_2"],
  selectedFieldId: null,
}
