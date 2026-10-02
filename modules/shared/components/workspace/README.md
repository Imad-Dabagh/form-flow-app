# Workspace pages

Organization pages use the shared, centered `max-w-7xl` frame. Route files stay thin; module templates own data, permissions, and content.

```tsx
<WorkspacePage>
  <PageNavigation title="Forms">
    <PageBreadcrumbs
      items={[
        { label: organization.name, href: dashboardPath },
        { label: "Forms" },
      ]}
    />
    <Button>Create form</Button>
  </PageNavigation>
  <PageSection title="Recent forms">{/* Page content */}</PageSection>
</WorkspacePage>
```

- `WorkspacePage` owns the common width, padding, and spacing between major blocks.
- `PageNavigation` aligns breadcrumbs and optional actions; its title supplies an accessible page heading without repeating the breadcrumb visually.
- Breadcrumb ancestors link to their routes. The final item is the current page. Keep nested paths in order, including `Organization / Forms / Form name` for the builder.
- `PageSection` supplies semantic section headings and spacing without adding a card or border. Pages decide where a surface helps their content.
- Keep the builder's editor structure local to the builder template. Its top navigation uses the same workspace frame and breadcrumb row.
