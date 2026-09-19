## 1. Project setup

- [x] 1.1 Scaffold a Vite + React + TypeScript app at the repo root (`npm create vite@latest . -- --template react-ts`) and verify `npm run dev` serves the page locally
- [x] 1.2 Add `@types/w3c-web-nfc` as a dev dependency and verify `npx tsc --noEmit` passes with an `NDEFReader` reference in a scratch file
- [x] 1.3 Add Vitest and a `test` script and verify `npm test` runs (even with zero tests)
- [x] 1.4 Add `vercel.json` with the SPA rewrite `{"rewrites":[{"source":"/(.*)","destination":"/index.html"}]}` and verify the file is valid JSON
- [x] 1.5 Confirm the app is mobile-first (viewport meta, responsive layout baseline) and verify it renders without horizontal scroll at a 360px viewport

## 2. NFC reading layer

- [x] 2.1 Implement two-stage support detection (`"NDEFReader" in window` plus catching `NotSupportedError`/`NotAllowedError` from `scan()`) and verify an unsupported browser shows the unavailable message
- [x] 2.2 Implement scan start bound to a user gesture with an `AbortController`, and verify tapping scan starts the session and stopping aborts it
- [x] 2.3 Add a `visibilitychange` handler that re-runs `scan()` when the page returns to visible, and verify scanning resumes after backgrounding the tab
- [x] 2.4 Implement record normalization to `{ kind: 'text' | 'url' | 'json' | 'unknown', label, value }` and verify unit tests cover text, url, JSON mime, and an unknown record type
- [x] 2.5 Implement the `readingerror` handling that keeps the scan active, and verify a failed read reports the error without stopping subsequent reads

## 3. Local chip registry

- [x] 3.1 Implement `idb-keyval`-backed storage keyed by `serialNumber` with read-modify-write upsert, and verify a unit test creates a card on first read and updates the same card on a repeat read
- [x] 3.2 Ensure repeat reads update `lastSeen`, increment `readCount`, and refresh `records` while leaving `firstSeen` unchanged, and verify with unit tests
- [x] 3.3 Implement the empty-`serialNumber` fallback key from record content, and verify a unit test still creates a single card for such a chip
- [x] 3.4 Verify cards persist across a page reload in the browser and that no network requests are made while saving or loading

## 4. UI

- [x] 4.1 Build the scan control with permission, scanning, and error states and verify each state is reachable in the browser
- [x] 4.2 Build the saved-chips list and the selected-chip detail view showing decoded records, and verify selecting a card shows its records
- [x] 4.3 Add the empty state shown when no chips are saved and verify it appears before the first read

## 5. Deployment

- [x] 5.1 Run `npm run build` and verify the `dist/` output is produced without type or build errors
- [ ] 5.2 Deploy to Vercel over HTTPS, then verify a nested route loads on direct navigation and on refresh (SPA rewrite works)
- [ ] 5.3 On an Android device with Chrome, verify a real NFC chip is read, saved as one card, and updated on a second read
