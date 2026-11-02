// כתובת השאילתה לשירות מזג האוויר (Open-Meteo). משמשת גם את הרובוט וגם את הדף.
export function weatherUrl(w) {
  return `https://api.open-meteo.com/v1/forecast?latitude=${w.latitude}&longitude=${w.longitude}`
    + '&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day'
    + '&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset'
    + `&forecast_days=${w.forecastDays + 1}&timezone=Asia%2FJerusalem`;
}
