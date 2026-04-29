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
│       ├── routes/
│       │   ├── resume.ts               # Resume route definitions
│       │   └── coverLetter.ts          # Cover letter route definitions
│       ├── controllers/
│       │   ├── resumeController.ts     # createResume, getResumes, getResume, updateResume, removeResume
│       │   ├── pdfController.ts        # exportPdf (resume)
│       │   ├── coverLetterController.ts# createCoverLetter, getCoverLetters, getCoverLetter, updateCoverLetter, removeCoverLetter
│       │   └── coverLetterPdfController.ts # exportCoverLetterPdf
│       ├── services/
│       │   ├── storageService.ts       # saveResume, loadResume, resumeExists, listResumes, deleteResume
│       │   ├── coverLetterStorageService.ts # saveCoverLetter, loadCoverLetter, coverLetterExists, listCoverLetters, deleteCoverLetter
│       │   └── pdfService.ts           # getBrowser (lazy), generatePdf, generateCoverLetterPdf, closeBrowser
│       └── data/
│           ├── resumes/                # Persisted resume JSON files: {id}.json
│           └── cover-letters/          # Persisted cover letter JSON files: {id}.json
└── frontend/
    └── src/
        ├── api/
        │   ├── resumeApi.ts            # Resume fetch() calls
        │   └── coverLetterApi.ts       # Cover letter fetch() calls
        ├── hooks/
        │   ├── useResume.ts            # State + auto-save + multi-resume management
        │   └── useCoverLetter.ts       # State + auto-save + multi-cover-letter management
        ├── pages/
        │   ├── BuilderPage.tsx         # Resume builder; loading/error/saving states
        │   ├── PrintPage.tsx           # Resume print-only view for Puppeteer
        │   ├── CoverLetterBuilderPage.tsx # Cover letter builder; resume picker on first use
        │   └── CoverLetterPrintPage.tsx   # Cover letter print-only view for Puppeteer
        ├── components/
        │   ├── layout/
        │   │   ├── AppShell.tsx            # 42/58 split-panel layout; headerLeft/headerRight slots (reused by both builders)
        │   │   ├── ResumeNameInput.tsx     # Inline-editable resume name in the header
        │   │   ├── ResumeListDrawer.tsx    # Slide-in drawer; per-row duplicate + delete actions; "Cover Letters →" footer link
        │   │   └── CoverLetterListDrawer.tsx # Slide-in drawer for cover letters; delete + "← Resume Builder" footer link
        │   ├── editor/
        │   │   ├── ResumeEditor.tsx        # 7-tab container
        │   │   ├── ContactSection.tsx      # + dynamic links list + photo upload
        │   │   ├── SummarySection.tsx
        │   │   ├── ExperienceSection.tsx
        │   │   ├── RichTextEditor.tsx      # contenteditable rich-text input; bold / bullet list / numbered list toolbar
        │   │   ├── EducationSection.tsx
        │   │   ├── SkillsSection.tsx       # + proficiency level (1–5, displayed as text label)
        │   │   ├── LanguagesSection.tsx    # tag input + 5-dot level picker; levels: Basic/Conversational/Intermediate/Advanced/Native
        │   │   ├── ProjectsSection.tsx
        │   │   └── CoverLetterEditor.tsx   # Linear form: targetJob, targetCompany, date + RichTextEditor for opening/body/closing
        │   ├── preview/
        │   │   ├── ResumePreview.tsx       # A4 wrapper (794px) + Export PDF + Export JSON
        │   │   ├── TemplatePicker.tsx      # Template buttons (classic/modern/minimal) + language toggle (EN/DE)
        │   │   └── CoverLetterPreview.tsx  # A4 wrapper (794px) + language toggle (EN/DE) + Export PDF
        │   └── templates/
        │       ├── ClassicTemplate.tsx
        │       ├── ModernTemplate.tsx
        │       ├── MinimalTemplate.tsx
        │       └── CoverLetterTemplate.tsx # Single cover letter template; Lato font; CSS-only layout
        └── utils/
            ├── bulletFormat.ts             # parseBold(text) → React.ReactNode (legacy; no longer used by templates)
            └── templateLabels.ts           # Resume section label translations (LABELS) + cover letter labels (COVER_LETTER_LABELS) { en, de }
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

### PDF export (resume)

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

### Cover letter creation

```
User navigates to /cover-letter (no stored id in localStorage)
  → CoverLetterBuilderPage renders ResumePicker
  → useCoverLetter: listCoverLetters() → [] (empty)
  → coverLetter = null

User selects a resume in ResumePicker
  → createCoverLetter(resumeId) → POST /api/cover-letters { resumeId }
  → coverLetterController.createCoverLetter
      → storageService.loadResume(resumeId)   [load source resume]
      → top 3 skills by level → seed boilerplate body
      → saveCoverLetter(newCoverLetter) → {id}.json
      → returns { id }
  → navigate('/cover-letter/:id')
  → CoverLetterBuilderPage: paramId changes → useEffect calls switchCoverLetter(id)
  → useCoverLetter: fetchCoverLetter(id) + listCoverLetters() in parallel
  → coverLetter set → editor rendered
```

### Cover letter auto-save

```
User edits any field (targetJob, targetCompany, opening, body, closing, etc.)
  → CoverLetterEditor calls onChange(updatedCoverLetter)
  → CoverLetterBuilderPage passes to updateCoverLetter()
  → useCoverLetter: setCoverLetter(updated) [immediate local update]
  → useCoverLetter: debounce 500ms
  → saveCoverLetter(data) → PUT /api/cover-letters/:id
  → coverLetterController.updateCoverLetter → coverLetterStorageService.saveCoverLetter
```

### Cover letter PDF export

```
User clicks "Export PDF"
  → CoverLetterPreview: fetch(getCoverLetterPdfUrl(id))
  → GET /api/cover-letters/:id/pdf
  → coverLetterPdfController.exportCoverLetterPdf
  → coverLetterStorageService.loadCoverLetter(id)
  → pdfService.generateCoverLetterPdf(data)
      → getBrowser() [same singleton as resume PDF]
      → page.goto('http://localhost:5173/cover-letter/:id/print', { waitUntil: 'networkidle0' })
           └─ CoverLetterPrintPage.tsx fetches cover letter, renders CoverLetterTemplate
                └─ document.fonts.ready → signalReady()
      → page.waitForFunction('document.body.dataset.renderDone === "true"')
      → page.pdf({ format: 'A4', printBackground: true, margin: 0 })
  → response: attachment; filename="{name}-cover-letter.pdf"
```

---

## Frontend Component Tree

### Resume builder (`/`)

```
BuilderPage
├── ResumeListDrawer (position: fixed; slides in over left panel)
│   └── footer: "+ New Resume" | "Cover Letters →" (navigates to /cover-letter)
└── AppShell (42% left / 58% right)
    ├── [header left] hamburger button + ResumeNameInput
    ├── [header right] "Auto-saves"
    ├── [left] ResumeEditor
    │   └── tabs: Contact | Summary | Experience | Education | Skills | Languages | Projects
    │       ├── ContactSection      (name, email, phone, location, links, photo upload)
    │       ├── SummarySection      (textarea + char count)
    │       ├── ExperienceSection   (collapsible cards; description field uses RichTextEditor)
    │       ├── EducationSection    (collapsible cards)
    │       ├── SkillsSection       (tag input + text level picker: Basic/Familiar/Intermediate/Advanced/Expert)
    │       ├── LanguagesSection    (tag input + 5-dot level picker: Basic/Conversational/Intermediate/Advanced/Native)
    │       └── ProjectsSection     (collapsible cards + tech tag input)
    └── [right]
        ├── TemplatePicker          (classic / modern / minimal buttons + EN / DE language toggle)
        └── ResumePreview
            ├── A4 page(s) (794×1123px each, drop shadow)
            │   └── ClassicTemplate | ModernTemplate | MinimalTemplate
            ├── Export PDF button
            └── Export JSON button
```

### Cover letter builder (`/cover-letter` and `/cover-letter/:id`)

```
CoverLetterBuilderPage
├── [null state — no cover letter yet]
│   └── ResumePicker (inline card; fetches resume list; creates cover letter on selection)
└── [loaded state]
    ├── CoverLetterListDrawer (position: fixed; slides in over left panel)
    │   └── footer: "+ New Cover Letter" | "← Resume Builder" (navigates to /)
    └── AppShell (42% left / 58% right)
        ├── [header left] hamburger button + inline name input
        ├── [header right] "← Resume Builder" link + "Auto-saves"
        ├── [left] CoverLetterEditor (linear form, no tabs)
        │   ├── Target Job / Position  (text input)
        │   ├── Target Company         (text input)
        │   ├── Date                   (text input, free-form)
        │   ├── Opening                (RichTextEditor)
        │   ├── Body                   (RichTextEditor, taller)
        │   └── Closing                (RichTextEditor)
        └── [right] CoverLetterPreview
            ├── toolbar: EN / DE language toggle + Export PDF button
            └── A4 page(s) (794×1123px each, drop shadow)
                └── CoverLetterTemplate
```

---

## State Management

All resume state lives in the `useResume` hook (`frontend/src/hooks/useResume.ts`). All cover letter state lives in `useCoverLetter` (`frontend/src/hooks/useCoverLetter.ts`). There is no global state store.

### useResume

- **Initial load:** reads `resume_app_id` from `localStorage`; fetches active resume or creates a new one; fetches the full resume list via `GET /api/resumes`
- **Updates:** `updateResume(data)` sets state immediately (optimistic) and schedules a debounced save
- **Rename:** `renameResume(name)` updates the active resume's name optimistically and triggers a debounced save
- **Switch:** `switchResume(id)` cancels any pending save, fetches the target resume, updates `localStorage`
- **New resume:** `createNewResume()` creates via the API, loads it, refreshes the list
- **Duplicate:** `duplicateResume(id)` fetches the source, creates a new ID, saves a copy named "Copy of …", then loads the copy
- **Delete:** `removeResume(id)` calls `DELETE /api/resumes/:id`, refreshes the list, and if the deleted resume was active it switches to the next available resume (or creates a fresh one if the list is now empty)
- **Resume list:** `resumeList: ResumeSummary[]` is kept in sync after every mutation
- **Saving indicator:** `saving` boolean exposed to `BuilderPage` for the "Saving..." badge
- **Error state:** if the backend is unreachable, `error` string is set and the page shows a retry screen

### useCoverLetter

Mirrors `useResume` with these key differences:

- **Initial load:** reads `resume_app_cover_letter_id` from `localStorage`; if no stored ID, sets `coverLetter = null` without auto-creating (the page handles the null state with a resume picker). If the stored ID returns 404 (stale), clears localStorage and sets null.
- **Switch:** `switchCoverLetter(id)` fetches the cover letter AND refreshes the list in parallel (needed so newly created cover letters appear in the drawer immediately after creation + navigation).
- **No auto-create, no duplicate:** cover letters are always created from an existing resume via the `POST /api/cover-letters` endpoint. Duplication is not supported.
- **Delete:** if the deleted cover letter was active, switches to `remaining[0]` or sets `coverLetter = null` (returns to resume picker state).

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

All template components are the single source of truth for visual output. Each injects its own CSS via `<style>{CSS}</style>` inside JSX. No backend template files exist — there is nothing to keep in sync.

### Resume templates

| File | Export | Notes |
|------|--------|-------|
| `ClassicTemplate.tsx` | `function ClassicTemplate({ resume })` | Georgia serif; CSS-only pagination |
| `ModernTemplate.tsx` | `function ModernTemplate({ resume, onReady? })` | Navy sidebar; JS pagination via `useLayoutEffect` |
| `MinimalTemplate.tsx` | `function MinimalTemplate({ resume })` | Airy; CSS-only pagination |

**PDF path:** Puppeteer navigates to `/resume/:id/print` → `PrintPage.tsx` fetches the resume and renders the appropriate template. Readiness signal:
- **Modern:** calls `onReady()` after JS pagination completes.
- **Classic / Minimal:** `PrintPage` calls `document.fonts.ready.then(signalReady)`.

### Cover letter template

| File | Export | Notes |
|------|--------|-------|
| `CoverLetterTemplate.tsx` | `function CoverLetterTemplate({ coverLetter })` | Lato font; CSS-only single-page layout; 210mm × 297mm with 22mm/24mm padding |

**PDF path:** Puppeteer navigates to `/cover-letter/:id/print` → `CoverLetterPrintPage.tsx` fetches the cover letter and renders `CoverLetterTemplate`. Readiness signal: `document.fonts.ready.then(signalReady)` (same as Classic/Minimal).

### Labels / i18n

Section label translations live in `frontend/src/utils/templateLabels.ts`:

- **`LABELS`** — resume template labels (`LABELS.<template>[language ?? 'en']`)
- **`COVER_LETTER_LABELS`** — cover letter labels (`COVER_LETTER_LABELS[language ?? 'en']`): subject line prefix, preposition ("at" / "bei"), and empty-field placeholders

---

## Session Model

Multiple resumes and cover letters can exist on the backend at the same time, each stored as its own `{id}.json` file.

| Document type | localStorage key | Auto-create on init? | Storage path |
|--------------|-----------------|---------------------|--------------|
| Resume | `resume_app_id` | Yes — creates blank resume if none | `backend/src/data/resumes/` |
| Cover letter | `resume_app_cover_letter_id` | No — shows resume picker | `backend/src/data/cover-letters/` |

The `ResumeListDrawer` lets users switch between saved resumes or navigate to the cover letter builder. The `CoverLetterListDrawer` lets users switch between saved cover letters or navigate back to the resume builder.

Clearing `localStorage` or using a different browser: resumes will cause a fresh resume to be auto-created on next load; cover letters will show the resume picker. All previously saved documents remain on disk.
