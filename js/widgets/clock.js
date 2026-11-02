// רכיב: שעונים (ישראל גדול, ועוד ערים קטנות לידו) + תאריך עברי
import { CONFIG } from '../../config.js';

const time = (zone) => new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', timeZone: zone });

export function renderClock(el) {
  const [main, ...others] = CONFIG.clocks;
  const tick = () => {
    const now = new Date();
    el.innerHTML = `
      <div class="clock-main">
        <div class="time">${main.flag ? `<img class="clock-flag big" src="https://flagcdn.com/${main.flag}.svg" alt="">` : ''}${time(main.zone)}</div>
        <div class="date">${now.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: main.zone })}</div>
      </div>
      ${others.map(c => {
        const flag = c.flag ? `<img class="clock-flag" src="https://flagcdn.com/${c.flag}.svg" alt="">` : '';
        return `<div class="clock-other" title="${c.zone}">
          <div class="label">${flag}<span>${c.label}</span></div>
          <div class="time">${time(c.zone)}</div>
        </div>`;
      }).join('')}`;
  };
  tick();
  setInterval(tick, 1000 * 15);
}
