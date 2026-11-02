// רכיב: באנר רץ של כותרות חדשות
import { CONFIG } from '../../config.js';
import { icon } from '../icons.js';
import { loadData, esc } from '../utils.js';

export async function renderTicker(el, feed, file) {
  el.setAttribute('dir', feed.direction);
  let data;
  try { data = await loadData(file); }
  catch {
    if (!el.innerHTML) el.innerHTML = `<div class="ticker-label">${esc(feed.label)}</div><div class="ticker-window error">&nbsp; אין כרגע כותרות</div>`;
    return;
  }

  // אם הכותרות לא השתנו, לא מאתחלים את הגלילה
  const key = data.items.map(i => i.title).join('|');
  if (el.dataset.key === key) return;
  el.dataset.key = key;

  const items = data.items.map(i =>
    `<a class="ticker-item" href="${esc(i.link)}" target="_blank" rel="noopener">${esc(i.title)}</a>`
  ).join('');

  el.innerHTML = `
    <div class="ticker-label"><span class="ico">${icon(feed.direction === 'rtl' ? 'newspaper' : 'globe')}</span>${esc(feed.label)}</div>
    <div class="ticker-window"><div class="ticker-track"><div class="ticker-set">${items}</div></div></div>`;

  const win = el.querySelector('.ticker-window');
  const track = el.querySelector('.ticker-track');
  const set = track.firstElementChild;

  // אם יש מעט כותרות, משכפלים עד שהן ממלאות את הרוחב
  let guard = 0;
  while (set.scrollWidth < win.clientWidth && guard++ < 10) set.innerHTML += items;
  track.appendChild(set.cloneNode(true));

  // מהירות קבועה, בלי קשר לכמות הכותרות
  track.style.animationDuration = `${set.scrollWidth / CONFIG.news.speed}s`;
}
