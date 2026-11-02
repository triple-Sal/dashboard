// רכיב: שעונים (ישראל גדול, ועוד ערים קטנות לידו) + תאריך עברי
import { CONFIG } from '../../config.js';

const time = (zone) => new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', timeZone: zone });

export function renderClock(el) {
  const [main, ...others] = CONFIG.clocks;
  const tick = () => {
    const now = new Date();
    el.innerHTML = `
      <div class="clock-main">
        <div class="time">${time(main.zone)}</div>
        <div class="date">${now.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: main.zone })}</div>
      </div>
      ${others.map(c => {
        const h = +new Date().toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: c.zone });
        const night = h < 6 || h >= 19;
        return `<div class="clock-other" title="${c.zone}">
          <div class="label">${night ? '🌙' : '☀️'} ${c.label}</div>
          <div class="time">${time(c.zone)}</div>
        </div>`;
      }).join('')}`;
  };
  tick();
  setInterval(tick, 1000 * 15);
}
