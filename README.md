# TCF Scheme – Amrabad Tiger Reserve

A web app for the Tiger Conservation Foundation Scheme's finance records: **Action Plan of Operations (APO)**, **Expenditure**, **Receipts** and **Cheques Issued**. **Activities** and **Revenue Items** are its master lists.

- Expenditure is recorded against approved APO works, and the app shows the APO amount, the amount spent and the remaining balance.
- Receipts are recorded against Revenue Items.
- The Summary page shows totals, component utilisation, a division summary and monthly charts.

## Data
This public copy contains **no financial records**. Records are kept in the browser of each computer that uses it. Load them in one of two ways:
- **Data & sync → Restore from backup**, using a backup file exported from the app.
- **Data & sync → Pull from Google Sheets**, after setting up `Code.gs`. Paste your own sheet IDs and a secret token into it, then deploy it as an Apps Script web app with *Execute as: Me*.

The whole app is the single file `index.html`, with no build step.
