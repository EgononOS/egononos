function egononHealthCheck() {
  const config = requireEgononConfig_();
  const sharedFolder = DriveApp.getFolderById(config.sharedLibraryFolderId);
  const canonicalFolder = DriveApp.getFolderById(config.canonicalDeliverablesFolderId);
  const spreadsheet = SpreadsheetApp.openById(config.registrySpreadsheetId);
  const sheet = spreadsheet.getSheetByName(config.registrySheetName);

  if (!sheet) {
    throw new Error('Registry sheet not found: ' + config.registrySheetName);
  }

  return {
    ok: true,
    checkedAt: new Date().toISOString(),
    sharedLibrary: {
      id: sharedFolder.getId(),
      name: sharedFolder.getName()
    },
    canonicalDeliverables: {
      id: canonicalFolder.getId(),
      name: canonicalFolder.getName(),
      fileCount: countFiles_(canonicalFolder)
    },
    registry: {
      id: spreadsheet.getId(),
      name: spreadsheet.getName(),
      sheetName: sheet.getName(),
      rows: Math.max(sheet.getLastRow() - 1, 0)
    }
  };
}

function listCanonicalDeliverables() {
  const config = requireEgononConfig_();
  const folder = DriveApp.getFolderById(config.canonicalDeliverablesFolderId);
  const files = folder.getFiles();
  const results = [];

  while (files.hasNext()) {
    const file = files.next();
    results.push({
      id: file.getId(),
      name: file.getName(),
      mimeType: file.getMimeType(),
      size: file.getSize(),
      createdAt: file.getDateCreated().toISOString(),
      updatedAt: file.getLastUpdated().toISOString(),
      url: file.getUrl()
    });
  }

  results.sort(function(a, b) {
    return a.name.localeCompare(b.name);
  });

  return results;
}

function registerCanonicalDeliverable(fileId, metadata) {
  if (!fileId) throw new Error('fileId is required.');

  const config = requireEgononConfig_();
  const file = DriveApp.getFileById(String(fileId).trim());
  assertFileInFolder_(file, config.canonicalDeliverablesFolderId);

  const spreadsheet = SpreadsheetApp.openById(config.registrySpreadsheetId);
  const sheet = spreadsheet.getSheetByName(config.registrySheetName);
  if (!sheet) throw new Error('Registry sheet not found: ' + config.registrySheetName);

  const headers = readHeaders_(sheet);
  const input = metadata || {};
  const record = {
    document_id: input.document_id || buildDocumentId_(file),
    title: input.title || file.getName(),
    category: input.category || 'Canonical deliverable',
    product: input.product || '',
    version: input.version || Utilities.formatDate(new Date(), 'Europe/Zurich', 'yyyy-MM-dd'),
    status: input.status || 'APPROVED',
    document_date: input.document_date || Utilities.formatDate(new Date(), 'Europe/Zurich', 'yyyy-MM-dd'),
    drive_file_id: file.getId(),
    drive_url: file.getUrl(),
    folder: input.folder || '01_CANONICAL_DELIVERABLES',
    mime_type: file.getMimeType(),
    sha256: input.sha256 || '',
    owner: input.owner || 'Egonon SA',
    confidentiality: input.confidentiality || 'INTERNAL',
    replaces: input.replaces || '',
    approved_by: input.approved_by || '',
    approval_date: input.approval_date || '',
    last_verified: Utilities.formatDate(new Date(), 'Europe/Zurich', 'yyyy-MM-dd'),
    notes: input.notes || 'Registered by EGONON OS Apps Script bridge.'
  };

  const row = headers.map(function(header) {
    return Object.prototype.hasOwnProperty.call(record, header) ? record[header] : '';
  });

  sheet.appendRow(row);
  return {
    ok: true,
    row: sheet.getLastRow(),
    documentId: record.document_id,
    fileId: file.getId(),
    url: file.getUrl()
  };
}

function countFiles_(folder) {
  const files = folder.getFiles();
  let count = 0;
  while (files.hasNext()) {
    files.next();
    count += 1;
  }
  return count;
}

function readHeaders_(sheet) {
  const lastColumn = sheet.getLastColumn();
  if (lastColumn < 1) throw new Error('Registry sheet has no headers.');

  const headers = sheet.getRange(1, 1, 1, lastColumn).getDisplayValues()[0].map(function(value) {
    return String(value).trim();
  });

  if (!headers.filter(String).length) throw new Error('Registry header row is empty.');
  return headers;
}

function assertFileInFolder_(file, folderId) {
  const parents = file.getParents();
  while (parents.hasNext()) {
    if (parents.next().getId() === folderId) return;
  }
  throw new Error('File is not directly contained in the configured canonical deliverables folder.');
}

function buildDocumentId_(file) {
  const stem = file.getName().replace(/\.[^.]+$/, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return stem.toUpperCase();
}
