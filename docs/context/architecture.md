# Architecture

## Monorepo Layout

```
resume_app/
├── package.json                        # npm workspaces root; "dev" and "build" scripts
├── setup.sh                            # One-time WSL2 system dep installer (run with sudo)
├── shared/
│   └── src/types.ts                    # All TypeScript interfaces — source of truth
├── backend/
│   └── src/
│       ├── index.ts                    # Express entry; SIGTERM/SIGINT handler
│       ├── routes/resume.ts            # Route definitions
│       ├── controllers/
│       │   ├── resumeController.ts     # createResume, getResumes, getResume, updateResume, removeResume
│       │   └── pdfController.ts        # exportPdf
│       ├── services/
│       │   ├── storageService.ts       # saveResume, loadResume, resumeExists, listResumes, deleteResume
│       │   └── pdfService.ts           # getBrowser (lazy), generatePdf, closeBrowser
│       └── data/resumes/               # Persisted JSON files: {id}.json
└── frontend/
    └── src/
        ├── api/resumeApi.ts            # All fetch() calls (incl. listResumes)
        ├── hooks/useResume.ts          # State + auto-save + multi-resume management
        ├── pages/
│       │   ├── BuilderPage.tsx         # Top-level page; loading/error/saving states
│       │   └── PrintPage.tsx           # Print-only view for Puppeteer PDF generation
        ├── components/
        │   ├── layout/
        │   │   ├── AppShell.tsx        # 42/58 split-panel layout; headerLeft/headerRight slots
        │   │   ├── ResumeNameInput.tsx # Inline-editable resume name in the header
        │   │   └── ResumeListDrawer.tsx# Slide-in drawer; per-row duplicate + delete actions (revealed on hover)
        │   ├── editor/
        │   │   ├── ResumeEditor.tsx    # 7-tab container
        │   │   ├── ContactSection.tsx  # + dynamic links list + photo upload
        │   │   ├── SummarySection.tsx
        │   │   ├── ExperienceSection.tsx
        │   │   ├── RichTextEditor.tsx  # contenteditable rich-text input; bold / bullet list / numbered list toolbar
        │   │   ├── EducationSection.tsx
        │   │   ├── SkillsSection.tsx   # + proficiency level (1–5, displayed as text label)
        │   │   ├── LanguagesSection.tsx # tag input + 5-dot level picker; levels: Basic/Conversational/Intermediate/Advanced/Native
        │   │   └── ProjectsSection.tsx
        │   ├── preview/
        │   │   ├── ResumePreview.tsx   # A4 wrapper (794px) + Export PDF button + Export JSON button
        │   │   └── TemplatePicker.tsx  # Template buttons (classic/modern/minimal) + language toggle (EN/DE)
        │   └── templates/
        │       ├── ClassicTemplate.tsx
        │       ├── ModernTemplate.tsx
        │       └── MinimalTemplate.tsx
        └── utils/
            ├── bulletFormat.ts         # parseBold(text) → React.ReactNode (legacy; no longer used by templates)
            └── templateLabels.ts       # Section label translations for all templates { en, de }
```

---

## Data Flow

### Auto-save (edit → persist)

```
User types in editor
  → component calls onChange(updatedResume)
  → BuilderPage passes to updateResume()
  → useResume: setResume(updated) [immediate local update]
  → useResume: patch resumeList entry in-place (name/updatedAt)
  → useResume: debounce 500ms
  → saveResume(data) → PUT /api/resumes/:id
  → resumeController.updateResume
  → storageService.saveResume → {id}.json (atomic write)
  → on success: patch resumeList entry with server-confirmed updatedAt
```

### Resume rename

```
User clicks resume name in header → ResumeNameInput focuses
User types new name → on blur/Enter
  → renameResume(name) in useResume
  → optimistic update: setResume({ ...resume, name })
                        patch resumeList entry in-place
  → debounced PUT /api/resumes/:id (same auto-save path)
```

### Resume switching

```
User opens ResumeListDrawer → clicks a different resume
  → switchResume(id) in useResume
  → cancel any pending debounced save
  → fetchResume(id) → GET /api/resumes/:id
  → setResume(data), localStorage.setItem(STORAGE_KEY, id)
  → editor and preview re-render with new resume data
```

### New resume creation

```
User clicks "+ New Resume" in ResumeListDrawer
  → createNewResume() in useResume
  → POST /api/resumes → new id
  → fetchResume(id), setResume, localStorage update
  → listResumes() → GET /api/resumes → setResumeList (refreshed)
```

### Resume duplication

```
User hovers a resume row in ResumeListDrawer → clicks copy icon
  → duplicateResume(id) in useResume
  → cancel any pending debounced save
  → fetchResume(id) → GET /api/resumes/:id   [load source data]
  → createResume()  → POST /api/resumes       [allocate new id]
  → saveResume({ ...source, id: newId, name: 'Copy of ...' }) → PUT /api/resumes/:newId
  → loadAndSetResume(newId), localStorage update
  → listResumes() → GET /api/resumes → setResumeList (refreshed)
```

### Resume deletion

```
User hovers a resume row in ResumeListDrawer → clicks trash icon
  → removeResume(id) in useResume
  → cancel any pending debounced save
  → DELETE /api/resumes/:id
  → resumeController.removeResume
  → storageService.deleteResume → fs.unlink({id}.json)
  → listResumes() → setResumeList (refreshed)
  → if deleted resume was active:
      remaining list non-empty → loadAndSetResume(remaining[0].id)
      list now empty           → createResume() + loadAndSetResume (fresh resume)
```

### PDF export

```
User clicks "Export PDF"
  → ResumePreview: fetch(getPdfUrl(id))
  → GET /api/resumes/:id/pdf
  → pdfController.exportPdf
  → storageService.loadResume(id)
  → pdfService.generatePdf(data)
      → getBrowser() [lazy Puppeteer init]
      → page.setViewport({ width: 794, height: 1123 })
      → page.goto('http://localhost:5173/resume/:id/print', { waitUntil: 'networkidle0' })
           └─ PrintPage.tsx fetches resume, renders the correct React template
                └─ ModernTemplate: measures blocks, paginates, calls onReady()
                   Classic/Minimal: document.fonts.ready → signalReady()
      → page.waitForFunction('document.body.dataset.renderDone === "true"')
      → page.pdf({ format: 'A4', printBackground: true, margin: 0 })
  → response: Content-Type: application/pdf, Content-Disposition: attachment
  → browser creates <a> and clicks it to trigger download
```

---

## Frontend Component Tree

```
BuilderPage
├── ResumeListDrawer (position: fixed; slides in over left panel)
└── AppShell (42% left / 58% right)
    ├── [header left] ResumeNameInput   (inline-editable resume name)
    ├── [header right] "Auto-saves" + hamburger toggle
    ├── [left] ResumeEditor
    │   └── tabs: Contact | Summary | Experience | Education | Skills | Languages | Projects
    │       ├── ContactSection      (name, email, phone, location, links, photo upload)
    │       ├── SummarySection      (textarea + char count)
    │       ├── ExperienceSection   (collapsible cards; description field uses RichTextEditor — bold / bullet / numbered list)
    │       ├── EducationSection    (collapsible cards)
    │       ├── SkillsSection       (tag input + text level picker per skill: Basic/Familiar/Intermediate/Advanced/Expert)
    │       ├── LanguagesSection    (tag input + 5-dot level picker; Basic/Conversational/Intermediate/Advanced/Native)
    │       └── ProjectsSection     (collapsible cards + tech tag input)
    └── [right]
        ├── TemplatePicker          (classic / modern / minimal buttons + EN / DE language toggle)
        └── ResumePreview
            ├── A4 div (794×1123px, drop shadow)
            │   └── ClassicTemplate | ModernTemplate | MinimalTemplate
            └── Export PDF button
```

---

## State Management

All resume state lives in the `useResume` hook (`frontend/src/hooks/useResume.ts`). There is no global state store (no Redux, no Context for resume data).

- **Initial load:** reads `resume_app_id` from `localStorage`; fetches active resume or creates a new one; fetches the full resume list via `GET /api/resumes`
- **Updates:** `updateResume(data)` sets state immediately (optimistic) and schedules a debounced save
- **Rename:** `renameResume(name)` updates the active resume's name optimistically and triggers a debounced save
- **Switch:** `switchResume(id)` cancels any pending save, fetches the target resume, updates `localStorage`
- **New resume:** `createNewResume()` creates via the API, loads it, refreshes the list
- **Duplicate:** `duplicateResume(id)` fetches the source, creates a new ID, saves a copy named "Copy of …", then loads the copy
- **Delete:** `removeResume(id)` calls `DELETE /api/resumes/:id`, refreshes the list, and if the deleted resume was active it switches to the next available resume (or creates a fresh one if the list is now empty)
- **Resume list:** `resumeList: ResumeSummary[]` is kept in sync after every mutation without a full refetch (except after creating a new resume)
- **Saving indicator:** `saving` boolean exposed to `BuilderPage` for the "Saving..." badge
- **Error state:** if the backend is unreachable, `error` string is set and the page shows a retry screen

---

## Backend Request Lifecycle

```
Express route
  → controller (validates params, calls services, sets HTTP status)
  → service (pure I/O: filesystem reads/writes or Puppeteer)
  → controller returns JSON or binary response
```

Controllers never call other controllers. Services never import from controllers.

---

## Template Architecture

The three React template components are the single source of truth for visual output:

| File | Export | Used by |
|------|--------|---------|
| `frontend/src/components/templates/ClassicTemplate.tsx` | `function ClassicTemplate({ resume })` | Live preview + PDF (via Puppeteer) |
| `frontend/src/components/templates/ModernTemplate.tsx` | `function ModernTemplate({ resume, onReady? })` | Live preview + PDF (via Puppeteer) |
| `frontend/src/components/templates/MinimalTemplate.tsx` | `function MinimalTemplate({ resume })` | Live preview + PDF (via Puppeteer) |

Each component injects its own CSS via `<style>{CSS}</style>` inside JSX. No backend template files exist — there is nothing to keep in sync.

**PDF path:** Puppeteer navigates to `frontend/src/pages/PrintPage.tsx` (`/resume/:id/print`), which fetches the resume and renders the appropriate template component. The component signals readiness by setting `document.body.dataset.renderDone = 'true'`, which Puppeteer waits on before capturing the PDF.

- **Modern:** uses `useLayoutEffect` to measure block heights in a hidden container, paginate content into A4 pages, then calls `onReady()` via `useEffect` after the browser paints.
- **Classic / Minimal:** CSS-only layout; `PrintPage` calls `document.fonts.ready.then(signalReady)` once the resume data is loaded.

Section label translations (e.g. "Experience" → "Berufserfahrung") live exclusively in `frontend/src/utils/templateLabels.ts`. Each template resolves the active language with `const L = LABELS.<template>[data.language ?? 'en']`.

---

## Session Model

Multiple resumes can exist on the backend at the same time, each stored as its own `{id}.json` file. The frontend tracks which resume is active via `resume_app_id` in `localStorage`. The `ResumeListDrawer` lets users switch between all saved resumes or create new ones. Clearing `localStorage` or using a different browser will cause the app to create a fresh resume on next load, but existing resumes remain on disk and can be recovered if their IDs are known.
