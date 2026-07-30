# EGONON OS Google Apps Script Bridge

This directory contains the Google Apps Script automation layer for EGONON OS.

## Purpose

The bridge connects the shared Google Drive library with the EGONON document registry. Its initial functions are:

- verify access to the shared library, canonical deliverables folder and registry spreadsheet;
- list canonical deliverables;
- append approved deliverables to the registry;
- expose an owner-only health endpoint when deployed as a web app;
- support source control and deployment through `clasp` and GitHub Actions.

## Security model

- OAuth tokens and `.clasp.json` are never committed.
- The web app and Apps Script Execution API are restricted to the script owner by default.
- Drive and spreadsheet IDs are stored in Apps Script Properties, not in the public repository.
- The repository contains code only; Google Drive remains the canonical document archive.

## Requirements

- Node.js 22 or later.
- Google Apps Script API enabled for the Google account that owns the scripts.
- Access to the EGONON shared Drive library and registry spreadsheet.
- `@google/clasp` 3.3.0, installed through `npm install`.

## One-time authorization

From this directory:

```bash
npm install
npm run clasp:login
```

`clasp login --no-localhost` opens a Google OAuth consent flow and asks for a returned authorization code. Complete this step only in a trusted terminal. Never paste `.clasprc.json`, refresh tokens, OAuth client secrets or authorization codes into chat, GitHub issues, Drive documents or source files.

## Create the Apps Script project

After login:

```bash
npx clasp create-script --title "EGONON OS Automation Bridge" --type webapp --rootDir .
npx clasp push
```

The command creates a local `.clasp.json` containing the remote Script ID. Keep that file private.

## Configure Drive and registry IDs

Open the Apps Script editor and execute this function once with the authorized resource IDs:

```javascript
setEgononConfig(
  'SHARED_LIBRARY_FOLDER_ID',
  'CANONICAL_DELIVERABLES_FOLDER_ID',
  'REGISTRY_SPREADSHEET_ID',
  'Documents'
);
```

The values are stored in Script Properties. They are not written to this repository.

## Verify the connection

Run `egononHealthCheck()` in the Apps Script editor. A successful result confirms access to:

- the shared library;
- the canonical deliverables folder;
- the registry spreadsheet and `Documents` sheet.

Then test:

```javascript
listCanonicalDeliverables();
```

No integration is considered operational until `egononHealthCheck()` completes successfully under the intended Google account.

## Register a deliverable

```javascript
registerCanonicalDeliverable('GOOGLE_DRIVE_FILE_ID', {
  document_id: 'EGONON-EXAMPLE-2026-01-01',
  product: 'Example product',
  approved_by: 'Approver name',
  approval_date: '2026-01-01',
  notes: 'Approved canonical deliverable.'
});
```

The file must be directly contained in the configured canonical deliverables folder.

## GitHub Actions deployment

The workflow `.github/workflows/apps-script-deploy.yml` requires two encrypted repository secrets:

- `CLASPRC_JSON`: the private contents of the authenticated `~/.clasprc.json` file;
- `CLASP_JSON`: the private contents of the project's `.clasp.json` file.

These secrets must be added through GitHub's encrypted secrets interface. They must never be committed or printed in workflow logs.

The deployment workflow is manual and restricted to `main` until production governance is approved.

## Source of truth

- Google Drive: documents and deliverables.
- Google Apps Script: operational automations and triggers.
- GitHub: source code, reviews and deployment definitions.
- EGONON OS: orchestration, analysis and user interaction.
