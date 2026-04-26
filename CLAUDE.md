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
- `ContactInfo` — name, email, phone, location, linkedin?, github?, website?, profilePhoto? (base64)
- `ExperienceEntry` — id, company, title, startDate, endDate, location?, bullets: string[]
- `EducationEntry` — id, institution, degree, field, startDate, endDate, gpa?
- `ProjectEntry` — id, name, description, url?, technologies: string[]
- `SkillEntry` — name, level (1–5)
- `ResumeData` — id, name?, contact, summary, experience[], education[], skills: SkillEntry[], projects[], selectedTemplate, updatedAt
- `ResumeSummary` — id, name, updatedAt (lightweight type returned by the list endpoint)
- `TemplateId` — `'classic' | 'modern' | 'minimal'`

**Rule:** changing the schema requires updating `shared/src/types.ts` AND all 6 template files (3 backend renderers + 3 React components). Fields that are app-shell metadata only (e.g. `name`) do not need to be rendered in templates and can be safely ignored by them.

## API Endpoints

All routes are mounted at `/api` on the backend.

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/resumes` | Create empty resume, returns `{ id }` |
| `GET` | `/api/resumes` | List all resumes, returns `ResumeSummary[]` |
| `GET` | `/api/resumes/:id` | Fetch `ResumeData` |
| `PUT` | `/api/resumes/:id` | Save full `ResumeData` |
| `GET` | `/api/resumes/:id/pdf` | Generate and stream PDF attachment |
| `GET` | `/api/templates` | Return `TemplateMetadata[]` |

**Route ordering note:** `GET /api/resumes` must be registered before `GET /api/resumes/:id` in the Express router. Express matches routes in declaration order; reversing them would cause the literal string `"resumes"` to be captured as an `:id` param.

## Template Parity Rule

Every template exists in two mirrors that must stay in sync:

- **Backend renderer** `backend/src/templates/{name}.ts` — `renderXxx(data): string` returning a full HTML document with embedded `<style>`. Puppeteer renders this to PDF.
- **React component** `frontend/src/components/templates/{Name}Template.tsx` — pure component that injects the same CSS string via a `<style>` tag.

The CSS is defined as a string constant in each file. Any visual change to a template must be made in both files. This is what keeps the live preview pixel-accurate with the exported PDF.

## Storage

Resumes are persisted as JSON files at `backend/src/data/resumes/{id}.json`. Writes are atomic (write to `.tmp`, then `fs.rename`). No database.

## PDF Generation

Uses Puppeteer (headless Chromium). The browser instance is lazy-initialized on the first PDF request and reused for subsequent requests. It is closed on `SIGTERM`/`SIGINT`.

**WSL2 requirement:** Chromium needs system libraries not present in WSL2 by default. Run once: `bash setup.sh`

## Session Persistence

The frontend stores the active resume ID in `localStorage` under the key `resume_app_id`. On load, if an ID exists it fetches that resume; otherwise it calls `POST /api/resumes` to create a new one. If the stored ID is stale (404), it silently creates a fresh resume.

Multiple resumes can exist on the backend simultaneously. The `useResume` hook fetches the full list via `GET /api/resumes` on init and exposes `resumeList`, `switchResume(id)`, `renameResume(name)`, and `createNewResume()`. Switching a resume updates `localStorage` to the new ID so the next page load restores the last active resume.

## Key Constraints

- PDF logic lives exclusively in `backend/src/services/pdfService.ts`
- Business logic must not be duplicated between frontend and backend
- Template CSS must be identical between backend renderer and React component
- Do not add fields to `ResumeData` without updating all 6 template files
- Tailwind CSS is for the app shell UI only — resume templates use inline CSS strings for PDF fidelity

## Docs

Detailed references in `/docs/`:
- `docs/context/architecture.md` — component tree, data flow, backend request lifecycle
- `docs/context/tech-stack.md` — all packages and their purpose
- `docs/features/resume-generation.md` — PDF generation deep-dive
