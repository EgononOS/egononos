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

On a local Mac, `clasp login` opens the Google OAuth consent flow and completes the callback through a temporary localhost port. Use `--no-localhost` only for a trusted remote terminal that cannot receive a local browser callback. Never paste `.clasprc.json`, refresh tokens, OAuth client secrets or authorization codes into chat, GitHub issues, Drive documents or source files.

## Create the Apps Script project

After login, create a standalone project. A standalone project can still be deployed later as a web app:

```bash
mkdir -p "$HOME/egonon-clasp-bootstrap"
cd "$HOME/egonon-clasp-bootstrap"
npx clasp create-script --title "EGONON OS Automation Bridge" --type standalone
```

Copy the generated private project settings into this directory, then push the repository source:

```bash
cp "$HOME/egonon-clasp-bootstrap/.clasp.json" .clasp.json
npx clasp show-file-status
npx clasp push --force
```

The `.clasp.json` file contains the remote Script ID and must remain private.

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

## Initial private deployment

The manifest restricts both the web app and Apps Script Execution API to the deploying user. Create the first deployment from the trusted local Mac:

```bash
cd "$HOME/egononos/apps-script"
npx clasp push --force
npx clasp create-deployment --description "EGONON OS private production"
npx clasp list-deployments
```

Record the deployment ID without committing it. The stable deployment is updated by GitHub Actions; subsequent runs must not create additional production deployments.

## GitHub Actions deployment

The workflow `.github/workflows/apps-script-deploy.yml` is manual, restricted to `main`, and requires three encrypted repository secrets:

- `CLASPRC_JSON`: the private contents of the authenticated `~/.clasprc.json` file;
- `CLASP_JSON`: the private contents of the project's `.clasp.json` file;
- `CLASP_DEPLOYMENT_ID`: the deployment ID returned by the initial private deployment.

With GitHub CLI authenticated for this repository, the secrets can be loaded without printing their contents:

```bash
cd "$HOME/egononos"
gh secret set CLASPRC_JSON < "$HOME/.clasprc.json"
gh secret set CLASP_JSON < apps-script/.clasp.json
gh secret set CLASP_DEPLOYMENT_ID --body "PASTE_DEPLOYMENT_ID_LOCALLY"
```

Never commit these values, paste them into chat, place them in Drive documents, or print them in workflow logs. Rotate the `clasp` refresh token if the local machine or GitHub repository credentials are suspected to be compromised.

After the three secrets are present, run the `Deploy EGONON Apps Script` workflow manually from `main`. The workflow pushes the repository source and updates the existing private deployment to a new immutable Apps Script version.

## Source of truth

- Google Drive: documents and deliverables.
- Google Apps Script: operational automations and triggers.
- GitHub: source code, reviews and deployment definitions.
- EGONON OS: orchestration, analysis and user interaction.
