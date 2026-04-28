# Resume Builder — Developer Context

## Overview

Full-stack resume builder. Users fill structured sections (contact, summary, experience, education, skills, projects), pick from three templates with a live preview, and export to PDF.

## Monorepo Structure

npm workspaces with three packages:

```
resume_app/
├── shared/        # @resume-app/shared — TypeScript interfaces only
├── backend/       # Express API + Puppeteer PDF generation (port 3010)
└── frontend/      # React + Vite UI (port 5173)
```

Start both dev servers: `npm run dev` (from repo root)

## Shared Types — Source of Truth

All data interfaces live in `shared/src/types.ts` and are consumed by both backend and frontend via the `@resume-app/shared` workspace package.

**Current schema:**
- `LinkEntry` — label: string, url: string
- `ContactInfo` — name, email, phone, location, links?: LinkEntry[], profilePhoto? (base64)
- `ExperienceEntry` — id, company, title, startDate, endDate, location?, description: string (HTML), bullets?: string[] (legacy — kept for backward compat)
- `EducationEntry` — id, institution, degree, field, startDate, endDate, gpa?
- `ProjectEntry` — id, name, description, url?, technologies: string[]
- `SkillEntry` — name, level (1–5)
- `LanguageEntry` — name, level (1–5: Basic / Conversational / Intermediate / Advanced / Native)
- `ResumeData` — id, name?, contact, summary, experience[], education[], skills: SkillEntry[], languages: LanguageEntry[], projects[], selectedTemplate, language?, updatedAt
- `ResumeSummary` — id, name, updatedAt (lightweight type returned by the list endpoint)
- `TemplateId` — `'classic' | 'modern' | 'minimal'`
- `ResumeLanguage` — `'en' | 'de'`

**Rule:** changing the schema requires updating `shared/src/types.ts` AND the 3 React template components in `frontend/src/components/templates/`. Fields that are app-shell metadata only (e.g. `name`) do not need to be rendered in templates and can be safely ignored by them.

## API Endpoints

All routes are mounted at `/api` on the backend.

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/resumes` | Create empty resume, returns `{ id }` |
| `GET` | `/api/resumes` | List all resumes, returns `ResumeSummary[]` |
| `GET` | `/api/resumes/:id` | Fetch `ResumeData` |
| `PUT` | `/api/resumes/:id` | Save full `ResumeData` |
| `DELETE` | `/api/resumes/:id` | Delete a resume (404 if not found) |
| `GET` | `/api/resumes/:id/pdf` | Generate and stream PDF attachment |
| `GET` | `/api/templates` | Return `TemplateMetadata[]` |

**Route ordering note:** `GET /api/resumes` must be registered before `GET /api/resumes/:id` in the Express router. Express matches routes in declaration order; reversing them would cause the literal string `"resumes"` to be captured as an `:id` param.

## Storage

Resumes are persisted as JSON files at `backend/src/data/resumes/{id}.json`. Writes are atomic (write to `.tmp`, then `fs.rename`). No database.

## PDF Generation

Uses Puppeteer (headless Chromium). The browser instance is lazy-initialized on the first PDF request and reused for subsequent requests. It is closed on `SIGTERM`/`SIGINT`.

Puppeteer does **not** use a backend HTML renderer. Instead it navigates to the frontend print route (`/resume/:id/print`) which renders the same React template components used for the live preview. This guarantees pixel-identical font, spacing, and layout between preview and PDF. The page sets `document.body.dataset.renderDone = 'true'` when rendering is complete; Puppeteer waits for this signal before capturing the PDF.

**WSL2 requirement:** Chromium needs system libraries and fonts not present in WSL2 by default. Run once: `bash setup.sh`

## Session Persistence

The frontend stores the active resume ID in `localStorage` under the key `resume_app_id`. On load, if an ID exists it fetches that resume; otherwise it calls `POST /api/resumes` to create a new one. If the stored ID is stale (404), it silently creates a fresh resume.

Multiple resumes can exist on the backend simultaneously. The `useResume` hook fetches the full list via `GET /api/resumes` on init and exposes `resumeList`, `switchResume(id)`, `renameResume(name)`, and `createNewResume()`. Switching a resume updates `localStorage` to the new ID so the next page load restores the last active resume.

## Key Constraints

- PDF logic lives exclusively in `backend/src/services/pdfService.ts`
- Business logic must not be duplicated between frontend and backend
- Do not add fields to `ResumeData` without updating the 3 React template components
- Tailwind CSS is for the app shell UI only — resume templates use inline CSS strings for PDF fidelity
- Experience descriptions are stored as raw HTML in `ExperienceEntry.description`. The editor (`RichTextEditor.tsx`) uses `document.execCommand` to support bold, bullet lists, and numbered lists; the output is saved as innerHTML. Templates embed this directly as a `.entry-body` div. Old resumes with `bullets: string[]` still load — templates fall back to rendering the bullets array, and the editor auto-migrates them to HTML on first open.
- Template section labels (e.g. "Experience", "Skills") live in `frontend/src/utils/templateLabels.ts`. Each template resolves labels via `LABELS.<template>[data.language ?? 'en']`.
- `ContactInfo.links` is a free-form array of `{ label, url }` entries. All three templates render them as clickable `<a>` hyperlinks. Modern puts them in a dedicated sidebar "Links" section. Classic renders them inline in the contact line separated by ` | `. Minimal renders them as `<span><a>` elements in the contact line; the CSS `span + span::before` rule inserts ` · ` separators automatically.

## Docs

Detailed references in `/docs/`:
- `docs/context/architecture.md` — component tree, data flow, backend request lifecycle
- `docs/context/tech-stack.md` — all packages and their purpose
- `docs/features/resume-generation.md` — PDF generation deep-dive
