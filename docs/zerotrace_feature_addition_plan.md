zerotrace_feature_addition_plan.md

Scope
- Add local-first Study Utilities (Flashcards, Timer, Notes, Music) in side panel
- Add Local Auto-Assessment (Quiz: MCQ + Coding) with local grading and encrypted export/import

File-Level Changes
- public/manifest.json
  - add permission `notifications`
  - extend CSP to allow Pyodide from jsdelivr and wasm eval
- src/types/index.ts
  - extend AppMode with 'study' and 'quiz'
- src/components/Sidebar.tsx
  - add buttons for Study and Quiz modes
- src/App.tsx
  - route new modes to panels
- New study panels
  - src/panels/study/index.tsx (tab host + first-run modal)
  - src/panels/study/Flashcards.tsx (SM-2 lite, CRUD)
  - src/panels/study/Timer.tsx (Pomodoro, notifications)
  - src/panels/study/Notes.tsx (markdown editor, ephemeral toggle)
  - src/panels/study/Music.tsx (local file or URL)
- New quiz panels and libs
  - src/panels/quiz/index.tsx (tab host + first-run modal)
  - src/panels/quiz/mcq.tsx (local generator + grader + AES-GCM export/import)
  - src/panels/quiz/code.tsx (Pyodide loader, JS safe runner)

Storage Keys
- chrome.storage.local
  - zt_study_first_run_seen: boolean (default false)
  - zt_study_flashcards_v1: Card[] (default [])
  - zt_pomodoro_state_v1: PomodoroState (default idle)
  - zt_notes_md_v1: string (default '')
  - zt_music_prefs_v1: Prefs (default {volume:0.6, loop:false})
- chrome.storage.session
  - zt_quiz_first_run_seen: boolean (default false)
  - zt_quiz_mcq_session_v1: Session (default undefined)
  - zt_quiz_code_session_v1: CodeSession (default undefined)

Permissions
- Keep existing; add notifications only when used by Timer

Performance & Security
- Local-first generation and grading; no network used for grading
- JS runner uses restricted Function wrapper with token blacklist, no DOM/process access
- Python via Pyodide loaded on demand; CSP allows jsdelivr source
- AES-GCM with PBKDF2 (Web Crypto) for export; password never stored

Rollback Plan
- Revert changes to manifest and added files
- Feature flags: do not select 'study' or 'quiz' modes; existing flows unaffected

Checklist
- Add manifest permission and CSP
- Wire new modes in Sidebar and App
- Implement four Study sub-tabs with first-run help
- Implement MCQ + Coding quiz tabs with first-run help
- Add AES-GCM export/import for quiz sessions

