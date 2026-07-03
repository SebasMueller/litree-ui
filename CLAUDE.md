# Litree – Product (project instructions)

This project hosts product designs that consume the **Litree – Design System** (DS) attached as a skill. Always treat the DS as the single source of truth for tokens, fonts, icons, and shared components — copy out only what each prototype needs; never invent new colours, type ramps, or primitives.

---

## Handoff bundle recipe

When the user asks for "handoff files", produce a **two-package bundle** rooted at `handoff_bundle/` with the DS and the product handoff as siblings under `designs/`. The product references the DS via relative paths (`../../design-system/...`) — no asset duplication.

### Target layout

```
handoff_bundle/
├── README.md                                ← top-level orientation
└── designs/
    ├── design-system/                       ← full DS handoff (sibling)
    │   ├── HANDOFF.md, LITREE_README.md, LITREE_SKILL.md, LICENSES.md
    │   ├── colors_and_type.css              ← all --lt-* tokens + @font-face
    │   ├── fonts/InterVariable.woff2
    │   ├── assets/                          ← logos, favicon, curated Lucide icons
    │   ├── src/                             ← Sidebar, Banner, Dropdown, Modal,
    │   │                                       Primitives, ProjectPage
    │   └── preview/                         ← visual spec cards
    └── product/
        └── design_handoff_<feature>/        ← THIS page's handoff
            ├── README.md
            ├── <Prototype>.html             ← refs ../../design-system/
            └── src/
                ├── <FeaturePage>.jsx        ← PORT
                └── <FeatureData>.jsx        ← PORT (if any)
```

The product folder contains **only** the prototype HTML, the page-specific JSX, and the README. No mirrored CSS, fonts, icons, or shared JSX — the prototype HTML loads them from `../../design-system/` at preview time.

### Step-by-step

1. **Copy the DS handoff into the bundle** as a sibling, in one shot:
   ```
   copy_files
     /projects/<litree-ds-id>/handoff   →  handoff_bundle/designs/design-system
     design_handoff_<feature>/          →  handoff_bundle/designs/product/design_handoff_<feature>
   ```
   The DS project id is `a236f8e5-6d21-42ae-b03b-bb39e98b843f`. Its `handoff/` folder is already a clean, portable DS package — copy it as-is.

2. **Rewire the product prototype HTML** so it points at the sibling DS instead of local mirrors:
   - `<link rel="icon" href="../../design-system/assets/favicon.png">`
   - `<link rel="stylesheet" href="../../design-system/colors_and_type.css">`
   - Set the icon base before any script: `<script>window.LT_ASSETS_BASE = "../../design-system/assets/";</script>`
   - Update every `<meta name="ext-resource-dependency">` from `assets/...` → `../../design-system/assets/...`
   - Update every shared-component `<script type="text/babel" src="...">` from `./src/...` → `../../design-system/src/...`
   - Leave page-specific `<script src="./src/...">` (e.g. `DocsPage.jsx`, `DocsData.jsx`) alone.

3. **Delete the mirrored files** from the product folder:
   - `colors_and_type.css`, `fonts/`, `assets/` (entire trees)
   - `src/Primitives.jsx`, `src/Banner.jsx`, `src/Sidebar.jsx`, `src/Dropdown.jsx`, `src/Modal.jsx` — anything that was a copy of a DS component.

4. **Author the product `README.md`** following the existing `design_handoff_docs_page/README.md` shape:
   - Open with: *"This bundle ships only the page-specific design. Everything reusable lives in the Litree Design System."*
   - Include the repo-layout block.
   - "What's product-specific vs. design-system" table (every DS row marked "Reference only.", page rows marked "Port verbatim.").
   - Fidelity (almost always **high-fidelity** for this project).
   - Screen-by-screen layout, sections, copy.
   - Interactions / state / tokens / icons.
   - Components table split into "From the DS (do not port from this bundle)" and "Shipped in this bundle (port these)".
   - **Files in this bundle** table — should be tiny (HTML + page JSX + README).
   - **How to preview the prototype**: server root must be at or above `designs/`, never inside the product folder. Document the `LT_ASSETS_BASE` override.

5. **Write the top-level `handoff_bundle/README.md`** — short orientation:
   - The layout diagram above.
   - "Drop into your repo" / "Read the two READMEs" / "Port, don't duplicate" / "Preview locally" steps.
   - Fidelity statement.

6. **Verify** with `done` + `fork_verifier_agent` against the prototype path. Watch specifically for 404s on `logo-litree.png` or icon SVGs — the most common breakage is hardcoded `../assets/` paths inside DS components that haven't been wired through `window.LT_ASSETS_BASE`.

7. **Present** with `present_fs_item_for_download` on `handoff_bundle/`.

### Why deduplicate

Single source of truth. If the DS changes (new icon, palette tweak, primitive update), every product handoff picks it up automatically — no drift, no stale mirrors. The cost is one constraint: the preview server must be rooted at or above `designs/` so `..` paths resolve.

### Known gotchas

- **`window.LT_ASSETS_BASE`** is read by `Icon` (icon SVG fetch) **and** `Sidebar` (logo `<img src>`). Any future DS component that loads a raster asset must use the same convention. Hardcoded `../assets/foo.png` will 404 when the DS is consumed from a deeper directory.
- **Standalone HTML exports** (`*(standalone).html`) inline everything and don't need the rewire — leave them out of the handoff bundle or keep them only as offline-preview convenience.
- **The DS project's `handoff/` folder is the canonical export** — never reconstruct the DS handoff manually from `/projects/<ds-id>/` root; copy from `/projects/<ds-id>/handoff/`.

---

## Working in this project (general)

- Always reach for the DS first: `read_file("/projects/a236f8e5-6d21-42ae-b03b-bb39e98b843f/<path>")`. Copy what you need into the current prototype folder; never reference cross-project paths from the live HTML.
- Use Lucide-style icons only. The 50-icon curated set is in the DS — pull more from `lucide.dev` matching the same stroke style if missing.
- Inter Variable only. Three weights in active use: 400 / 500 / 700.
- Sentence case for everything except section labels (UPPERCASE, `+0.05em` tracking) and status pills (single capitalised word).
- No emoji. No gradients. No frosted glass. Borders do the visual work; shadows are reserved for popovers/menus.
