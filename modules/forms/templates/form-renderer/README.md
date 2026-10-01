# Form renderer

Render the current `OrganizationFormDetails` schema from `router/orgs/forms`.
The `form-renderer-v2` folder is reference code only.

## Current first pass

- `/orgs/[organizationSlug]/forms/[formId]/preview` loads an existing form for an authenticated organization member.
- `FormRenderer` accepts a form definition and displays its name, rich text description, and visible sections.
- Question controls use the current schema and keep answers in local state for the preview.
- `SINGLE_PAGE` shows all visible sections; `WIZARD` shows one section at a time with navigation.
- Selected files remain local to the preview and are not uploaded.

The reference's application types, company context, pixel tracking, UTM handling,
draft persistence, and old UI libraries do not belong in this renderer.

## Next steps

1. Add validation, including required fields and configured rules, before wizard advancement and submission.
2. Define the backend submission contract and connect it through `router/`.
3. Upload file answers through a submission-compatible endpoint, including public-form support when needed.
