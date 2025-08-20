# Changelog

## Added
- Frontend: adapters registry for multi-platform ingestion (`futuregpt-main frontend/src/adapters/registry.ts`)
- Frontend: progressive hints scheduler (`futuregpt-main frontend/src/features/hints/progressiveHints.ts`)
- Frontend: crypto + storage helpers for encrypted exports and local-only defaults (`futuregpt-main frontend/src/utils/crypto.ts`, `futuregpt-main frontend/src/utils/storage.ts`)
- Frontend: side panel actions and privacy badges (`futuregpt-main frontend/src/components/SidePanelActions.tsx`, `futuregpt-main frontend/src/components/PrivacyBadges.tsx`)
- Manifest: register `contentScript.js` for LeetCode/Codeforces/GfG (minimal, message-driven)
- Docs: `PRIVACY.md`, `FEATURES.md`

## Changed
- Frontend README: updated sidebar modes and privacy-first quick actions
- Manifest: reduced host permissions to `http://localhost:3000/*` only

## Unchanged / Protected
- Backend pipelines in `gpt-backend/` remain untouched. No interface, prompt, or schema changes.

