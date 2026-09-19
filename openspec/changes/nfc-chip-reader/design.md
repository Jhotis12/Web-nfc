## Context

See proposal.md for motivation. This is a greenfield static app: no backend, no accounts, no network. The only hard external constraint is the Web NFC API (Chrome for Android 89+, ChromeOS), which dictates the browser target and forces HTTPS in production.

The app has two pieces of behavior that map to the two new capabilities in the specs: a scanning/decoding layer (`nfc-reading`) and a local keyed store (`chip-registry`).

## Goals / Non-Goals

**Goals:**
- A small, dependency-light Vite + React + TypeScript SPA.
- A reusable NFC scanning hook/module that isolates the browser API and its lifecycle quirks.
- A simple keyed local store where the chip serial number is the primary key.
- Static deployment to Vercel with working deep links.

**Non-Goals:**
- Writing to chips, locking chips, or raw (non-NDEF) tag access.
- Any server, database, auth, or sync between devices.
- iOS, Firefox, or desktop support.
- Offline PWA / installability (not needed for the core flow).

## Decisions

### Build tooling: Vite + React + TypeScript
Vite matches the request, produces a static `dist/`, and needs no server runtime for this feature. Next.js was rejected as unnecessary (no SSR/SSG/API needs) and heavier. TypeScript is used because `@types/w3c-web-nfc` provides accurate NDEF types.

### Storage: IndexedDB via a keyed store, upserting by serial number
`localStorage` was considered but rejected: it is synchronous, string-only, and capped around 5MB. IndexedDB stores structured card objects and scales as the registry grows. Because every card is addressed by `serialNumber`, a small key-value wrapper over IndexedDB (`idb-keyval`, well under 1KB) is enough; a full `idb` schema or raw IndexedDB boilerplate is unnecessary, and a heavier store (SQLite/OPFS) is overkill for keyed lookups.

The card value is written whole on each read (read-modify-write): load by key, update `lastSeen`/`readCount`/`records`, save. This keeps the store dead simple and avoids transactions for a single-user local app.

### NFC access: a hook that owns the `NDEFReader` lifecycle
The browser API is wrapped in one place (e.g. `useNfc` or an `nfc` module) to centralize the quirks:
- Feature detection is two-staged: check `"NDEFReader" in window`, and still catch `NotSupportedError`/`NotAllowedError` from `scan()` because API presence and hardware presence differ.
- `scan()` is only called from a user gesture, satisfying the permission gesture requirement.
- An `AbortController` is kept alongside the reader so the user can stop scanning and so listeners are not leaked.
- A `visibilitychange` listener re-issues `scan()` when the page returns to visible, because Web NFC silently suspends in background tabs.

This isolates the experimental API behind a stable interface, so the UI does not depend on Web NFC specifics.

### Record decoding into a normalized shape
Raw `message.records` are normalized to `{ kind: 'text' | 'url' | 'json' | 'unknown', label, value }`:
- `text` -> `TextDecoder(record.encoding)`.
- `url` -> `TextDecoder()`.
- `mime` with JSON -> `TextDecoder()` then `JSON.parse`, falling back to raw text on parse failure.
- Anything else -> keep `recordType` as `unknown`.

Normalizing at the boundary means the UI and the store only ever handle one shape, and unrecognized records never break a read.

### UI shell: mobile-first single screen
React function components with hooks; no state library. The screen pairs a scan control with the saved-card list and a selected-card detail view. This is small enough that Redux/Zustand would add cost without benefit.

### Deployment: static on Vercel
Vercel auto-detects Vite (`npm run build` -> `dist`). A `vercel.json` adds an SPA rewrite so direct navigation to a nested route or a refresh serves `index.html`. HTTPS is provided by Vercel, which the Web NFC API requires.

## Risks / Trade-offs

- **Chrome for Android / ChromeOS only** -> The app feature-detects and shows a clear unsupported message; the constraint is accepted, not worked around.
- **Permission can become permanently blocked after repeated denials** -> Surface the denied state and instruct the user to reset the `nfc` permission in Chrome site settings.
- **Scan silently pauses when the tab is hidden** -> Re-`scan()` on `visibilitychange` to visible.
- **Empty `serialNumber` on some chips** -> Falls back to a content-derived key so a card is still created; most chips do expose a serial.
- **Experimental/uneven API across Chrome versions** -> Keep all API use behind the wrapper and gate optional methods with their own feature checks.
- **Read-modify-write races** -> Acceptable for a single-user local app; reads are user-driven and cannot realistically overlap.
