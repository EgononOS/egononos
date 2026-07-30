const EGONON_PROPERTY_KEYS = Object.freeze({
  SHARED_LIBRARY_FOLDER_ID: 'SHARED_LIBRARY_FOLDER_ID',
  CANONICAL_DELIVERABLES_FOLDER_ID: 'CANONICAL_DELIVERABLES_FOLDER_ID',
  REGISTRY_SPREADSHEET_ID: 'REGISTRY_SPREADSHEET_ID',
  REGISTRY_SHEET_NAME: 'REGISTRY_SHEET_NAME'
});

function setEgononConfig(sharedLibraryFolderId, canonicalFolderId, registrySpreadsheetId, registrySheetName) {
  if (!sharedLibraryFolderId || !canonicalFolderId || !registrySpreadsheetId) {
    throw new Error('Shared library folder, canonical folder and registry spreadsheet IDs are required.');
  }

  PropertiesService.getScriptProperties().setProperties({
    [EGONON_PROPERTY_KEYS.SHARED_LIBRARY_FOLDER_ID]: String(sharedLibraryFolderId).trim(),
    [EGONON_PROPERTY_KEYS.CANONICAL_DELIVERABLES_FOLDER_ID]: String(canonicalFolderId).trim(),
    [EGONON_PROPERTY_KEYS.REGISTRY_SPREADSHEET_ID]: String(registrySpreadsheetId).trim(),
    [EGONON_PROPERTY_KEYS.REGISTRY_SHEET_NAME]: String(registrySheetName || 'Documents').trim()
  }, false);

  return getEgononConfig();
}

function getEgononConfig() {
  const props = PropertiesService.getScriptProperties().getProperties();
  return {
    sharedLibraryFolderId: props[EGONON_PROPERTY_KEYS.SHARED_LIBRARY_FOLDER_ID] || '',
    canonicalDeliverablesFolderId: props[EGONON_PROPERTY_KEYS.CANONICAL_DELIVERABLES_FOLDER_ID] || '',
    registrySpreadsheetId: props[EGONON_PROPERTY_KEYS.REGISTRY_SPREADSHEET_ID] || '',
    registrySheetName: props[EGONON_PROPERTY_KEYS.REGISTRY_SHEET_NAME] || 'Documents'
  };
}

function requireEgononConfig_() {
  const config = getEgononConfig();
  const missing = [];

  if (!config.sharedLibraryFolderId) missing.push(EGONON_PROPERTY_KEYS.SHARED_LIBRARY_FOLDER_ID);
  if (!config.canonicalDeliverablesFolderId) missing.push(EGONON_PROPERTY_KEYS.CANONICAL_DELIVERABLES_FOLDER_ID);
  if (!config.registrySpreadsheetId) missing.push(EGONON_PROPERTY_KEYS.REGISTRY_SPREADSHEET_ID);

  if (missing.length) {
    throw new Error('Missing Apps Script properties: ' + missing.join(', '));
  }

  return config;
}
