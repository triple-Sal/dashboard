// רכיב: מכולות שמגיעות בימים הקרובים (מתוך טבלת האקסל)
import { CONFIG } from '../../config.js';
import { icon } from '../icons.js';
import { loadData, esc, timeAgo } from '../utils.js';
import { flagCode, fruitIcon, twemoji } from '../data/lookups.js';

// צבעי מכולות בגווני טבע, מתחלפים לפי הסדר
const COLORS = ['#b5543c', '#3f7d5c', '#2f6f8f', '#c48a2c', '#6d5a8c', '#8a6a3f'];

function containerSvg(color) {
  // מכולה ימית: גוף, פסים אנכיים (גלי פח), דלתות ומוטות נעילה
  const ribs = Array.from({ length: 13 }, (_, i) => `<rect x="${14 + i * 13}" y="12" width="5" height="76" rx="1.5" fill="#000" opacity=".09"/>`).join('');
  return `
  <svg class="box" viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden="true">
    <rect x="2" y="4" width="196" height="92" rx="6" fill="${color}"/>
    <rect x="2" y="4" width="196" height="8" rx="4" fill="#000" opacity=".15"/>
    <rect x="2" y="88" width="196" height="8" rx="4" fill="#000" opacity=".2"/>
    ${ribs}
    <rect x="6" y="8" width="6" height="84" rx="2" fill="#000" opacity=".12"/>
    <rect x="188" y="8" width="6" height="84" rx="2" fill="#000" opacity=".12"/>
  </svg>`;
}

function dayLabel(iso) {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jerusalem' });
  const tomorrow = new Date(Date.now() + 86400000).toLocaleDateString('en-CA', { timeZone: 'Asia/Jerusalem' });
  const d = new Date(iso + 'T12:00:00');
  const date = d.toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' });
  if (iso === today) return `היום · ${date}`;
  if (iso === tomorrow) return `מחר · ${date}`;
  const days = Math.round((new Date(iso + 'T12:00:00') - new Date(today + 'T12:00:00')) / 86400000);
  if (days < 0) return `${date} · לפני ${-days} ימים`;
  if (days > 7) return `${d.toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric', year: '2-digit' })} · בעוד ${days} ימים`;
  return `${d.toLocaleDateString('he-IL', { weekday: 'long' })} · ${date}`;
}

function card(c, i) {
  const flag = flagCode(c.origin);
  const flagHtml = flag
    ? `<img class="c-flag" src="https://flagcdn.com/${flag}.svg" alt="${esc(c.origin)}">`
    : `<span class="c-flag c-globe">${icon('globe')}</span>`;
  return `
    <article class="container-card${c.release ? ' release' : ''}">
      <div class="c-visual">
        ${containerSvg(COLORS[i % COLORS.length])}
        <div class="c-inside">
          ${flagHtml}
          <img class="c-fruit" src="${twemoji(fruitIcon(c.fruit))}" alt="">
        </div>
        <span class="c-file" title="מספר תיק">#${esc(c.file)}</span>
        ${c.release ? `<span class="c-badge">${icon('alert')} ${esc(c.status)}</span>` : ''}
      </div>
      <div class="c-info">
        ${c.arrival ? `<div class="c-date">${icon('calendar')}<span>${dayLabel(c.arrival)}</span></div>` : ''}
        <div class="c-title">${esc(c.fruit)}${c.variety ? ` <span class="c-variety">${esc(c.variety)}</span>` : ''}</div>
        <div class="c-line">${icon('pin')}<span>${esc(c.origin) || '—'}</span></div>
        <div class="c-line" title="ספק"><b>ספק:</b><span>${esc(c.supplier) || '—'}</span></div>
        <div class="c-line" title="יבואן"><b>יבואן:</b><span>${esc(c.importer) || '—'}</span></div>
      </div>
    </article>`;
}

export async function renderContainers(el) {
  const cfg = CONFIG.containers;
  let data;
  try { data = await loadData('containers.json'); }
  catch {
    el.innerHTML = `<div class="card-head"><span class="ico">${icon('ship')}</span><h2>${cfg.title}</h2></div>
      <p class="error">לא הצלחתי לטעון את נתוני המכולות</p>`;
    return;
  }

  const cards = data.items.map(card).join('');

  el.innerHTML = `
    <div class="card-head">
      <span class="ico">${icon('ship')}</span>
      <h2>${data.fallback ? `${cfg.title} · המכולות הבאות` : `${cfg.title} · ${cfg.daysAhead} הימים הקרובים`}</h2>
      <span class="c-total">${data.items.length} ${data.items.length === 1 ? 'מכולה' : 'מכולות'}</span>
      <span class="updated">${timeAgo(data.updated)}</span>
    </div>
    ${data.fallback && data.items.some(i => !i.release) ? `<p class="note c-fallback">אין הגעות ב-${cfg.daysAhead} הימים הקרובים, אז מוצגות המכולות הבאות בתור</p>` : ''}
    ${cards ? `<div class="c-grid">${cards}</div>` : '<p class="error">אין מכולות צפויות בימים הקרובים 🌿</p>'}`;
}
