## Why

Reading NFC chips currently requires a native Android app or manual tools. The Web NFC API makes it possible to read NDEF chips directly from Chrome on Android, so a small web app can do the job with no install. This change builds that app: a mobile-first page that scans an NFC chip and keeps a local record of every unique chip read.

## What Changes

- Scaffold a Vite + React + TypeScript single-page app.
- Detect Web NFC support and hardware, and request the `nfc` permission from a user gesture.
- Scan NFC tags via `NDEFReader`, decode NDEF records (text, url, mime/JSON), and surface read errors.
- Persist one card per chip in local storage, upserted by the tag `serialNumber`, with first seen, last seen, and read count.
- Show the list of saved chips and the decoded content of the selected chip.
- Configure static deployment to Vercel, including an SPA rewrite so deep links and refreshes work.

## Capabilities

### New Capabilities
- `nfc-reading`: Scanning and decoding NDEF messages from NFC chips in Chrome on Android, including feature detection, permission handling, scan lifecycle, and record decoding.
- `chip-registry`: Storing one record per unique chip in IndexedDB, upserting on repeat reads, and displaying the saved chips and their contents.

### Modified Capabilities
<!-- None: greenfield project, no existing specs. -->

## Impact

- New project structure: `index.html`, `src/`, `vite.config.ts`, `vercel.json`, `package.json`.
- New dependencies: `react`, `react-dom`; dev: `vite`, `@vitejs/plugin-react`, `typescript`, `@types/react`, `@types/react-dom`, `@types/w3c-web-nfc`.
- Browser constraint: only Chrome for Android 89+ (or ChromeOS) supports Web NFC; no iOS, Firefox, or desktop support. Requires HTTPS, which Vercel provides.
- No backend, API, or network calls: all data stays on the device.
