# `src/` — snapshot from the Litree Design System

These component files are **vendored copies** from the canonical design-system project:

> **Source of truth:** `Litree – Design System` (project id `a236f8e5-…`)
> Path in source: `src/*`

## What's vendored from the DS

| File                | Source project path        | Role |
|---------------------|----------------------------|------|
| `Primitives.jsx`    | `src/Primitives.jsx`       | `Icon`, `Button`, `Badge`, `Checkbox`, `Tabs`, `SectionLabel`, `CountPill` |
| `Sidebar.jsx`       | `src/Sidebar.jsx`          | Left rail — logo, project list, account footer |
| `Banner.jsx`        | `src/Banner.jsx`           | Beta banner |
| `Dropdown.jsx`      | `src/Dropdown.jsx`         | Floating menu (neutral + destructive) |
| `Modal.jsx`         | `src/Modal.jsx`            | Confirmation dialog (neutral + danger) |
| `../colors_and_type.css` | `colors_and_type.css` | Tokens (colors, type, spacing, radius, elevation, motion) |

Last synced: **2026-05-12**.

## Rules

1. **Never edit these files directly.** Make changes in the DS project, then re-sync here. Direct edits will be wiped the next time we pull.
2. **Cross-project access is read-only.** That's why we vendor instead of linking — the runtime can't `<script src>` across projects.
3. **If you find a bug or need a new variant**, fix it in the DS project first. The DS owns the API.

## Local vendor patches

The DS project hosts its app at `ui_kits/app/index.html`, one folder deep, so its components reach assets via `../assets/…`. Our pages here sit at project root, so we patched the asset paths after pulling:

| File              | Patch                                              |
|-------------------|----------------------------------------------------|
| `Sidebar.jsx`     | `../assets/logo-litree.png` → `assets/logo-litree.png` |

Re-apply these after every re-sync.

## What lives here (product-specific, *not* in DS)

| File                       | Role |
|----------------------------|------|
| `WorkspacePage.jsx`        | Project workspace (Papers + Reviews tabs, toolbar, list) |
| `ResearchQuestionPage.jsx` | New-project wizard (ask → review → boolean) |
| `DocsPage.jsx`, `DocsData.jsx` | Journals documentation page |
| `Primitives.bundle.jsx`    | (legacy bundle — superseded by `Primitives.jsx`; remove on next pass) |

These are Litree product flows. They consume DS primitives but don't belong upstream.

## Re-sync procedure

Pull the latest from the DS project:

```
copy_files: /projects/a236f8e5-6d21-42ae-b03b-bb39e98b843f/src/{Primitives,Sidebar,Banner,Dropdown,Modal}.jsx → src/
copy_files: /projects/a236f8e5-6d21-42ae-b03b-bb39e98b843f/colors_and_type.css → colors_and_type.css
```

After sync, open `Project Workspace.html` and `Research Question.html` and make sure they still render cleanly — a primitive's API may have shifted.
