// פונקציות עזר קטנות שכל הרכיבים משתמשים בהן

// קריאת קובץ נתונים מתיקיית data (עם מניעת שמירה ישנה בזיכרון הדפדפן)
export async function loadData(file) {
  const res = await fetch(`data/${file}?t=${Date.now()}`);
  if (!res.ok) throw new Error(file);
  return res.json();
}

// הרצת פעולה עכשיו, ואז שוב כל X דקות
export function every(minutes, fn) {
  fn();
  setInterval(fn, minutes * 60 * 1000);
}

// מניעת הזרקת קוד מכותרות חיצוניות
export function esc(str = '') {
  return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function fmt(num, digits = 2) {
  return Number(num).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function timeAgo(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return 'עודכן ' + d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
}

// גרף קו קטן (sparkline) מתוך רשימת מספרים
export function sparkline(values, cls) {
  if (!values || values.length < 2) return '';
  const w = 300, h = 44, pad = 3;
  const min = Math.min(...values), max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => [
    (i / (values.length - 1)) * w,
    pad + (1 - (v - min) / span) * (h - pad * 2),
  ]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  return `<svg class="spark ${cls}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" dir="ltr">
    <path class="area" fill="currentColor" d="${line} L${w} ${h} L0 ${h}Z"/>
    <path class="line" stroke="currentColor" d="${line}"/>
  </svg>`;
}
