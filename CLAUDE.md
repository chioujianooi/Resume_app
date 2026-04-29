# Resume Builder — Developer Context

## Overview

Full-stack resume builder. Users fill structured sections (contact, summary, experience, education, skills, projects), pick from three templates with a live preview, and export to PDF. A separate cover letter builder allows users to create, edit, and export cover letters linked to an existing resume.

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
- `CoverLetterData` — id, name?, resumeId, contact: ContactInfo (snapshot), targetJob, targetCompany, date, opening (HTML), body (HTML), closing (HTML), language?, updatedAt
- `CoverLetterSummary` — id, name?, resumeId, updatedAt
- `TemplateId` — `'classic' | 'modern' | 'minimal'`
- `ResumeLanguage` — `'en' | 'de'`

**Rule:** changing the schema requires updating `shared/src/types.ts` AND the 3 React template components in `frontend/src/components/templates/`. Fields that are app-shell metadata only (e.g. `name`) do not need to be rendered in templates and can be safely ignored by them. Cover letter fields only need to be reflected in `CoverLetterTemplate.tsx`.

## API Endpoints

All routes are mounted at `/api` on the backend.

**Resumes:**

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/resumes` | Create empty resume, returns `{ id }` |
| `GET` | `/api/resumes` | List all resumes, returns `ResumeSummary[]` |
| `GET` | `/api/resumes/:id` | Fetch `ResumeData` |
| `PUT` | `/api/resumes/:id` | Save full `ResumeData` |
| `DELETE` | `/api/resumes/:id` | Delete a resume (404 if not found) |
| `GET` | `/api/resumes/:id/pdf` | Generate and stream PDF attachment |
| `GET` | `/api/templates` | Return `TemplateMetadata[]` |

**Cover letters:**

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/cover-letters` | Create cover letter from `{ resumeId }`, seeds boilerplate, returns `{ id }` |
| `GET` | `/api/cover-letters` | List all cover letters, returns `CoverLetterSummary[]` |
| `GET` | `/api/cover-letters/:id` | Fetch `CoverLetterData` |
| `PUT` | `/api/cover-letters/:id` | Save full `CoverLetterData` |
| `DELETE` | `/api/cover-letters/:id` | Delete a cover letter (404 if not found) |
| `GET` | `/api/cover-letters/:id/pdf` | Generate and stream PDF attachment |

**Route ordering note:** `GET /api/resumes` must be registered before `GET /api/resumes/:id` in the Express router (same applies to cover letters). Express matches routes in declaration order; reversing them would cause the literal string `"resumes"` / `"cover-letters"` to be captured as an `:id` param. The PDF route (`/:id/pdf`) is also registered before `/:id` for the same reason.

## Storage

Resumes are persisted as JSON files at `backend/src/data/resumes/{id}.json`. Cover letters are persisted at `backend/src/data/cover-letters/{id}.json`. Both use the same atomic write pattern (write to `.tmp`, then `fs.rename`). No database.

## PDF Generation

Uses Puppeteer (headless Chromium). The browser instance is lazy-initialized on the first PDF request and reused for subsequent requests. It is closed on `SIGTERM`/`SIGINT`.

Puppeteer does **not** use a backend HTML renderer. Instead it navigates to the frontend print route which renders the same React template components used for the live preview. This guarantees pixel-identical font, spacing, and layout between preview and PDF. The page sets `document.body.dataset.renderDone = 'true'` when rendering is complete; Puppeteer waits for this signal before capturing the PDF.

- Resume print route: `/resume/:id/print` → `PrintPage.tsx` → `ClassicTemplate | ModernTemplate | MinimalTemplate`
- Cover letter print route: `/cover-letter/:id/print` → `CoverLetterPrintPage.tsx` → `CoverLetterTemplate`

Both share the same singleton Puppeteer browser instance via `pdfService.ts`.

**WSL2 requirement:** Chromium needs system libraries and fonts not present in WSL2 by default. Run once: `bash setup.sh`

## Session Persistence

The frontend stores the active resume ID in `localStorage` under the key `resume_app_id`. On load, if an ID exists it fetches that resume; otherwise it calls `POST /api/resumes` to create a new one. If the stored ID is stale (404), it silently creates a fresh resume.

Multiple resumes can exist on the backend simultaneously. The `useResume` hook fetches the full list via `GET /api/resumes` on init and exposes `resumeList`, `switchResume(id)`, `renameResume(name)`, and `createNewResume()`. Switching a resume updates `localStorage` to the new ID so the next page load restores the last active resume.

Cover letters use the same pattern: active cover letter ID is stored under `resume_app_cover_letter_id` in `localStorage`. The `useCoverLetter` hook does **not** auto-create on init — if no ID is stored, `coverLetter` is `null` and `CoverLetterBuilderPage` shows a resume-picker to create the first one.

## Key Constraints

- PDF logic lives exclusively in `backend/src/services/pdfService.ts`
- Business logic must not be duplicated between frontend and backend
- Do not add fields to `ResumeData` without updating the 3 React template components
- Tailwind CSS is for the app shell UI only — resume templates use inline CSS strings for PDF fidelity
- Experience descriptions are stored as raw HTML in `ExperienceEntry.description`. The editor (`RichTextEditor.tsx`) uses `document.execCommand` to support bold, bullet lists, and numbered lists; the output is saved as innerHTML. Templates embed this directly as a `.entry-body` div. Old resumes with `bullets: string[]` still load — templates fall back to rendering the bullets array, and the editor auto-migrates them to HTML on first open.
- Template section labels (e.g. "Experience", "Skills") live in `frontend/src/utils/templateLabels.ts`. Each template resolves labels via `LABELS.<template>[data.language ?? 'en']`. Cover letter labels (subject line prefix, preposition, placeholders) live in the same file under `COVER_LETTER_LABELS[language ?? 'en']`.
- `ContactInfo.links` is a free-form array of `{ label, url }` entries. All three templates render them as clickable `<a>` hyperlinks. Modern puts them in a dedicated sidebar "Links" section. Classic renders them inline in the contact line separated by ` | `. Minimal renders them as `<span><a>` elements in the contact line; the CSS `span + span::before` rule inserts ` · ` separators automatically. The cover letter template renders links inline in the contact line separated by ` | `.
- Cover letter templates use **inline CSS + Lato font** (loaded via `<link>` in `frontend/index.html` and `@import` inside the template's `<style>`). No Tailwind — same rule as resume templates.
- Cover letter `opening`, `body`, and `closing` fields are stored as raw HTML (same as `ExperienceEntry.description`) and edited with `RichTextEditor.tsx`.

## Docs

Detailed references in `/docs/`:
- `docs/context/architecture.md` — component tree, data flow, backend request lifecycle
- `docs/context/tech-stack.md` — all packages and their purpose
- `docs/features/resume-generation.md` — PDF generation deep-dive
- `docs/features/cover-letter.md` — cover letter feature: data flow, template, boilerplate seeding, language support
