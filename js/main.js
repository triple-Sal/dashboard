// ============================================================
//  "המנצח": מפעיל את כל הרכיבים ומרענן אותם לפי הזמנים ב-config.js.
//  כדי להסיר רכיב, מוחקים את השורה שלו כאן (ואת המקום שלו ב-index.html).
// ============================================================
import { CONFIG } from '../config.js';
import { fillIcons } from './icons.js';
import { every } from './utils.js';
import { renderClock } from './widgets/clock.js';
import { renderTicker } from './widgets/news-ticker.js';
import { renderCurrency } from './widgets/currency.js';
import { renderIndices } from './widgets/indices.js';
import { renderWeather } from './widgets/weather.js';

const $ = id => document.getElementById(id);
const R = CONFIG.refreshMinutes;

document.title = CONFIG.title;
$('title').lastElementChild.textContent = CONFIG.title;
fillIcons();

renderClock($('clock'));
every(R.news,    () => renderTicker($('ticker-israel'), CONFIG.news.israel, 'news-israel.json'));
every(R.news,    () => renderTicker($('ticker-world'),  CONFIG.news.world,  'news-world.json'));
every(R.markets, () => renderCurrency($('currency')));
every(R.markets, () => renderIndices($('indices')));
every(R.weather, () => renderWeather($('weather')));
