ZeroTrace Project Map

Entry Points & Surfaces
- Manifest (MV3): `public/manifest.json`
  - background service worker: `public/background.js`
  - side panel: `index.html` (Vite app)
  - content script: `public/contentScript.js` on LeetCode/Codeforces/GFG
  - permissions: storage, tabs, scripting, sidePanel, activeTab, notifications
  - CSP for extension pages tightened; side panel loads Vite bundle
- Side Panel SPA (React + Vite, Tailwind)
  - Root HTML: `index.html`
  - Bootstrap: `src/main.tsx`
  - App shell: `src/App.tsx`
  - Sidebar modes: `src/components/Sidebar.tsx`
  - Existing panels/components: `src/components/*` (chat, DSA solver, hints, interview, ITS, quiz demo, export/import)

Data Flow & Messaging
- Background
  - On installed/startup: sets `sidePanel` behavior
  - Messages:
    - `CAPTURE_SCREEN`: uses `chrome.tabs.captureVisibleTab` to return dataURL PNG
    - `API_REQUEST`: fetch proxy (with optional streaming text response)
- Content script
  - Listens for `ZT_GET_PAGE` → returns `{ url, html }` snapshot when asked
- Side panel app
  - Uses `chrome.scripting.executeScript` for safe, ephemeral page context extraction when user grants consent
  - Optional screenshot via background `CAPTURE_SCREEN`

Storage Touchpoints
- `src/hooks/useStorage.ts`: unified wrapper selecting `chrome.storage.session` when available; fallback to `localStorage` in non-extension env
- `src/utils/storage.ts`: helpers for session set/get and encrypted local
- New study/quiz features use:
  - `chrome.storage.local` for Study (flashcards, timer, notes, music prefs)
  - `chrome.storage.session` for Quiz sessions

5‑GPT Backend Pipeline (gpt-backend)
- Orchestrator: `gpt-backend/pipeline/orchestrator.js`
  - Phases 1..5 across GPT-4.1, Claude‑4, GPT‑4o, Gemini, DeepSeek
  - Returns finalSolution and per-phase diagnostics
- Phase controllers: `pipeline/phase{1..5}.js` (Phase1/2 shown)
- Routes:
  - `routes/solve-dsa.js`: POST /solve-dsa; builds prompt; runs orchestrator; returns enriched solution
  - `routes/analyze-complexity.js`, `routes/generate-testcases.js`
- Sandboxing/validation utilities: `testRunner/sandbox.js`, `testRunner/validator.js`

UI Lanes/Columns
- App header + main chat area (`App.tsx`) with `MessageList` and `ChatInput`
- Right edge mini-panels: `HintsPanel`, `InterviewPrep`, `RecommendationsPanel`, `ITSPanel`, `Visualizer`, `QuizPanel`, `ExportImportPanel`
- Left `Sidebar` provides mode switches; modes rendered in main area via `renderMainContent()`

Safe Extension Points (used by new features)
- Add side-panel tabs via `Sidebar` and route in `App.tsx`
- Use `chrome.storage.local/session` exclusively
- No changes to backend required for local-first grading
- Content script unchanged; optional context used for flashcard generation

How to Extend Safely
- Keep permissions minimal (added `notifications` for Pomodoro alerts)
- Respect CSP; load Pyodide from `jsdelivr` only when used; no eval for JS runner
- Feature flags: modes `study`, `quiz` only affect side panel UI; do not alter existing columns/pipeline

