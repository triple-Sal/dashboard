// ============================================================
//  "הרובוט": סקריפט שרץ ב-GitHub כל 15 דקות.
//  הוא אוסף כותרות חדשות, שערי מטבע ומדדים,
//  ושומר אותם בתיקיית data כקבצים שהדאשבורד קורא.
// ============================================================

import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { CONFIG } from '../config.js';

const DATA_DIR = new URL('../data/', import.meta.url);
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';


async function fetchText(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, 'Accept': '*/*' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

async function fetchJson(url) {
  return JSON.parse(await fetchText(url));
}

// ---------- עזרי טקסט ----------
function decode(str = '') {
  return str
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"').replace(/&apos;|&#39;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function tag(block, name) {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? decode(m[1]) : '';
}

// ---------- חדשות ----------
function parseRss(xml) {
  const items = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || [];
  return items.map(it => ({
    title: tag(it, 'title'),
    link: tag(it, 'link') || tag(it, 'guid'),
    date: tag(it, 'pubDate'),
  })).filter(i => i.title);
}

function scrapePage(html, baseUrl, pattern) {
  const out = [];
  const seen = new Set();
  const re = /<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    const href = m[1];
    if (!href.includes(pattern)) continue;
    const title = decode(m[2]);
    if (title.length < 20 || seen.has(title)) continue;
    seen.add(title);
    out.push({ title, link: new URL(href, baseUrl).href, date: '' });
  }
  return out;
}

async function getNews(src) {
  // אוספים מכל כתובות ה-RSS, מאחדים, מסירים כפילויות וממיינים מהחדש לישן
  const all = [];
  for (const url of src.rss) {
    try { all.push(...parseRss(await fetchText(url))); }
    catch (e) { console.warn('RSS failed:', e.message); }
  }
  if (!all.length) {
    try { all.push(...scrapePage(await fetchText(src.page), src.page, src.articlePattern)); }
    catch (e) { console.warn('Page failed:', e.message); }
  }
  if (!all.length) throw new Error(`No news from ${src.source}`);
  const seen = new Set();
  return all
    .filter(i => !seen.has(i.title) && seen.add(i.title))
    .sort((a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0));
}

// ---------- שווקים (Yahoo Finance) ----------
async function yahoo(symbol) {
  const path = `/v8/finance/chart/${encodeURIComponent(symbol)}?range=1mo&interval=1d`;
  let data;
  try { data = await fetchJson('https://query1.finance.yahoo.com' + path); }
  catch { data = await fetchJson('https://query2.finance.yahoo.com' + path); }

  const r = data.chart.result[0];
  const closes = r.indicators.quote[0].close
    .map((c, i) => ({ t: r.timestamp[i] * 1000, v: c }))
    .filter(p => p.v != null);
  const price = r.meta.regularMarketPrice ?? closes.at(-1).v;
  const prev = closes.length > 1 ? closes.at(-2).v : r.meta.chartPreviousClose;
  return {
    price,
    previousClose: prev,
    change: price - prev,
    changePct: ((price - prev) / prev) * 100,
    marketTime: (r.meta.regularMarketTime || 0) * 1000,
    history: closes.map(p => +p.v.toFixed(4)),
  };
}

async function fxFallback(code) {
  const d = await fetchJson(`https://open.er-api.com/v6/latest/${code}`);
  return { price: d.rates.ILS, previousClose: null, change: null, changePct: null, marketTime: Date.now(), history: [] };
}

// ---------- שמירה, עם גיבוי לנתונים הקודמים ----------
// הנתונים מהריצה הקודמת (GitHub שומר אותם בזיכרון בין ריצות)
async function previous(file) {
  try { return JSON.parse(await readFile(new URL(file, DATA_DIR), 'utf8')); } catch { return null; }
}

async function save(file, producer) {
  let data;
  try {
    data = await producer();
    data.updated = new Date().toISOString();
  } catch (e) {
    console.warn(`⚠ ${file}: ${e.message} — keeping previous data`);
    data = await previous(file);
    if (!data) return;
  }
  await writeFile(new URL(file, DATA_DIR), JSON.stringify(data, null, 2));
  console.log('✔', file);
}

await mkdir(DATA_DIR, { recursive: true });

await save('news-israel.json', async () => ({
  source: CONFIG.news.israel.source,
  items: (await getNews(CONFIG.news.israel)).slice(0, CONFIG.news.maxHeadlines),
}));

await save('news-world.json', async () => ({
  source: CONFIG.news.world.source,
  items: (await getNews(CONFIG.news.world)).slice(0, CONFIG.news.maxHeadlines),
}));

await save('markets.json', async () => {
  const currencies = [];
  for (const c of CONFIG.currencies) {
    let q;
    try { q = await yahoo(c.yahoo); }
    catch (e) { console.warn('FX yahoo failed', c.code, e.message); q = await fxFallback(c.code); }
    currencies.push({ code: c.code, ...q });
  }
  const indices = [];
  for (const i of CONFIG.indices) {
    try { indices.push({ symbol: i.yahoo, ...(await yahoo(i.yahoo)) }); }
    catch (e) { console.warn('Index failed', i.yahoo, e.message); }
  }
  if (!currencies.length && !indices.length) throw new Error('no market data');
  return { currencies, indices };
});
