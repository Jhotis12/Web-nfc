## Purpose

Lets a mobile web page scan NFC chips and decode their NDEF contents directly in the browser on supported Android devices, without installing a native app.

## ADDED Requirements

### Requirement: Environment support detection

The app SHALL detect whether the Web NFC API is available and inform the user when the current browser or device cannot read NFC chips.

#### Scenario: Supported browser

- **WHEN** the page loads in a browser that exposes `NDEFReader`
- **THEN** the app makes the scan action available

#### Scenario: Unsupported browser

- **WHEN** the page loads in a browser without `NDEFReader` support
- **THEN** the app shows a message explaining that NFC reading is unavailable on this device or browser

#### Scenario: Missing NFC hardware

- **WHEN** the API is present but starting a scan rejects because no NFC hardware is available
- **THEN** the app reports that this device cannot read NFC chips

### Requirement: Permission and user gesture

The app SHALL only start scanning in response to a user gesture and SHALL handle the `nfc` permission outcome.

#### Scenario: First scan requests permission

- **WHEN** the user taps the scan action for the first time
- **THEN** the browser prompts for the `nfc` permission and the scan starts only if access is granted

#### Scenario: Permission denied

- **WHEN** the user denies the `nfc` permission
- **THEN** the app reports that permission was denied and does not start scanning

#### Scenario: Scan started outside a user gesture

- **WHEN** scanning is attempted without an active user gesture
- **THEN** the app reports the failure instead of silently failing

### Requirement: Scan lifecycle

The app SHALL manage the NFC scan session so that it stops resuming after the page becomes hidden and recovers when the page is visible again.

#### Scenario: Reading a chip

- **WHEN** the user taps the scan action and then holds a chip near the device
- **THEN** the app receives the chip's NDEF message and serial number

#### Scenario: Page hidden during scan

- **WHEN** the page becomes hidden while a scan is active
- **THEN** the scan is suspended and no read events are delivered

#### Scenario: Page visible again

- **WHEN** the page becomes visible again after a scan was suspended
- **THEN** the app resumes scanning without requiring the user to start over

#### Scenario: User stops scanning

- **WHEN** the user stops the scan action
- **THEN** the active scan session is aborted and no further read events are delivered

### Requirement: NDEF record decoding

The app SHALL decode the NDEF records of a read message into human-readable values and present them to the user.

#### Scenario: Text record

- **WHEN** a read message contains a `text` record
- **THEN** the app decodes and displays the text using the record's encoding

#### Scenario: URL record

- **WHEN** a read message contains a `url` record
- **THEN** the app decodes and displays the URL

#### Scenario: JSON MIME record

- **WHEN** a read message contains a `mime` record with JSON payload
- **THEN** the app parses and displays the JSON content

#### Scenario: Unknown record type

- **WHEN** a read message contains a record type the app does not recognize
- **THEN** the app indicates the record type without failing the whole read

#### Scenario: Chip with no readable content

- **WHEN** a chip in range cannot be read or contains no usable records
- **THEN** the app reports the read error and keeps scanning
