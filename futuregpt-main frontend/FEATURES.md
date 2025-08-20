# zeroTrace Features (Privacy-First)

- Multi-platform problem ingestion (LeetCode, Codeforces, GfG) via content script and adapters registry
- Progressive Hints with time-locked tiers stored in session-only storage
- Interview Prep Mode: timed sessions, scoring, local report export
- Intelligent Recommendations: local mastery profile with adaptive next-step selection
- Visualization: step-by-step algorithm tracing (local-only)
- Language Detection: local heuristics
- Intelligent Tutoring: micro-lessons and corrective feedback, local mastery per-topic
- Contextual Side Panel: quick actions (summarize, hint, testcases, visualize) that never auto-send page content off-device
- Adaptive Study Plans: simple rules engine with local session profile
- Local Quiz Generation & Auto-Assessment: MCQs and sandboxed runtimes (Pyodide/isolated JS)
- Micro-features: flashcards, notes, Pomodoro, study music (local)
- Optional daily practice feeds stored locally

All model calls go through the existing backend endpoints without any contract changes.

