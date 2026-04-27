# Resume Generation (PDF Export)

## End-to-End Flow

```
1. User clicks "Export PDF" in ResumePreview.tsx
2. Frontend: fetch(getPdfUrl(id))  →  GET /api/resumes/:id/pdf
3. pdfController.exportPdf()
   a. storageService.loadResume(id)        — read {id}.json from disk
   b. templates/index.renderTemplate(data, data.selectedTemplate)
                                           — produce full HTML string
   c. pdfService.generatePdf(data)         — Puppeteer renders HTML → PDF buffer
4. Response: Content-Type: application/pdf
             Content-Disposition: attachment; filename="{name}-resume.pdf"
5. Frontend: creates a temporary <a> element, sets href to blob URL, clicks it
             → browser downloads the file
```

---

## Template HTML Renderers

Each template exports a function:

```typescript
export function renderXxx(data: ResumeData): string
```

The function returns a complete HTML document:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>/* full CSS string */</style>
</head>
<body>
  <!-- resume layout -->
</body>
</html>
```

CSS is defined as a module-level string constant (`const CLASSIC_CSS = \`...\``). It is embedded directly in the `<style>` tag — no external stylesheets, no web fonts loaded over HTTP. This ensures Puppeteer can render the page without any network requests.

The dispatcher in `backend/src/templates/index.ts`:

```typescript
export function renderTemplate(data: ResumeData, templateId: TemplateId): string {
  switch (templateId) {
    case 'modern':  return renderModern(data);
    case 'minimal': return renderMinimal(data);
    case 'classic':
    default:        return renderClassic(data);
  }
}
```

---

## Puppeteer Configuration

**Browser lifecycle:**

The browser is a lazy singleton in `backend/src/services/pdfService.ts`:

```typescript
let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await puppeteer.launch({ ... });
  }
  return browser;
}
```

It is initialized on the first PDF request and reused for all subsequent ones. It is closed gracefully when the server receives `SIGTERM` or `SIGINT`.

**Launch flags (WSL2 / headless environment):**

```
--no-sandbox              # Required in WSL2 / Docker (no setuid sandbox available)
--disable-setuid-sandbox  # Same
--disable-dev-shm-usage   # /dev/shm is often too small in WSL2; use /tmp instead
--disable-gpu             # No GPU in headless environment
--single-process          # Avoids forking issues in constrained environments
```

**PDF options:**

```typescript
await page.pdf({
  format: 'A4',
  printBackground: true,   // required to render background colours (e.g. modern sidebar)
  margin: { top: '0', right: '0', bottom: '0', left: '0' },
})
```

`waitUntil: 'networkidle0'` is used in `page.setContent()` to ensure all rendering is complete before the PDF is captured.

---

## Preview ↔ PDF Parity

The live preview in the browser and the exported PDF use the same CSS. This works because:

1. Each backend template file defines `const CSS = \`...\``
2. The corresponding React component (`frontend/src/components/templates/`) defines an identical `const CSS` and injects it with `<style>{CSS}</style>`
3. Both render the same data structure (`ResumeData`)

Any change to the visual design of a template must be made in **both** files:
- `backend/src/templates/{name}.ts`
- `frontend/src/components/templates/{Name}Template.tsx`

---

## Language Support (i18n)

Section headings (e.g. "Experience", "Skills") are looked up from translation maps rather than hardcoded. Two files hold identical maps and must stay in sync:

- `backend/src/templates/labels.ts`
- `frontend/src/utils/templateLabels.ts`

Each template resolves the active language at render time:

```typescript
const L = LABELS.<template>[data.language ?? 'en'];
```

`ResumeData.language` is optional (`'en' | 'de'`); templates default to English when the field is absent (backward-compatible with resumes saved before the feature existed). The language toggle (EN / DE) in `TemplatePicker` stores the selection in `ResumeData` via the normal auto-save path.

---

## Links (Modern Template)

`ContactInfo.links` is a free-form array of `{ label: string; url: string }` entries managed by the user. Rendering differs by template:

- **Modern** — displayed as a "Links" sidebar section with `<a href="...">` elements. The visible text is `label` if set, otherwise `url`.
- **Classic** — links appear inline in the contact line as `<a>` elements, separated by ` | ` alongside email, phone, and location.
- **Minimal** — links are rendered as `<a>` elements inside `<span>` tags in the contact line; the CSS `span + span::before` rule inserts the ` · ` separator automatically.

---

## Skill Level Rendering

Skills include a proficiency level (1–5). Templates render this as a text label using a lookup array defined in each template file:

```typescript
const LEVEL_LABELS = ['', 'Basic', 'Familiar', 'Intermediate', 'Advanced', 'Expert'];
// usage: LEVEL_LABELS[s.level] ?? ''
```

Classic and Minimal templates display skills as `"Name · Level"` inline. Modern displays them in a sidebar row with name left-aligned and label right-aligned.

---

## Language Proficiency Rendering

Languages use the same 1–5 numeric level system as skills, but with a different label set appropriate for language fluency:

```typescript
const LANG_LEVEL_LABELS = ['', 'Basic', 'Conversational', 'Intermediate', 'Advanced', 'Native'];
// usage: LANG_LEVEL_LABELS[l.level] ?? ''
```

Rendering placement mirrors skills per template:
- **Classic / Minimal** — a dedicated "Languages" section after Skills, using the same inline badge style (`"Name · Level"`)
- **Modern** — a "Languages" sidebar section below Skills, using the same `skill-row` layout (name left, label right)

The section is omitted entirely if `languages` is empty.

---

## Experience Description (Rich Text)

`ExperienceEntry.description` stores the user's experience content as a raw HTML string produced by `RichTextEditor.tsx`. The editor uses `document.execCommand` to support bold, unordered lists, and ordered lists; its `innerHTML` is saved directly.

Templates embed the HTML inside a `.entry-body` div:

```html
<div class="entry-body">{description}</div>
```

CSS in all 6 templates styles nested list elements:

```css
.entry-body ul { padding-left: 20px; list-style-type: disc; margin: 2px 0; }
.entry-body ol { padding-left: 20px; list-style-type: decimal; margin: 2px 0; }
.entry-body li { margin-bottom: 2px; overflow-wrap: break-word; }
.entry-body p, .entry-body div { margin: 1px 0; }
```

**Backward compatibility:** Old resumes saved before this feature have `bullets: string[]` and no `description`. Both templates and the editor handle this:
- Templates: if `description` is empty/absent, fall back to rendering `bullets` as a `<ul>` list.
- Editor: when a card is opened, if `description` is empty but `bullets` is non-empty, the editor auto-converts them to HTML and triggers a save — so the resume is migrated on next auto-save.

---

## Profile Photo (Modern Template Only)

The profile photo is stored as a base64 data URL in `contact.profilePhoto`. When present, the Modern template embeds it directly in the HTML:

```html
<img src="data:image/jpeg;base64,..." class="profile-photo">
```

Because the `src` is a data URL (not an HTTP URL), Puppeteer does not need to make any network request to render the image. This means PDF generation works fully offline.

The photo is uploaded in `ContactSection.tsx` using a `<input type="file">` → `FileReader.readAsDataURL()` → stored in `ResumeData`. It travels through the normal auto-save flow and is persisted in the resume JSON file.

---

## JSON Export

The "Export JSON" button in the preview toolbar downloads the full `ResumeData` object as a pretty-printed `.json` file. This is a purely client-side operation — no backend call is made.

```
User clicks "Export JSON" in ResumePreview
  → JSON.stringify(resume, null, 2)
  → new Blob([...], { type: 'application/json' })
  → URL.createObjectURL(blob)
  → <a download="{name}-resume.json"> click → browser download
  → URL.revokeObjectURL(url)
```

The exported file is a complete snapshot of `ResumeData`, including all sections, the selected template, and the language setting. It can be used for backup or to inspect the raw data structure.

---

## WSL2 System Requirements

Puppeteer bundles its own Chromium binary but Chromium requires native system libraries:

| Library | Required by |
|---------|-------------|
| `libnss3` | TLS / certificate handling |
| `libnspr4` | Netscape Portable Runtime (NSS dependency) |
| `libasound2` | ALSA audio (Chrome links against it even in headless mode) |

Install: `bash setup.sh` (one-time, requires sudo)

Without these libraries, `puppeteer.launch()` will throw `error while loading shared libraries: libnss3.so: cannot open shared object file`.
