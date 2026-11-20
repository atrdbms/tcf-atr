# TCF Scheme – Amrabad Tiger Reserve

A web app for the Tiger Conservation Foundation Scheme's finance records: **Action Plan of Operations (APO)**, **Expenditure**, **Receipts** and **Cheques Issued**. **Activities** and **Revenue Items** are its master lists.

Live site: https://atrdbms.github.io/tcf-atr/

- Expenditure is recorded against approved APO works, and the app shows the APO amount, the amount spent and the remaining balance.
- Receipts are recorded against Revenue Items.
- The Summary page shows totals, component utilisation, a division summary and monthly charts.

## Data and automatic sync
- `index.html` contains a snapshot of the six Google Sheets taken on 20-Nov-2026, so it works even before sync is set up.
- With `Code.gs` deployed as a Google Apps Script web app, sync is automatic. Every save or delete is written to the matching sheet row. The site loads the latest sheet data when it opens and every 5 minutes after that. Changes made while offline are queued and sent later.
- Expenditure rows get an **APO ID** column and receipts get a **Revenue Item ID** column, so the links survive the trip through the sheets.

### One-time setup
1. At script.google.com, signed in as the owner of the six sheets, create a New project and paste `Code.gs`. Then set `TOKEN`.
2. Choose Deploy → New deployment → Web app. Set Execute as to **Me** and Who has access to **Anyone**, then copy the `/exec` URL.
3. Put the URL and token in `sheetsUrl` and `sheetsToken` near the top of `index.html`. This switches sync on for everyone. You can also enter them in the site under Data & sync, which only applies to that browser.

The whole app is the single file `index.html`, with no build step.
