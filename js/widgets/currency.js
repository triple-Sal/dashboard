// רכיב: שערי מטבע מול השקל
import { CONFIG } from '../../config.js';
import { icon } from '../icons.js';
import { loadData, fmt, timeAgo, sparkline } from '../utils.js';

export async function renderCurrency(el) {
  let data;
  try { data = await loadData('markets.json'); }
  catch { el.innerHTML = '<p class="error">לא הצלחתי לטעון שערים</p>'; return; }

  const rows = CONFIG.currencies.map(c => {
    const q = data.currencies.find(x => x.code === c.code);
    if (!q) return '';
    const dir = q.change > 0 ? 'up' : q.change < 0 ? 'down' : 'flat';
    const chg = q.change == null ? '' : `
      <div class="chg ${dir}"><span class="ico">${icon(dir)}</span>${q.change > 0 ? '+' : ''}${fmt(q.changePct)}%</div>`;
    return `
      <div class="row">
        <div class="badge">${c.symbol}</div>
        <div><div class="name">${c.name}</div><div class="sub">${c.code} / ILS</div></div>
        <div class="value"><div class="price">₪${fmt(q.price, 3)}</div>${chg}</div>
        ${sparkline(q.history, dir)}
      </div>`;
  }).join('');

  el.innerHTML = `
    <div class="card-head"><span class="ico">${icon('coins')}</span><h2>שערי מט"ח</h2><span class="updated">${timeAgo(data.updated)}</span></div>
    <div class="rows">${rows}</div>
    <p class="note">הגרף מציג את החודש האחרון</p>`;
}
