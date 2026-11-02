// רכיב: שעון ותאריך עברי
export function renderClock(el) {
  const tick = () => {
    const now = new Date();
    el.innerHTML = `
      <div class="time">${now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</div>
      <div class="date">${now.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>`;
  };
  tick();
  setInterval(tick, 1000 * 15);
}
