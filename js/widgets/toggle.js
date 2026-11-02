// כפתור "הסתר": מסתיר/מציג את רכיב המכולות. המחשב זוכר את הבחירה.
import { icon } from '../icons.js';

const KEY = 'hide-containers';
const read = () => { try { return localStorage.getItem(KEY) === '1'; } catch { return false; } };
const write = (v) => { try { localStorage.setItem(KEY, v ? '1' : '0'); } catch {} };

export function initToggle(btn, target) {
  const apply = (hidden) => {
    target.hidden = hidden;
    btn.classList.toggle('off', hidden);
    btn.setAttribute('aria-pressed', String(hidden));
    btn.title = hidden ? 'לחץ כדי להציג שוב את המכולות' : 'הסתר את המכולות';
    btn.innerHTML = `${icon('ship')}<span>הסתר</span>`;
  };
  apply(read());
  btn.addEventListener('click', () => { const h = !target.hidden; write(h); apply(h); });
}
