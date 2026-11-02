// ============================================================
//  הרקע הדינמי: משנה את הנוף לפי שעה ביום ומזג האוויר בתל אביב.
//  זמן: morning / day / evening / night
//  מזג אוויר: clear / partly / cloudy / rain / storm / fog
// ============================================================

let sunTimes = null; // זריחה ושקיעה של היום (מגיע ממזג האוויר)

function timeOfDay(now = new Date()) {
  let rise, set;
  if (sunTimes) { rise = sunTimes.rise; set = sunTimes.set; }
  else { rise = new Date(now); rise.setHours(6, 0, 0, 0); set = new Date(now); set.setHours(17, 30, 0, 0); }
  const H = 3600000;
  if (now < rise - 0.5 * H || now > set + 0.75 * H) return 'night';
  if (now < rise + 2.5 * H) return 'morning';
  if (now > set - 1.5 * H) return 'evening';
  return 'day';
}

// קוד מזג אוויר בינלאומי -> סוג שמיים
export function skyFromCode(code) {
  if (code === 0 || code === 1) return 'clear';
  if (code === 2) return 'partly';
  if (code === 3) return 'cloudy';
  if (code === 45 || code === 48) return 'fog';
  if (code >= 95) return 'storm';
  if (code >= 51) return 'rain';
  return 'partly';
}

// לבדיקה: אפשר לכפות מצב דרך הכתובת, למשל ?time=night&sky=rain
const params = new URLSearchParams(location.search);

function apply() {
  document.body.dataset.time = params.get('time') || timeOfDay();
  if (params.get('sky')) document.body.dataset.sky = params.get('sky');
}

export function setWeatherScene({ code, sunrise, sunset }) {
  if (sunrise && sunset) sunTimes = { rise: new Date(sunrise), set: new Date(sunset) };
  document.body.dataset.sky = skyFromCode(code);
  apply();
}

export function initScene() {
  if (!document.body.dataset.sky) document.body.dataset.sky = 'partly';
  apply();
  setInterval(apply, 5 * 60 * 1000);
}
