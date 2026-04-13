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
    pack?: string        // specialty pack this belongs to, if any
  }
  schema: {
    config: JSONSchema   // configurable options (shown in Build Mode)
    data: JSONSchema     // user-entered values (shown in Live Mode)
  }
  defaultConfig: object  // sane out-of-box defaults
  minSize: { w: number, h: number }  // minimum grid units
  Renderer: React.FC<ModuleProps>    // live view + data entry (Live Mode)
  Editor: React.FC<EditorProps>      // config/settings panel (Build Mode only)
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
- **Roster Engine** — manages patient slots for roster-mode templates (one layout, multiple patients)

---

## Canvas Modes

Each template has a **canvas mode** set at creation, switchable at any time without losing content:

| Mode | Description | Best for |
|---|---|---|
| **Grid** (default) | Modules snap to a fixed grid, resize by dragging edges | Dense data, rounding cards |
| **Freeform** | Drag anywhere on infinite canvas, free positioning | Custom layouts, whiteboard-style |
| **Sections** | Vertical sections with drag-and-drop columns inside each | Structured notes, nursing assessments |

---

## Build Mode vs. Live Mode

Templates have two distinct operational modes. The switch is prominent in the top bar (`B` keyboard shortcut) and the two modes look and feel meaningfully different.

### Build Mode — Template Design

The design surface. Used once per template (or when modifying layout).

- Drag modules anywhere on the canvas
- Resize modules by dragging edges/corners
- Add modules from the palette (sidebar, floating panel, or right-click)
- Open each module's Editor panel (gear icon) to configure settings: fields shown, normal ranges, calculated formulas, display options
- Set canvas mode, page structure, module connections (for calculated fields)
- Lock or collapse modules as defaults
- Define multi-page structure
- Configure patient mode (single-instance vs. roster)
- Undo/redo layout changes (`Cmd/Ctrl+Z/Y`)
- Top bar shows: Build Mode badge, canvas mode switcher, page manager, module count
- Module palette always visible (sidebar on desktop, floating on tablet)

### Live Mode — Clinical Use

The clinical surface. Used every day under time pressure.

- Data entry only — no layout changes possible
- Modules locked in place; locked modules show no drag handles
- Module Editor panel inaccessible (settings locked)
- `Tab` / `Shift+Tab` navigates between all fillable fields in reading order
- Large touch targets on iPad (minimum 44px tap area)
- Auto-saves on every field change (debounced 500ms)
- Day-rollover snapshot triggers automatically when opening on a new date
- Census view accessible from top bar
- Export/print available
- Top bar shows: Live Mode badge, patient selector (roster mode), date, export, print
- Module palette hidden — no accidental additions

### Mode Switching

- Default mode on first open: **Build Mode** (new templates) or **Live Mode** (templates with existing data)
- User can set a per-template default mode
- Switching modes never loses data or layout
- `B` keyboard shortcut toggles between modes

---

## Patient Mode — Single vs. Roster

Each template has a **patient mode** configured in Build Mode:

### Single-Instance Mode
- One template = one patient's data
- Duplicate the template to use the same layout for a different patient
- Best for: per-admission trackers, personal daily sheets

### Roster Mode
- One template layout shared across a list of patients
- Patient selector in Live Mode top bar (dropdown or carousel)
- Each patient slot has its own independent data
- All slots share the same layout, module config, and normal ranges
- Switching patient slot: instant, no reload
- Census View shows all roster slots as a glanceable grid
- Per-template default: **user sets on template creation, can change later**

### Roster Data Model
```
Template (roster mode)
├── layout (shared — modules, positions, configs)
├── pages[]
├── patientSlots[]
│   ├── id, label, room, admitDate, notes
│   └── data{}  — per-slot data keyed by moduleInstanceId
└── snapshots[]
    └── per-slot daily snapshots
```

---

## App Layout

### Shell
- **Top bar:** App logo, open template tabs (× to close), mode badge (Build/Live), canvas mode switcher (Build only), patient selector (Live + roster), dark/light toggle, export/print menu
- **Canvas area:** Full-width, full-height, scrollable. Fills remaining space.
- **Module palette (Build Mode only):** Adaptive —
  - Desktop: collapsible sidebar (right side), grouped by category/pack
  - iPad/tablet: floating panel (drag to reposition) or long-press context menu
  - All: right-click anywhere on canvas opens "Add Module" context menu

### Views
1. **Home / Template Gallery** — saved templates grid + community browser + plugin manager
2. **Template Canvas** — Build Mode or Live Mode, tabbed
3. **Census View** — all open patient slots as glanceable cards
4. **Print Preview** — formatted print layout with page break controls

---

## First-Party Modules — Core (14)

All ship with the app and serve as reference implementations for contributors:

| Module ID | Name | Key Config Options |
|---|---|---|
| `patient-header` | Patient Header | Fields shown/hidden, custom label fields |
| `vitals` | Vitals | Which vitals shown, normal ranges, trend indicators on/off |
| `labs-panel` | Labs Panel | Which panels (BMP/CBC/LFTs/coags), trend comparison on/off |
| `labs-fishbone` | Labs Fishbone | Classic electrolyte fishbone (Na/K/Cl/CO2/BUN/Cr/Glucose) |
| `assessment-plan` | Assessment & Plan | Problem-numbered SOAP, sub-fields per problem |
| `medications` | Medications | Highlight categories (pressors, abx, anticoag), columns shown |
| `intake-output` | Intake & Output | 24h window, UOP display, net balance calculation |
| `lines-tubes` | Lines / Tubes / Drains | Line types, date tracking, site field |
| `task-checklist` | Task Checklist | Role assignment, priority flags, completion tracking |
| `free-text` | Free Text / Notes | Rich text or plain text, font size, label |
| `consults` | Consults & Results | Track by service, question, status/recs, pending imaging |
| `nursing-assessment` | Nursing Assessment | System checkboxes: neuro, cardiac, resp, GI, GU, skin, mobility, fall risk, pain/CPOT |
| `custom-fields` | Custom Fields | Text, number, checkbox, dropdown, date; simple math formulas (sum, average) |
| `calculated` | Clinical Calculators | Pre-built evidence-based clinical formulas; custom formula editor with required citation field |

---

## First-Party Specialty Packs (12)

Each pack is a named collection of specialty-optimized mini-modules + pre-built template layouts. Installed via the Plugin Manager. Uses the identical `ModulePlugin` interface — no special privileges.

| Pack | Key Mini-Modules |
|---|---|
| **Cardiology** | GDMT tracker (BB/ACEi/ARNI/MRA/SGLT2i doses+targets), EF/Echo summary, diuresis response, hemodynamics (CI/PCWP/SVR), rhythm+pacemaker, LVAD settings, CHADS₂-VASc, HAS-BLED, TIMI, GRACE |
| **Pulmonology / Critical Care** | Vent settings (mode/FiO₂/PEEP/TV/P-plat), ARDSnet calculator, ABG interpreter, P/F ratio, CURB-65, PSI, Berlin ARDS, weaning readiness (RSB index) |
| **Nephrology** | Dialysis settings (HD/PD/CRRT, UF goal, access), GFR trend (CKD-EPI), AKI staging (KDIGO), FENa/FEUrea, urine microscopy, RRT timeline |
| **Neurology / Neurocritical Care** | NIHSS (full scored), mRS, GCS, pupil tracker, ICP/CPP monitor, seizure log, stroke timeline (LKW/door-to-needle/door-to-groin), Hunt-Hess, Fisher grade, EVD settings |
| **Infectious Disease** | Antibiotic tracker (agent/dose/day of therapy/planned stop), culture+sensitivity log, fever curve, source control tracker, Sepsis-3/qSOFA, antifungal/antiviral log |
| **ICU / Critical Care** | Vasopressor tracker (multi-agent, doses, MAP target), RASS/CPOT, SAT/SBT readiness, nutrition tracker (EN/PN, kcal/protein), SOFA, APACHE II, VTE prophylaxis status |
| **Hematology / Oncology** | Chemo regimen tracker (cycle/day/agents/dose modifications), ANC/CBC trend, transfusion log (product/reaction), tumor markers, neutropenic fever protocol |
| **Hepatology / GI** | MELD-Na, Child-Pugh, ascites tracker (paracentesis log, albumin replacement for SBP), West Haven encephalopathy grade, GI bleed risk (Glasgow-Blatchford, Rockall) |
| **Endocrinology** | Insulin infusion tracker, glucose log (time-in-range display), DKA tracker (AG/bicarb trend, closure criteria), thyroid/adrenal labs, steroid taper log |
| **General Surgery / Post-Op** | Surgical drains (output/color/volume), wound assessment (VAC settings), post-op checklist, diet advancement tracker, ostomy output, DVT prophylaxis status |
| **OB/GYN** | Antepartum tracker (GA, FHR, contraction pattern), postpartum assessment, preeclampsia severity (BP log, proteinuria, labs), mag sulfate drip settings |
| **Pediatrics / Neonatology** | Weight-based dosing calculator, Apgar, NAS/Finnegan scoring, NICU flowsheet (TPN components, UAC/UVC), age-adjusted vitals normal ranges, growth percentiles |

All clinical scores and calculators within specialty packs follow the **Clinical Evidence Standard** — every formula is cited, no exceptions.

---

## Community Plugin System

### For Non-Developers (In-App)
- **Plugin Manager** (Settings → Plugins) — browse, install, uninstall
- Community registry fetched from a curated `registry.json` on GitHub
- Each entry: name, author, version, description, tags, install URL
- **Install from file:** drag-and-drop a `.ptplugin` bundle (ES module + manifest)
- **Install from URL:** paste a GitHub raw URL to a `.ptplugin` file

### For Developers
- Publish as an npm package implementing `ModulePlugin`
- Submit to registry via PR to the community repo
- Or share as a standalone `.ptplugin` file (bundled ES module)
- Module authoring guide + scaffolding CLI (`npm create pt-plugin`) included in repo

### Registry
- Hosted as `registry.json` in the community GitHub repo
- Fields per entry: `id`, `name`, `author`, `version`, `description`, `tags`, `pack`, `installUrl`, `repoUrl`, `license`
- Community PRs to add/update registry entries reviewed for plugin interface compliance and clinical evidence standard

---

## Custom Calculations

Users can define their own calculations inside the `calculated` module without writing code:

- **Formula builder:** select input variables from any module on the canvas (e.g., `total_in` from I/O module, `total_out` from I/O module → `net_balance = total_in - total_out`)
- **Operators:** `+`, `-`, `×`, `÷`, `( )`, `min()`, `max()`, `if/then`
- **Citation field:** required before saving — accepts journal citation, guideline name, or institutional protocol note; cannot be blank
- **Named and saved:** custom formulas save with the template and are portable via `.ptjson`
- **Sharing:** custom formulas can be promoted to community registry submissions via a "Share this formula" flow

---

## Key Features

### Abnormal Value Highlighting
- Modules displaying numeric values accept `normalRanges` config (set in Build Mode)
- Out-of-range values highlighted amber (borderline) or red (critical) in Live Mode
- Configurable per-module; can be toggled off globally in settings

### Daily Snapshots
- When a filled template is opened on a new calendar day, previous day's data freezes as a read-only snapshot
- Snapshots browseable via a timeline slider on the canvas
- Enables trend-tracking across an admission without manual comparison
- Per-slot in roster mode

### Census View
- Dashboard of all open patient slots across all templates
- Each card: patient label, room, key vitals, flagged abnormals, task count, admit day
- Clicking a card opens that patient slot in Live Mode
- Available from any screen via top bar icon

### Multi-Page Canvases
- Templates can have multiple named pages (e.g., "Rounding", "Procedures", "Discharge Planning")
- Each page has its own layout and canvas mode (pages can mix modes)
- All pages included in print/export; page order configurable
- Page tabs displayed below the main tab bar in Live Mode

### Progressive Web App (PWA)
- Works fully offline after first load
- Installable on iPad home screen via Safari → "Add to Home Screen"
- No internet required for clinical use
- Background sync not needed (all data is local)

### Template Gallery
- App fetches a community-maintained `index.json` from the community GitHub repo
- `index.json` lists templates: name, description, specialty tags, `.ptjson` download URL
- One-click import saves template to local IndexedDB
- Submit templates via PR to community repo with `.ptjson` file

### Module Lock
- Lock individual modules in Build Mode (lock icon on module corner)
- Locked modules cannot be dragged or resized in Live Mode
- Build Mode shows locked state visually but allows override

### Collapsible Modules
- Any module collapsible to a title bar to reclaim canvas space
- Collapsed state saves with template layout
- Click title bar or chevron to expand/collapse in either mode

### Keyboard Shortcuts
- `B` — toggle Build / Live mode
- `Tab` / `Shift+Tab` — navigate fillable fields in Live Mode
- `Cmd/Ctrl+P` — print
- `Cmd/Ctrl+E` — export PDF
- `Cmd/Ctrl+Z` / `Cmd/Ctrl+Y` — undo/redo (Build Mode)
- `Space` — open module palette (Build Mode, grid canvas)
- `Esc` — close panels, cancel drag
- Arrow keys — move selected module (Build Mode, grid canvas)

### Dark / Light Mode
- Follows system preference by default, manually overridable
- Dark for night float; print preview and PDF export always render in light mode

---

## Data Model

Templates stored in IndexedDB as JSON. Portable via `.ptjson` export/import.

```
Template
├── id, name, canvasMode, patientMode (single | roster)
├── defaultMode (build | live)
├── createdAt, updatedAt
├── pages[]
│   ├── id, name, canvasMode (per-page override)
│   └── layout[]
│       ├── instanceId
│       ├── moduleId, version, packId (if from a specialty pack)
│       ├── position { x, y, w, h }
│       ├── config { ...module-specific settings }
│       ├── locked: boolean
│       └── collapsed: boolean
├── patientSlots[] (roster mode only)
│   ├── id, label, room, admitDate, notes
│   └── data { [instanceId]: { ...field values } }
├── singleData { [instanceId]: { ...field values } } (single mode only)
└── snapshots[]
    ├── date
    ├── slotId (roster) or null (single)
    └── pages[] (frozen layout + data)
```

---

## Export & Print

| Export Type | How | Output |
|---|---|---|
| **PDF — Pixel Perfect** (default) | html2canvas captures canvas as rendered in Live Mode | Exact replica of screen layout |
| **PDF — Clean Doc** | Each module's `PrintView` renders into formatted pages | Readable clinical document |
| **Browser Print** | react-to-print with print stylesheet | System print dialog, always light mode |

Print preview always renders in light mode. Configurable page margins and orientation (portrait/landscape) per template. Multi-page templates export all pages in order with page breaks between them.

---

## Open Source Strategy

- **License:** MIT
- **Core modules:** 14 built-in modules serve as reference implementations
- **Specialty packs:** 12 first-party packs, community can add more via the same plugin interface
- **Module contributions:** npm packages implementing `ModulePlugin`; scaffolded via `npm create pt-plugin`
- **Template contributions:** `.ptjson` files submitted to community repo, browseable in-app
- **Docs:** Contributing guide, module authoring guide, clinical evidence standard, architecture overview

---

## Clinical Evidence Standard

All calculations in the `calculated` module, all specialty pack clinical scores, and any community-contributed module containing clinical formulas must meet this standard **without exception**:

- Every formula ships with a mandatory citation (journal article DOI, clinical guideline name+year, or validated scoring tool with known performance characteristics)
- Citations are displayed in the UI alongside the result — the user always sees the source
- If a formula has multiple validated variants (e.g., CKD-EPI 2021 vs MDRD for GFR), each variant is labeled and cited separately; the most current validated version is the default
- The custom formula editor requires a citation field before saving — it cannot be blank
- Community plugin PRs adding clinical calculators without citations are rejected at review
- No modifications to published formulas without explicit notation of the change and reason

---

## Out of Scope (v1)

- Real PHI storage or HIPAA compliance infrastructure
- Multi-user / collaborative real-time editing
- Cloud sync (manual export/import only)
- Native iOS/Android apps (PWA covers tablet use)
- EMR/EHR integration
