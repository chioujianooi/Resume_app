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
│       │   ├── resumeController.ts     # createResume, getResume, updateResume
│       │   └── pdfController.ts        # exportPdf
│       ├── services/
│       │   ├── storageService.ts       # saveResume, loadResume, resumeExists
│       │   └── pdfService.ts           # getBrowser (lazy), generatePdf, closeBrowser
│       ├── templates/
│       │   ├── index.ts                # TEMPLATES metadata + renderTemplate() dispatcher
│       │   ├── classic.ts              # renderClassic(data) → HTML string
│       │   ├── modern.ts               # renderModern(data) → HTML string
│       │   └── minimal.ts              # renderMinimal(data) → HTML string
│       └── data/resumes/               # Persisted JSON files: {id}.json
└── frontend/
    └── src/
        ├── api/resumeApi.ts            # All fetch() calls
        ├── hooks/useResume.ts          # State + 500ms auto-save debounce
        ├── pages/BuilderPage.tsx       # Top-level page; loading/error/saving states
        ├── components/
        │   ├── layout/AppShell.tsx     # 42/58 split-panel layout
        │   ├── editor/
        │   │   ├── ResumeEditor.tsx    # 6-tab container
        │   │   ├── ContactSection.tsx  # + photo upload
        │   │   ├── SummarySection.tsx
        │   │   ├── ExperienceSection.tsx
        │   │   ├── EducationSection.tsx
        │   │   ├── SkillsSection.tsx   # + proficiency dots (1–5)
        │   │   └── ProjectsSection.tsx
        │   ├── preview/
        │   │   ├── ResumePreview.tsx   # A4 wrapper (794px) + Export PDF button
        │   │   └── TemplatePicker.tsx  # 3 template buttons
        │   └── templates/
        │       ├── ClassicTemplate.tsx
        │       ├── ModernTemplate.tsx
        │       └── MinimalTemplate.tsx
```

---

## Data Flow

### Auto-save (edit → persist)

```
User types in editor
  → component calls onChange(updatedResume)
  → BuilderPage passes to updateResume()
  → useResume: setResume(updated) [immediate local update]
  → useResume: debounce 500ms
  → saveResume(data) → PUT /api/resumes/:id
  → resumeController.updateResume
  → storageService.saveResume → {id}.json (atomic write)
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
└── AppShell (42% left / 58% right)
    ├── [left] ResumeEditor
    │   └── tabs: Contact | Summary | Experience | Education | Skills | Projects
    │       ├── ContactSection      (name, email, phone, location, links, photo upload)
    │       ├── SummarySection      (textarea + char count)
    │       ├── ExperienceSection   (collapsible cards; multi-line bullet textareas)
    │       ├── EducationSection    (collapsible cards)
    │       ├── SkillsSection       (tag input + 5-dot level picker per skill)
    │       └── ProjectsSection     (collapsible cards + tech tag input)
    └── [right]
        ├── TemplatePicker          (classic / modern / minimal buttons)
        └── ResumePreview
            ├── A4 div (794×1123px, drop shadow)
            │   └── ClassicTemplate | ModernTemplate | MinimalTemplate
            └── Export PDF button
```

---

## State Management

All resume state lives in the `useResume` hook (`frontend/src/hooks/useResume.ts`). There is no global state store (no Redux, no Context for resume data).

- **Initial load:** reads `resume_app_id` from `localStorage`; fetches resume or creates a new one
- **Updates:** `updateResume(data)` sets state immediately (optimistic) and schedules a debounced save
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

The dispatcher `renderTemplate(data, templateId)` in `backend/src/templates/index.ts` routes to the correct renderer.

---

## Session Model

One resume per browser session. The resume ID is stored in `localStorage`. The backend has no concept of users or authentication. Clearing `localStorage` or using a different browser starts a fresh resume.
