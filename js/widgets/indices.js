// רכיב: מדדים מובילים
import { CONFIG } from '../../config.js';
import { icon } from '../icons.js';
import { loadData, fmt, timeAgo, sparkline } from '../utils.js';

export async function renderIndices(el) {
  let data;
  try { data = await loadData('markets.json'); }
  catch { el.innerHTML = '<p class="error">לא הצלחתי לטעון מדדים</p>'; return; }

  const rows = CONFIG.indices.map(i => {
    const q = data.indices.find(x => x.symbol === i.yahoo);
    if (!q) return '';
    const dir = q.change > 0 ? 'up' : q.change < 0 ? 'down' : 'flat';
    return `
      <div class="row">
        <div class="badge"><img class="flag" src="https://flagcdn.com/${i.flag}.svg" alt="${i.country}"></div>
        <div><div class="name">${i.name}</div><div class="sub">${i.country}</div></div>
        <div class="value">
          <div class="price">${fmt(q.price)}</div>
          <div class="chg ${dir}"><span class="ico">${icon(dir)}</span>${q.change > 0 ? '+' : ''}${fmt(q.changePct)}%</div>
        </div>
        ${sparkline(q.history, dir)}
      </div>`;
  }).join('');

  el.innerHTML = `
    <div class="card-head"><span class="ico">${icon('chart')}</span><h2>מדדים מובילים</h2><span class="updated">${timeAgo(data.updated)}</span></div>
    <div class="rows">${rows}</div>
    <p class="note">הנתונים בעיכוב של כ-15 דקות · הגרף מציג את החודש האחרון</p>`;
}
