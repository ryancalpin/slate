# Patient Template Builder — Design Spec
**Date:** 2026-04-13
**Status:** Approved by user

---

## Overview

A self-hostable, open-source web app for building and using customizable patient tracking templates. Designed for inpatient clinical teams (MD/PA/NP and nursing). Templates serve a **hybrid model**: built once, used for live interactive data entry during rounds *and* exported as clean printed documents.

No real PHI is required — templates use de-identified labels (room number, initials, bed). All data stays local in the browser (IndexedDB). Zero server required.

---

## Users & Context

- **Primary:** Inpatient physicians, PAs, NPs, nurses
- **Use pattern:** Build a template once, use it daily for rounding or shift documentation, print/export as needed
- **Environment:** Desktop (primary), iPad/touch tablet (first-class), mobile (supported)
- **Data:** De-identified only — no enforcement, but no PHI fields are required by design
- **Deployment:** Static files — drop on any web server, open locally, or self-host via Docker

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | React + Vite | Pure frontend, static build, zero server, easy to contribute |
| Drag & Drop | dnd-kit | Best maintained, keyboard-accessible, touch support |
| Storage | Dexie.js (IndexedDB) | Structured queries, large capacity, works offline |
| Styling | Tailwind CSS | Rapid development, consistent design system |
| PDF Export | html2canvas + jsPDF | Pixel-perfect canvas capture |
| Print View | react-to-print | Clean formatted print output |
| PWA | vite-plugin-pwa | Offline support, installable on iPad home screen |

---

## Architecture — Plugin-First

The core is thin. Every module (vitals, labs, fishbone, etc.) is a **plugin** implementing a standard interface. First-party built-in modules use the exact same interface as community plugins — no special-casing in core.

### Plugin Interface

Every module exports:

```ts
interface ModulePlugin {
  meta: {
    id: string           // e.g. "vitals", "labs-fishbone"
    name: string         // display name
    version: string      // semver
    author: string
    description: string
    tags: string[]       // e.g. ["nursing", "labs", "critical-care"]
  }
  schema: {
    config: JSONSchema   // configurable options (shown in Editor panel)
    data: JSONSchema     // user-entered values (shown in Renderer)
  }
  defaultConfig: object  // sane out-of-box defaults
  minSize: { w: number, h: number }  // minimum grid units
  Renderer: React.FC<ModuleProps>    // live view + data entry
  Editor: React.FC<EditorProps>      // config/settings panel
  PrintView: React.FC<PrintProps>    // PDF/print output
}
```

### Core Systems

- **Template Engine** — loads, saves, and versions template JSON documents from IndexedDB
- **Plugin Registry** — discovers and registers built-in plugins + user-installed plugins (loaded from a `plugins/` directory as ES modules, or listed in a `plugins.config.js` by npm package name)
- **Canvas System** — renders layout in selected mode, handles drag/drop/resize via dnd-kit
- **Export Engine** — pixel-perfect PDF (html2canvas), clean doc PDF (formatted layout), browser print
- **Snapshot Engine** — auto-freezes a read-only daily snapshot when a new day begins
- **Census Engine** — aggregates glanceable data across all open patient templates

---

## Canvas Modes

Each template has a **canvas mode** set at creation, switchable at any time without losing content:

| Mode | Description | Best for |
|---|---|---|
| **Grid** (default) | Modules snap to a fixed grid, resize by dragging edges | Dense data, rounding cards |
| **Freeform** | Drag anywhere on infinite canvas, free positioning | Custom layouts, whiteboard-style |
| **Sections** | Vertical sections with drag-and-drop columns inside each | Structured notes, nursing assessments |

---

## App Layout

### Shell
- **Top bar:** App name, open template tabs (with × to close), canvas mode switcher, dark/light toggle, export/print menu
- **Canvas area:** Full-width, full-height, scrollable. Fills remaining space.
- **Module palette:** Adaptive —
  - Desktop: collapsible sidebar (right side)
  - iPad/tablet: floating panel (drag to reposition) or right-click/long-press context menu
  - All: right-click anywhere on canvas opens context menu with "Add Module"

### Views
1. **Home / Template Gallery** — grid of saved templates + community template browser
2. **Template Editor** — canvas with modules, edit mode vs. fill mode toggle
3. **Census View** — all open patients as cards with glanceable data summary
4. **Print Preview** — formatted print layout, page break controls

### Edit Mode vs. Fill Mode
- **Edit mode:** Drag, resize, add/remove modules, configure module settings
- **Fill mode:** Data entry only, no accidental layout changes. Click field → type. Touch-optimized.
- Toggle is prominent — top bar button or keyboard shortcut `E`

---

## First-Party Modules (Built-in Plugins)

All 14 ship with the app and serve as reference implementations for community contributors:

| Module ID | Name | Key Config Options |
|---|---|---|
| `patient-header` | Patient Header | Fields shown/hidden, custom label fields |
| `vitals` | Vitals | Which vitals shown, normal ranges, trend indicators on/off |
| `labs-panel` | Labs Panel | Which panels (BMP/CBC/LFTs/coags), trend comparison on/off |
| `labs-fishbone` | Labs Fishbone | Classic electrolyte fishbone diagram (Na/K/Cl/CO2/BUN/Cr/Glucose) |
| `assessment-plan` | Assessment & Plan | Problem-numbered SOAP, sub-fields per problem |
| `medications` | Medications | Highlight categories (pressors, abx, anticoag), columns shown |
| `intake-output` | Intake & Output | 24h window, UOP display, net balance calculation |
| `lines-tubes` | Lines / Tubes / Drains | Line types, date tracking, site field |
| `task-checklist` | Task Checklist | Role assignment, priority flags, completion tracking |
| `free-text` | Free Text / Notes | Rich text or plain text, font size, label |
| `consults` | Consults & Results | Track by service, question, status/recs, pending imaging |
| `nursing-assessment` | Nursing Assessment | System checkboxes: neuro, cardiac, resp, GI, GU, skin, mobility, fall risk, pain/CPOT |
| `custom-fields` | Custom Fields | Any combination of text, number, checkbox, dropdown, date fields; simple math formulas (sum, average) |
| `calculated` | Clinical Calculators | Pre-built clinical formulas: anion gap, MAP, fluid balance, BMI, A-a gradient, GFR; formula editor for custom equations. **All formulas must cite a published source (journal, guideline, or validated tool). No formula ships without a citation. Custom formula editor includes a required citation field.** |

---

## Key Features

### Hybrid Print + Live Model
- **Fill mode** is for live rounding use — fast data entry, keyboard navigation, touch-friendly
- **Print mode** reformats the canvas into a clean paginated layout regardless of canvas arrangement
- **Export PDF** captures the canvas pixel-perfectly as laid out (default)
- Any module's `PrintView` component renders a clean version for the formatted PDF option

### Abnormal Value Highlighting
- Each module that displays numeric values accepts a `normalRanges` config
- Out-of-range values are highlighted amber (borderline) or red (critical)
- Configurable per-module, can be turned off globally

### Daily Snapshots
- When a filled template is opened on a new calendar day, the previous day's data is frozen as a read-only snapshot
- Snapshots are browseable via a timeline slider on the template
- Enables trend-tracking across an admission without manual comparison

### Census View
- Dashboard of all open patient templates
- Each card shows: patient label, room, key vitals, flagged abnormals, task count
- Clicking a card opens that template in the tabbed canvas

### Multi-Page Canvases
- Templates can have multiple named pages (tabs within the template, e.g., "Rounding", "Procedures", "Discharge")
- Each page has its own layout and canvas mode
- All pages included in print/export

### Progressive Web App (PWA)
- Works fully offline after first load
- Installable on iPad home screen via Safari "Add to Home Screen"
- No internet required for clinical use

### Template Gallery
- App fetches a community-maintained `index.json` from a known GitHub raw URL (the community repo)
- `index.json` lists available templates with name, description, tags, and raw `.ptjson` download URL
- One-click import fetches the `.ptjson` and saves it to local IndexedDB
- Submit your own templates by opening a PR to the community repo with your `.ptjson` file

### Module Lock
- Lock individual modules in place (prevents accidental drag during fill mode)
- Edit mode bypasses locks
- Visual indicator (lock icon on module corner)

### Collapsible Modules
- Any module can be collapsed to a title bar to reclaim canvas space
- Collapsed state is saved in the template layout

### Keyboard Shortcuts
- `E` — toggle Edit/Fill mode
- `Tab` / `Shift+Tab` — navigate between module fields in Fill mode
- `Cmd/Ctrl+P` — print
- `Cmd/Ctrl+E` — export PDF
- `Cmd/Ctrl+Z/Y` — undo/redo layout changes
- `Space` (in grid) — open module palette
- `Esc` — close panels, cancel drag

### Dark / Light Mode
- System default, manually overridable
- Dark mode for night float; light mode for print preview (always light)

---

## Data Model

Templates are stored in IndexedDB as JSON. Portable via `.ptjson` export/import.

```
Template
├── id, name, canvasMode, createdAt, updatedAt
├── pages[]
│   ├── id, name
│   └── layout[]
│       ├── instanceId
│       ├── moduleId + version
│       ├── position { x, y, w, h }
│       ├── config { ...module-specific settings }
│       ├── data { ...user-entered values }
│       ├── locked: boolean
│       └── collapsed: boolean
└── snapshots[]
    ├── date
    └── pages[] (frozen copy of layout + data)

PatientSlot (lightweight, links template instance to a label)
├── id, label (e.g. "Bed 4", "JD"), room, date
└── templateId
```

---

## Export & Print

| Export Type | How | Output |
|---|---|---|
| **PDF — Pixel Perfect** (default) | html2canvas captures canvas as rendered | Exact replica of screen layout |
| **PDF — Clean Doc** | Each module's `PrintView` renders into formatted pages | Readable clinical document |
| **Browser Print** | react-to-print with print stylesheet | System print dialog, always light mode |

Print preview always renders in light mode with configurable page margins and orientation (portrait/landscape).

---

## Open Source Strategy

- **License:** MIT
- **Module contributions:** Community adds modules as standalone npm packages implementing the `ModulePlugin` interface
- **Template contributions:** Share `.ptjson` files in a community GitHub repo, browseable via in-app gallery
- **Docs:** Contributing guide, module authoring guide, architecture overview
- **Reference implementations:** All 14 built-in modules serve as copy-paste starting points for contributors

---

## Clinical Evidence Standard

All calculations in the `calculated` module (and any community-contributed module containing clinical formulas) must meet this standard without exception:

- Every formula ships with a mandatory citation (journal article, clinical guideline, or validated scoring tool with known sensitivity/specificity)
- Citations are displayed in the UI alongside the result — the user always sees the source
- If a formula has multiple validated variants (e.g., CKD-EPI vs MDRD for GFR), each variant is labeled and cited separately
- The custom formula editor requires a citation field before saving — it cannot be left blank
- Community plugin review guidelines will enforce this standard: PRs adding clinical calculators without citations are rejected
- No "clinical judgment adjustments" or unnoted modifications to published formulas

---

## Out of Scope (v1)

- Real PHI storage or HIPAA compliance infrastructure
- Multi-user / collaborative real-time editing
- Cloud sync (manual export/import only)
- Native iOS/Android apps (PWA covers tablet use)
- EMR/EHR integration
