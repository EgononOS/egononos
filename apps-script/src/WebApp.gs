function doGet() {
  try {
    return jsonResponse_({
      service: 'EGONON OS Apps Script Bridge',
      status: 'ok',
      health: egononHealthCheck()
    }, 200);
  } catch (error) {
    return jsonResponse_({
      service: 'EGONON OS Apps Script Bridge',
      status: 'error',
      message: error && error.message ? error.message : String(error)
    }, 500);
  }
}

function jsonResponse_(payload, statusCode) {
  const output = ContentService.createTextOutput(JSON.stringify(payload, null, 2));
  output.setMimeType(ContentService.MimeType.JSON);
  // Apps Script ContentService does not expose arbitrary HTTP status setters.
  // statusCode is included in the body for operational diagnostics.
  const enriched = Object.assign({ httpStatus: statusCode }, payload);
  output.setContent(JSON.stringify(enriched, null, 2));
  return output;
}
