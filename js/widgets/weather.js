// רכיב: מזג אוויר (נתונים חיים מ-Open-Meteo, שירות חינמי בלי הרשמה)
import { CONFIG } from '../../config.js';
import { icon } from '../icons.js';
import { timeAgo } from '../utils.js';
import { setWeatherScene } from '../scene.js';

// קודי מזג האוויר הבינלאומיים: [תיאור בעברית, אייקון]
const CODES = {
  0: ['שמיים בהירים', 'sun'],
  1: ['בהיר ברובו', 'cloudSun'], 2: ['מעונן חלקית', 'cloudSun'], 3: ['מעונן', 'cloud'],
  45: ['ערפל', 'fog'], 48: ['ערפל', 'fog'],
  51: ['טפטוף קל', 'drizzle'], 53: ['טפטוף', 'drizzle'], 55: ['טפטוף חזק', 'drizzle'],
  61: ['גשם קל', 'rain'], 63: ['גשם', 'rain'], 65: ['גשם חזק', 'rain'],
  66: ['גשם קפוא', 'rain'], 67: ['גשם קפוא', 'rain'],
  71: ['שלג קל', 'snow'], 73: ['שלג', 'snow'], 75: ['שלג כבד', 'snow'], 77: ['שלג', 'snow'],
  80: ['ממטרים קלים', 'rain'], 81: ['ממטרים', 'rain'], 82: ['ממטרים חזקים', 'rain'],
  85: ['ממטרי שלג', 'snow'], 86: ['ממטרי שלג', 'snow'],
  95: ['סופת רעמים', 'storm'], 96: ['סופת רעמים וברד', 'storm'], 99: ['סופת רעמים וברד', 'storm'],
};
const info = code => CODES[code] || ['', 'cloud'];

export async function renderWeather(el) {
  const w = CONFIG.weather;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${w.latitude}&longitude=${w.longitude}`
    + '&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day'
    + '&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset'
    + `&forecast_days=${w.forecastDays + 1}&timezone=Asia%2FJerusalem`;

  let d;
  try {
    const res = await fetch(url);
    d = await res.json();
    if (!res.ok || !d.current || !d.daily) throw new Error(d.reason || `HTTP ${res.status}`);
  } catch (e) {
    console.warn('weather failed:', e);
    // אם כבר מוצג מזג אוויר, משאירים אותו; אחרת מציגים הודעה ומנסים שוב בעוד דקה
    if (!el.querySelector('.weather-now')) {
      el.innerHTML = `<div class="card-head"><span class="ico">${icon('pin')}</span><h2>מזג האוויר ב${w.city}</h2></div>
        <p class="error">לא הצלחתי לטעון את מזג האוויר כרגע, מנסה שוב...</p>`;
    }
    setTimeout(() => renderWeather(el), 60 * 1000);
    return;
  }

  const now = d.current;
  // הרקע משתנה לפי מזג האוויר והשעה (זריחה/שקיעה בזמן ישראל)
  const toUtc = (local) => local && new Date(Date.parse(local + 'Z') - (d.utc_offset_seconds || 0) * 1000);
  setWeatherScene({ code: now.weather_code, sunrise: toUtc(d.daily.sunrise?.[0]), sunset: toUtc(d.daily.sunset?.[0]) });
  const [desc, ico] = info(now.weather_code);
  const nowIcon = !now.is_day && ico === 'sun' ? 'moon' : ico;

  const days = d.daily.time.map((date, i) => {
    const name = i === 0 ? 'היום' : new Date(date).toLocaleDateString('he-IL', { weekday: 'long' });
    const [dd, di] = info(d.daily.weather_code[i]);
    return `
      <div class="day" title="${dd}">
        <div class="name">${name}</div>
        <div class="ico">${icon(di)}</div>
        <div class="range">${Math.round(d.daily.temperature_2m_max[i])}°<span class="min">${Math.round(d.daily.temperature_2m_min[i])}°</span></div>
      </div>`;
  }).join('');

  el.innerHTML = `
    <div class="card-head"><span class="ico">${icon('pin')}</span><h2>מזג האוויר ב${w.city}</h2><span class="updated">${timeAgo(new Date().toISOString())}</span></div>
    <div class="weather-now">
      <div class="big-ico">${icon(nowIcon)}</div>
      <div>
        <div class="temp">${Math.round(now.temperature_2m)}°</div>
        <div class="desc">${desc}</div>
        <div class="meta">
          <span>${icon('droplet')} לחות ${now.relative_humidity_2m}%</span>
          <span>${icon('wind')} רוח ${Math.round(now.wind_speed_10m)} קמ"ש</span>
        </div>
      </div>
    </div>
    <div class="forecast">${days}</div>`;
}
