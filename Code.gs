/**
 * TCF Scheme – Amrabad Tiger Reserve
 * Google Sheets sync for the TCF finance website.
 * Deploy: Deploy > New deployment > Web app (Execute as: Me, Who has access: Anyone).
 */
const TOKEN = 'change-this-secret';   // must match the token entered on the website

const SHEETS = {
  apo:          { id: 'PASTE-SHEET-ID-HERE', tab: 'APO' },
  expenditure:  { id: 'PASTE-SHEET-ID-HERE', tab: 'Expenditure' },
  receipts:     { id: 'PASTE-SHEET-ID-HERE', tab: 'Sheet1' },
  cheques:      { id: 'PASTE-SHEET-ID-HERE', tab: 'cheques' },
  activities:   { id: 'PASTE-SHEET-ID-HERE', tab: 'activities' },
  revenueItems: { id: 'PASTE-SHEET-ID-HERE', tab: 'revenueactivities' },
};

function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/** Pull: returns every sheet as rows of displayed values (first row = headers). */
function doGet(e) {
  if ((e.parameter.token || '') !== TOKEN) return out_({ ok: false, error: 'Wrong token' });
  const data = {};
  Object.keys(SHEETS).forEach(function (k) {
    const sh = SpreadsheetApp.openById(SHEETS[k].id).getSheetByName(SHEETS[k].tab);
    data[k] = sh.getDataRange().getDisplayValues()
      .filter(function (r) { return r.some(function (c) { return String(c).trim() !== ''; }); });
  });
  return out_({ ok: true, data: data });
}

/** Push: backs up each tab, then overwrites it with the website's records. */
function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  if (body.token !== TOKEN) return out_({ ok: false, error: 'Wrong token' });
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const stamp = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HHmmss');
    Object.keys(SHEETS).forEach(function (k) {
      const rows = body.data[k];
      if (!rows || !rows.length) return;
      const ss = SpreadsheetApp.openById(SHEETS[k].id);
      const sh = ss.getSheetByName(SHEETS[k].tab);
      sh.copyTo(ss).setName(SHEETS[k].tab + ' backup ' + stamp);   // delete old backup tabs from time to time
      const width = Math.max.apply(null, rows.map(function (r) { return r.length; }));
      const values = rows.map(function (r) { const a = r.slice(); while (a.length < width) a.push(''); return a; });
      sh.clearContents();
      sh.getRange(1, 1, values.length, width).setValues(values);
    });
    return out_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}
