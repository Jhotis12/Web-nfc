## Purpose

Stores one card per unique NFC chip on the device and displays the saved chips and their decoded contents, so repeated reads of the same chip stay consolidated.

## ADDED Requirements

### Requirement: One card per chip

The app SHALL keep a single saved card per chip, identified by the chip's serial number, so reading the same chip again does not create a duplicate entry.

#### Scenario: First read of a chip

- **WHEN** a chip is read whose serial number is not yet saved
- **THEN** the app creates a new card for that chip

#### Scenario: Repeated read of a chip

- **WHEN** a chip is read whose serial number is already saved
- **THEN** the app updates the existing card instead of creating another one

### Requirement: Card contents

Each saved card SHALL store the chip's serial number, the first time it was read, the most recent time it was read, the number of times it has been read, and the decoded contents of the last read.

#### Scenario: Card updated on repeat read

- **WHEN** an already saved chip is read again
- **THEN** the card's last-read time and read count are updated and its stored contents reflect the latest read

#### Scenario: Card preserves first read

- **WHEN** an already saved chip is read again
- **THEN** the card's first-read time remains unchanged

### Requirement: Local persistence

The app SHALL store saved cards on the device and SHALL make them available again after the page is reloaded or reopened, with no data sent to a server.

#### Scenario: Cards survive reload

- **WHEN** the user reloads or reopens the app
- **THEN** previously saved cards are shown

#### Scenario: No network storage

- **WHEN** the app saves or reads a card
- **THEN** no data leaves the device

### Requirement: Browsing saved cards

The app SHALL show the list of saved cards and allow the user to view the decoded contents of a selected card.

#### Scenario: List saved chips

- **WHEN** the user opens the saved list
- **THEN** the app shows each saved chip with enough information to identify it, such as its serial number or last read time

#### Scenario: View a chip's contents

- **WHEN** the user selects a saved chip
- **THEN** the app shows the decoded records stored for that chip

#### Scenario: No saved chips

- **WHEN** no chips have been read yet
- **THEN** the app shows an empty state inviting the user to scan a chip
