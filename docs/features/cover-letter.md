# Cover Letter Feature

## Overview

The cover letter builder is a separate page at `/cover-letter/:id` that mirrors the resume builder's split-panel layout. Cover letters are always linked to a source resume: contact information is snapshot-copied at creation time and the source resume's skills are used to seed boilerplate body text.

---

## End-to-End Flow

### Creation

```
1. User opens ResumeListDrawer → clicks "Cover Letters →"
2. Navigates to /cover-letter
3. useCoverLetter: no stored id → coverLetter = null
4. CoverLetterBuilderPage renders ResumePicker
5. ResumePicker: GET /api/resumes → lists available resumes
6. User selects a resume → POST /api/cover-letters { resumeId }
7. coverLetterController.createCoverLetter:
   a. loadResume(resumeId)                    — read source resume
   b. top 3 skills sorted by level desc      — used in boilerplate
   c. formatted date (en-US locale)
   d. seed opening / body / closing HTML
   e. saveCoverLetter(newDoc)                 — write {id}.json
   f. return { id }
8. Frontend: navigate('/cover-letter/:id')
9. paramId changes → useEffect → switchCoverLetter(id)
   → fetchCoverLetter + listCoverLetters in parallel
   → coverLetter set → editor rendered
```

### Editing and auto-save

```
User edits any field
  → CoverLetterEditor: onChange(updatedCoverLetter)
  → useCoverLetter: setCoverLetter(updated) [immediate]
  → debounce 500ms
  → PUT /api/cover-letters/:id
  → coverLetterController.updateCoverLetter
  → coverLetterStorageService.saveCoverLetter → {id}.json (atomic write)
```

### PDF export

```
User clicks "Export PDF"
  → CoverLetterPreview: fetch(getCoverLetterPdfUrl(id))
  → GET /api/cover-letters/:id/pdf
  → coverLetterPdfController.exportCoverLetterPdf
  → coverLetterStorageService.loadCoverLetter(id)
  → pdfService.generateCoverLetterPdf(data)
      → getBrowser() [shared singleton]
      → page.setViewport({ width: 794, height: 1123 })
      → page.goto('http://localhost:5173/cover-letter/:id/print', { waitUntil: 'networkidle0' })
           └─ CoverLetterPrintPage.tsx
                → fetchCoverLetter(id)
                → renders CoverLetterTemplate
                → document.fonts.ready.then(signalReady)
      → page.waitForFunction('document.body.dataset.renderDone === "true"', { timeout: 10000 })
      → page.pdf({ format: 'A4', printBackground: true, margin: 0 })
  → response: attachment; filename="{contact.name}-cover-letter.pdf"
  → browser: <a download> click → file saved
```

---

## Data Model

```typescript
interface CoverLetterData {
  id: string;
  name?: string;           // user-editable label for the drawer list
  resumeId: string;        // ID of the source resume
  contact: ContactInfo;    // snapshot copied from resume at creation time
  targetJob: string;       // fills the subject line
  targetCompany: string;   // fills the subject line
  date: string;            // free-form string; default: formatted creation date
  opening: string;         // HTML (RichTextEditor output)
  body: string;            // HTML (RichTextEditor output)
  closing: string;         // HTML (RichTextEditor output)
  language?: ResumeLanguage; // 'en' | 'de'; affects subject line and placeholders
  updatedAt: string;       // ISO timestamp; set on every PUT
}
```

`contact` is a **snapshot** — it is copied once at creation and is not automatically updated when the source resume changes. The `resumeId` link is informational only.

---

## Boilerplate Seeding

When `POST /api/cover-letters` is called, the controller seeds initial HTML content:

```
opening:  '<p>Dear Hiring Manager,</p>'

body:     '<p>I am writing to express my interest in this position.
           With my background in {top3Skills}, I am confident I can make
           a meaningful contribution to your team.</p>
           <p>I am excited about this opportunity…</p>'

closing:  '<p>Thank you for considering my application…</p>
           <p>Sincerely,<br/>{contact.name}</p>'
```

`top3Skills` is derived from `resume.skills` sorted by `level` descending, taking the top 3 names. If no skills exist, falls back to `"my professional skills"`.

The boilerplate is just a starting point — all three fields are fully editable by the user via `RichTextEditor`.

---

## Template

`frontend/src/components/templates/CoverLetterTemplate.tsx` renders the A4 cover letter layout.

**CSS layout:**

```css
.cover-letter-page    { width: 210mm; min-height: 297mm; padding: 22mm 24mm;
                        font-family: "Lato", sans-serif; font-size: 10.5pt; line-height: 1.55; }
.cover-letter-header  { margin-bottom: 18mm; }
.cover-letter-subject { font-weight: 700; margin: 10mm 0 6mm; }
.cover-letter-paragraph { margin-bottom: 5mm; }
```

`210mm` at 96 dpi = 793.7 px ≈ 794 px (the Puppeteer viewport width). The template's internal padding handles all margins; Puppeteer is configured with `margin: 0` so there is no double-margin.

**Rendered sections (top to bottom):**

1. **Header** — candidate name (18pt bold) + contact line (email | phone | location | links, 9.5pt muted)
2. **Date** — plain text paragraph
3. **Subject line** — `{L.subject} {targetJob || L.positionPlaceholder} {L.at} {targetCompany || L.companyPlaceholder}`
4. **Opening** — `dangerouslySetInnerHTML={{ __html: opening }}`
5. **Body** — `dangerouslySetInnerHTML={{ __html: body }}`
6. **Closing** — `dangerouslySetInnerHTML={{ __html: closing }}`

**Font:** Lato (300, 400, 700 + italic 400) is loaded via `<link>` in `frontend/index.html` (for both the live preview and the Puppeteer print page) and via `@import` inside the template's `<style>` tag as a fallback.

---

## Language Support

The subject line and empty-field placeholders are resolved from `COVER_LETTER_LABELS` in `frontend/src/utils/templateLabels.ts`:

| Key | EN | DE |
|-----|----|----|
| `subject` | `Re: Application for` | `Betr.: Bewerbung als` |
| `at` | `at` | `bei` |
| `positionPlaceholder` | `[Position]` | `[Stelle]` |
| `companyPlaceholder` | `[Company]` | `[Unternehmen]` |

The language toggle (EN / DE) in `CoverLetterPreview`'s toolbar updates `coverLetter.language` via the normal auto-save path. The template re-renders immediately with the new labels.

The body text (opening, body, closing) is **not** automatically translated — the user is responsible for writing content in the target language. The language setting only affects the structural labels shown in the template.

---

## Storage

Cover letters are stored as JSON files at `backend/src/data/cover-letters/{id}.json`. The storage service (`coverLetterStorageService.ts`) is a direct mirror of `storageService.ts`:

- Atomic writes (`.tmp` + `fs.rename`)
- `listCoverLetters()` reads all `.json` files in the directory, parses them, returns `CoverLetterSummary[]` sorted by `updatedAt` descending; corrupted files are silently skipped
- The `data/cover-letters/` directory is created automatically on first write via `fs.mkdir(..., { recursive: true })`

---

## Navigation

| From | Action | Destination |
|------|--------|-------------|
| Resume builder | "Cover Letters →" in `ResumeListDrawer` footer | `/cover-letter` |
| Cover letter builder | "← Resume Builder" in header or drawer footer | `/` |
| Cover letter builder | Select cover letter in `CoverLetterListDrawer` | `/cover-letter/:id` |
| Anywhere | Direct URL `/cover-letter/:id` | Cover letter builder (loads that id) |

`CoverLetterBuilderPage` handles both `/cover-letter` (no param) and `/cover-letter/:id` (with param). When `paramId` is present and differs from the currently loaded cover letter (including the null→id transition after creation), a `useEffect` calls `switchCoverLetter(paramId)` to load it.
