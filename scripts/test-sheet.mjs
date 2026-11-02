// בדיקת חיבור לטבלה: מדפיס רק נתונים סטטיסטיים – בלי שום תוכן מהטבלה.
import { CONFIG } from '../config.js';
import { driveFileInfo, readExcelFromDrive } from './google-sheet.mjs';

const info = await driveFileInfo(CONFIG.sheet);
console.log('File type:', info.mimeType, '| modified:', info.modifiedTime);
const wb = await readExcelFromDrive(CONFIG.sheet);
const XLSX = await import('xlsx');
const cfg = CONFIG.containers;
const ws = wb.Sheets[cfg.tab];
console.log('Tab found:', !!ws, '| tabs total:', wb.SheetNames.length);
if (ws) {
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: '' });
  const col = cfg.columns.arrival.charCodeAt(0) - 65;
  const vals = rows.slice(cfg.headerRow).map(r => r[col]).filter(v => v !== '');
  const types = {};
  const shapes = {};
  const dates = [];
  for (const v of vals) {
    const t = v instanceof Date ? 'date' : typeof v;
    types[t] = (types[t] || 0) + 1;
    if (t === 'string') { const s = v.replace(/\d/g, '9').replace(/[^\d9./\- :]/g, 'x'); shapes[s] = (shapes[s] || 0) + 1; }
    if (t === 'date') dates.push(v.toISOString().slice(0, 10));
    if (t === 'number') dates.push(new Date(Math.round((v - 25569) * 86400000)).toISOString().slice(0, 10));
  }
  dates.sort();
  console.log('Rows after header:', rows.length - cfg.headerRow, '| non-empty arrival cells:', vals.length);
  console.log('Arrival value types:', JSON.stringify(types));
  console.log('Text shapes (digits→9):', JSON.stringify(shapes).slice(0, 300));
  console.log('Earliest / latest arrival:', dates[0], '/', dates.at(-1));
  const header = rows[cfg.headerRow - 1] || [];
  console.log('Header row has text in columns:', header.map((h, i) => h !== '' ? String.fromCharCode(65 + (i % 26)) : null).filter(Boolean).join(','));
}
console.log('✔ Connection OK');
