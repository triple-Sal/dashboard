// ============================================================
//  קריאת טבלה מגוגל שיטס בעזרת "חשבון הרובוט".
//  המפתח של הרובוט מגיע מהכספת של GitHub (GOOGLE_SERVICE_ACCOUNT)
//  ולעולם לא נשמר בקבצים או מודפס.
// ============================================================

import { createSign } from 'node:crypto';

const b64url = (buf) => Buffer.from(buf).toString('base64url');

// מקבל "כרטיס כניסה" זמני (שעה) מגוגל, בהרשאת קריאה בלבד
async function getAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64url(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/drive.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));
  const signer = createSign('RSA-SHA256');
  signer.update(`${header}.${claims}`);
  const jwt = `${header}.${claims}.${b64url(signer.sign(sa.private_key))}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  if (!res.ok) throw new Error(`Google login failed (${res.status})`);
  return (await res.json()).access_token;
}

// מוציא את מזהה הקובץ מתוך לינק רגיל לטבלה
export function sheetIdFromUrl(url) {
  const m = String(url).match(/\/d\/([a-zA-Z0-9_-]+)/);
  return m ? m[1] : url;
}

// קורא טווח מהטבלה ומחזיר רשימת שורות (כל שורה = רשימת ערכים)
export async function readSheet({ url, range }) {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT secret is missing');
  const token = await getAccessToken(JSON.parse(raw));
  const id = sheetIdFromUrl(url);
  const api = `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${encodeURIComponent(range)}?valueRenderOption=FORMATTED_VALUE`;
  const res = await fetch(api, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    const hint = res.status === 403 ? ' — is the sheet shared with the robot?' : res.status === 404 ? ' — check the sheet link' : '';
    throw new Error(`Sheet read failed (${res.status})${hint}`);
  }
  return (await res.json()).values || [];
}

// מחזיר רק את שמות הלשוניות (בלי תוכן) – לבדיקת חיבור
export async function sheetTabs({ url }) {
  const token = await getAccessToken(JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT));
  const id = sheetIdFromUrl(url);
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${id}?fields=sheets.properties(title,gridProperties)`,
    { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Sheet info failed (${res.status})`);
  return (await res.json()).sheets.map(s => s.properties);
}

// ---------- קובץ Excel (xlsx) ששמור בגוגל דרייב ----------

// פרטי הקובץ (שם וסוג) – בלי תוכן
export async function driveFileInfo({ url }) {
  const token = await getAccessToken(JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT));
  const id = sheetIdFromUrl(url);
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${id}?fields=name,mimeType,modifiedTime&supportsAllDrives=true`,
    { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    const hint = res.status === 404 ? ' — not found: is the file shared with the robot?' : '';
    throw new Error(`Drive file info failed (${res.status})${hint}`);
  }
  return res.json();
}

// מוריד את קובץ האקסל ומחזיר אותו כחוברת עבודה (workbook)
export async function readExcelFromDrive({ url }) {
  const XLSX = await import('xlsx');
  const token = await getAccessToken(JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT));
  const id = sheetIdFromUrl(url);
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media&supportsAllDrives=true`,
    { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Drive download failed (${res.status})`);
  const buf = Buffer.from(await res.arrayBuffer());
  return XLSX.read(buf, { type: 'buffer', cellDates: true });
}
