/**
 * TCF Scheme – Amrabad Tiger Reserve
 * Google Sheets sync for the TCF finance website.
 * Deploy: Deploy > New deployment > Web app (Execute as: Me, Who has access: Anyone).
 */
const TOKEN = 'atr-tcf-2026';   // must match the token entered on the website

const SHEETS = {
  apo:          { id: '15QT66wIIJFqDNzHnRN4LzcXQdGV33sUphaGLBxuym3c', tab: 'APO' },
  expenditure:  { id: '1UNxY_Z8896wg-vpiekG54xjDqgpAyZ-jQcdMUoPh4ck', tab: 'Expenditure' },
  receipts:     { id: '1iF8TdiHyS5DlUNoB0gZZhc5IPqwcLOx-Lkfcc-8RSm0', tab: 'Sheet1' },
  cheques:      { id: '1vMnB8Emik7lpqz9ky9SarVDyvTNVo94d9K3V8TwXQcU', tab: 'cheques' },
  activities:   { id: '1nlClTyRfrTsOisQzIvBD_U3G63JUYIjNaCmcuMcyvVo', tab: 'activities' },
  revenueItems: { id: '1Cc3MeWrpNVErpwOzzfPEiBQ74k5f3ZN1Oj8aJhL-Nng', tab: 'revenueactivities' },
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

/** Row-by-row changes sent automatically by the website on every save / delete. */
function applyOps_(ops) {
  const norm = function (s) { return String(s).trim().toLowerCase(); };
  ops.forEach(function (o) {
    const cfg = SHEETS[o.t];
    if (!cfg) return;
    const sh = SpreadsheetApp.openById(cfg.id).getSheetByName(cfg.tab);
    const head = sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), 1)).getDisplayValues()[0].map(String);
    const idCol = head.map(norm).findIndex(function (h) { return h === 'id' || h === 'id no'; });
    if (idCol < 0) throw new Error('No ID column in ' + cfg.tab);
    const last = sh.getLastRow();
    const ids = last > 1 ? sh.getRange(2, idCol + 1, last - 1, 1).getDisplayValues().map(function (r) { return String(r[0]).trim(); }) : [];
    const at = ids.indexOf(String(o.id).trim());
    if (o.del) { if (at >= 0) sh.deleteRow(at + 2); return; }
    o.headers.forEach(function (h) {           // add any new column (e.g. APO ID) to the header row
      if (head.map(norm).indexOf(norm(h)) < 0) { head.push(h); sh.getRange(1, head.length).setValue(h); }
    });
    const keys = head.map(norm);
    const row = at >= 0 ? sh.getRange(at + 2, 1, 1, head.length).getValues()[0] : head.map(function () { return ''; });
    o.headers.forEach(function (h, i) { row[keys.indexOf(norm(h))] = o.row[i]; });
    if (at >= 0) sh.getRange(at + 2, 1, 1, head.length).setValues([row]);
    else sh.appendRow(row);
  });
}

/** POST: action "ops" = automatic row changes; action "push" = back up each tab, then overwrite it. */
function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  if (body.token !== TOKEN) return out_({ ok: false, error: 'Wrong token' });
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    if (body.action === 'ops') { applyOps_(body.ops || []); return out_({ ok: true }); }
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
