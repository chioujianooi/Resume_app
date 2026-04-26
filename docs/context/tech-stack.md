# Tech Stack

## Runtime Environment

- **Node.js** — backend runtime
- **WSL2 (Windows Subsystem for Linux)** — development environment; requires extra system libraries for Chromium (see setup below)

---

## Root Workspace

| Package | Version | Purpose |
|---------|---------|---------|
| `concurrently` | ^8.2.2 | Runs backend and frontend dev servers in a single terminal with `npm run dev` |

---

## Shared (`shared/`)

| Package | Purpose |
|---------|---------|
| `typescript` | Compile-time type checking; the `shared` package exports only `.ts` source — consumed directly by both workspaces via the `@resume-app/shared` alias |

No runtime dependencies. This package is types-only.

---

## Backend (`backend/`)

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | ^4 | HTTP server and routing |
| `cors` | ^2 | Allows the Vite dev server origin (`localhost:5173`) to call the API during development |
| `puppeteer` | ^21 | Bundles Chromium; used to render HTML templates to PDF via headless browser |
| `uuid` | ^9 | Generates unique IDs for new resumes (`uuidv4()` in `resumeController.ts`) |
| `ts-node-dev` | ^2 | TypeScript-aware dev server with hot-reload (restarts on file changes) |
| `typescript` | ^5 | TypeScript compiler |
| `@types/express`, `@types/cors`, `@types/uuid`, `@types/node` | — | Type declarations for the above packages |

### Why Puppeteer over pdf-lib / jsPDF?

Puppeteer renders real HTML+CSS in a headless Chrome instance. This means:
- Full CSS support (flexbox, grid, custom fonts, `print-background`)
- The preview and the PDF use identical CSS — no layout divergence
- No need to imperatively position elements

The tradeoff is a large Chromium binary and WSL2 system library requirements.

---

## Frontend (`frontend/`)

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^19 | UI framework |
| `react-dom` | ^19 | DOM renderer for React |
| `uuid` | ^9 | Generates client-side IDs for experience/education/project entries before they are saved |
| `vite` | ^8 | Dev server (hot module replacement) and production bundler; configured to proxy `/api/*` to `localhost:3010` |
| `@vitejs/plugin-react` | ^6 | Vite plugin for React JSX transform and Fast Refresh |
| `tailwindcss` | ^3.4 | Utility CSS for the app shell UI (editor panels, buttons, layout) |
| `autoprefixer` | ^10.4 | PostCSS plugin required by Tailwind |
| `postcss` | ^8.4 | CSS processing pipeline (used by Tailwind) |
| `typescript` | ~6.0 | TypeScript compiler |
| `@types/react`, `@types/react-dom`, `@types/uuid`, `@types/node` | — | Type declarations |
| `eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `typescript-eslint` | — | Linting |

### Note on Tailwind vs inline CSS

Tailwind is used **only for the app shell** (editor panels, buttons, layout chrome). Resume templates use **inline CSS string constants** embedded in `<style>` tags. This is intentional — Tailwind classes are purged at build time and are not available in the Puppeteer rendering context. Inline CSS ensures the PDF renderer and the browser preview use exactly the same styles.

---

## WSL2 System Dependencies

Chromium (bundled with Puppeteer) requires native system libraries that are not present in a default WSL2 install:

```
libnss3      # Network Security Services
libnspr4     # Netscape Portable Runtime
libasound2   # ALSA sound library (needed by Chrome even for headless)
```

Install once with: `bash setup.sh` (runs `sudo apt-get install -y libnss3 libnspr4 libasound2`)

Puppeteer is also launched with these flags to work in WSL2 / containerized environments:
```
--no-sandbox
--disable-setuid-sandbox
--disable-dev-shm-usage
--disable-gpu
--single-process
```
