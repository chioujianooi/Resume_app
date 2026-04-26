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
│       ├── templates/
│       │   ├── index.ts                # TEMPLATES metadata + renderTemplate() dispatcher
│       │   ├── labels.ts               # Section label translations for all templates { en, de }
│       │   ├── classic.ts              # renderClassic(data) → HTML string
│       │   ├── modern.ts               # renderModern(data) → HTML string
│       │   └── minimal.ts              # renderMinimal(data) → HTML string
│       └── data/resumes/               # Persisted JSON files: {id}.json
└── frontend/
    └── src/
        ├── api/resumeApi.ts            # All fetch() calls (incl. listResumes)
        ├── hooks/useResume.ts          # State + auto-save + multi-resume management
        ├── pages/BuilderPage.tsx       # Top-level page; loading/error/saving states
        ├── components/
        │   ├── layout/
        │   │   ├── AppShell.tsx        # 42/58 split-panel layout; headerLeft/headerRight slots
        │   │   ├── ResumeNameInput.tsx # Inline-editable resume name in the header
        │   │   └── ResumeListDrawer.tsx# Slide-in drawer; per-row duplicate + delete actions (revealed on hover)
        │   ├── editor/
        │   │   ├── ResumeEditor.tsx    # 6-tab container
        │   │   ├── ContactSection.tsx  # + dynamic links list + photo upload
        │   │   ├── SummarySection.tsx
        │   │   ├── ExperienceSection.tsx
        │   │   ├── BulletEditor.tsx    # contenteditable bullet input; renders **bold** visually
        │   │   ├── EducationSection.tsx
        │   │   ├── SkillsSection.tsx   # + proficiency dots (1–5)
        │   │   └── ProjectsSection.tsx
        │   ├── preview/
        │   │   ├── ResumePreview.tsx   # A4 wrapper (794px) + Export PDF button + Export JSON button
        │   │   └── TemplatePicker.tsx  # Template buttons (classic/modern/minimal) + language toggle (EN/DE)
        │   └── templates/
        │       ├── ClassicTemplate.tsx
        │       ├── ModernTemplate.tsx
        │       └── MinimalTemplate.tsx
        └── utils/
            ├── bulletFormat.ts         # parseBold(text) → React.ReactNode; used by all 3 React templates
            └── templateLabels.ts       # Section label translations for all templates { en, de } (mirrors backend labels.ts)
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
  → templates/index.renderTemplate(data, templateId)  → HTML string
  → pdfService.generatePdf(data)
      → getBrowser() [lazy Puppeteer init]
      → page.setContent(html, { waitUntil: 'networkidle0' })
      → page.pdf({ format: 'A4', printBackground: true })
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
    │   └── tabs: Contact | Summary | Experience | Education | Skills | Projects
    │       ├── ContactSection      (name, email, phone, location, links, photo upload)
    │       ├── SummarySection      (textarea + char count)
    │       ├── ExperienceSection   (collapsible cards; bullets use BulletEditor — supports **bold**)
    │       ├── EducationSection    (collapsible cards)
    │       ├── SkillsSection       (tag input + 5-dot level picker per skill)
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

Each template exists in two mirrors:

| | Backend | Frontend |
|---|---|---|
| File | `backend/src/templates/{name}.ts` | `frontend/src/components/templates/{Name}Template.tsx` |
| Export | `renderXxx(data: ResumeData): string` | `function XxxTemplate({ resume }: { resume: ResumeData })` |
| CSS | Embedded in `<style>` in the returned HTML string | Injected via `<style>{CSS}</style>` inside JSX |
| Used by | Puppeteer PDF generation | Live preview in browser |

The CSS constant (`const CSS = \`...\``) must be identical in both files. This is enforced by convention — there is no build-time check.

Section label translations (e.g. "Experience" → "Berufserfahrung") live in a parallel pair of files that must also be kept in sync:

| | Backend | Frontend |
|---|---|---|
| File | `backend/src/templates/labels.ts` | `frontend/src/utils/templateLabels.ts` |
| Shape | `LABELS.<template>.<lang>.<key>` | identical |

Each template renderer resolves its labels with `const L = LABELS.<template>[data.language ?? 'en']` and uses `L.<key>` wherever a section heading or fixed label appears.

The dispatcher `renderTemplate(data, templateId)` in `backend/src/templates/index.ts` routes to the correct renderer.

---

## Session Model

Multiple resumes can exist on the backend at the same time, each stored as its own `{id}.json` file. The frontend tracks which resume is active via `resume_app_id` in `localStorage`. The `ResumeListDrawer` lets users switch between all saved resumes or create new ones. Clearing `localStorage` or using a different browser will cause the app to create a fresh resume on next load, but existing resumes remain on disk and can be recovered if their IDs are known.
