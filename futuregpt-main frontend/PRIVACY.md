# zeroTrace Privacy & Security

This extension is designed Local-First. Sensitive content is processed on-device. Nothing leaves the device unless you explicitly export it.

Key principles:
- Local-only by default (uses `chrome.storage.session` for ephemeral data)
- Opt-in encrypted persistence with AES-GCM (WebCrypto) and passphrase-derived keys (PBKDF2)
- No telemetry. No hidden logs.
- Clear Data Pathways panel (coming soon) listing data items, location, and retention

Storage modes:
- Ephemeral: `chrome.storage.session` (lost on browser restart)
- Encrypted local: `chrome.storage.local` with AES-GCM, passphrase required to decrypt

Exports:
- User-initiated only, encrypted `.zerotrace` bundles
- Decryptable locally with your passphrase

Permissions:
- Minimal permissions in `public/manifest.json`. Only `http://localhost:3000/*` (backend) is allowed as host permission.
- Content scripts run on specific domains and only respond to explicit messages from the side panel.

Pipelines:
- The 5-model backend pipelines are unchanged and accessed via existing endpoints; no schema or contract changes.


