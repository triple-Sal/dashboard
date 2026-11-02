// ============================================================
//  שליפת המכולות שמגיעות בימים הקרובים מתוך קובץ האקסל.
//  שומר רק את העמודות שהוגדרו ב-config.js, ולא מדפיס שום תוכן.
// ============================================================
import { readExcelFromDrive } from './google-sheet.mjs';

const colIndex = (letter) =>
  letter.toUpperCase().split('').reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0) - 1;

// התאריך של היום בישראל, בפורמט YYYY-MM-DD
function israelDate(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Jerusalem' });
}

// הופך ערך מתא (תאריך אמיתי, מספר אקסל, או טקסט כמו 05/11/2026) ל-YYYY-MM-DD
function toDate(v) {
  if (v == null || v === '') return null;
  if (v instanceof Date && !isNaN(v)) {
    // אקסל שומר תאריך בלי שעה; מתקנים סטייה של אזור זמן
    const d = new Date(v.getTime() + 12 * 3600000);
    return d.toISOString().slice(0, 10);
  }
  if (typeof v === 'number') {
    const d = new Date(Math.round((v - 25569) * 86400000) + 12 * 3600000);
    return d.toISOString().slice(0, 10);
  }
  const s = String(v).trim();
  let m = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/); // יום/חודש/שנה
  if (m) {
    const y = m[3].length === 2 ? '20' + m[3] : m[3];
    return `${y}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  }
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

const text = (v) => (v instanceof Date ? toDate(v) : v == null ? '' : String(v).trim());

export async function getContainers(sheetCfg, cfg) {
  const XLSX = await import('xlsx');
  const wb = await readExcelFromDrive(sheetCfg);
  const tabName = typeof cfg.tab === 'number' ? wb.SheetNames[cfg.tab - 1] : cfg.tab;
  const ws = wb.Sheets[tabName];
  if (!ws) throw new Error('Tab not found (check containers.tab in config.js)');

  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: '' });
  const from = israelDate(0);
  const to = israelDate(cfg.daysAhead);
  const c = Object.fromEntries(Object.entries(cfg.columns).map(([k, l]) => [k, colIndex(l)]));

  const all = rows.slice(cfg.headerRow)
    .map(r => ({
      file: text(r[c.file]),
      arrival: toDate(r[c.arrival]),
      fruit: text(r[c.fruit]),
      variety: text(r[c.variety]),
      origin: text(r[c.origin]),
      supplier: text(r[c.supplier]),
      importer: text(r[c.importer]),
    }))
    .filter(i => i.arrival && i.arrival >= from)
    .sort((a, b) => a.arrival.localeCompare(b.arrival));

  // המכולות שמגיעות בימים הקרובים; אם אין – הבאות בתור
  let items = all.filter(i => i.arrival <= to);
  const fallback = items.length === 0;
  if (fallback) items = all.slice(0, cfg.fallbackCount ?? 3);

  console.log(`containers: ${items.length} in the next ${cfg.daysAhead} days`);
  return { from, to, fallback, items };
}
