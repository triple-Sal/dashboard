// ============================================================
//  קובץ ההגדרות של הדאשבורד
//  כל מה שאולי תרצו לשנות בעתיד נמצא כאן, במקום אחד.
//  אחרי שינוי, שומרים את הקובץ ב-GitHub והאתר מתעדכן לבד.
// ============================================================

export const CONFIG = {
  // הכותרת שמופיעה בראש הדאשבורד
  title: 'הדאשבורד שלי',

  // ---------- באנרים רצים של חדשות ----------
  news: {
    israel: {
      label: 'חדשות ישראל',
      source: 'N12',
      // כתובות RSS (רשימות כותרות). הרובוט מאחד את כולן ומציג את החדשות ביותר
      rss: [
        'https://rcs.mako.co.il/rss/news-israel.xml',     // חדשות בארץ
        'https://rcs.mako.co.il/rss/news-military.xml',   // פוליטי וביטחוני
        'https://rcs.mako.co.il/rss/news-law.xml',        // פלילים ומשפט
      ],
      // אם ה-RSS לא עובד, הרובוט יקרא את דף האתר עצמו
      page: 'https://www.mako.co.il/news',
      articlePattern: '/Article-',
      direction: 'rtl',
    },
    world: {
      label: 'FreshPlaza Europe',
      source: 'FreshPlaza',
      rss: [
        'https://www.freshplaza.com/europe/rss.xml/',
      ],
      page: 'https://www.freshplaza.com/europe/',
      articlePattern: '/article/',
      direction: 'ltr',
    },
    maxHeadlines: 15,     // כמה כותרות להציג בכל באנר
    speed: 60,            // מהירות הגלילה (פיקסלים לשנייה). מספר קטן = איטי יותר
  },

  // ---------- שערי מטבע מול השקל ----------
  currencies: [
    { code: 'USD', name: 'דולר אמריקאי', symbol: '$', yahoo: 'ILS=X' },
    { code: 'EUR', name: 'אירו',          symbol: '€', yahoo: 'EURILS=X' },
  ],

  // ---------- מדדים ----------
  indices: [
    { name: 'ת"א 35',  country: 'ישראל', flag: '🇮🇱', yahoo: 'TA35.TA' },
    { name: 'S&P 500', country: 'ארה"ב', flag: '🇺🇸', yahoo: '^GSPC' },
  ],

  // ---------- מזג אוויר ----------
  weather: {
    city: 'תל אביב',
    latitude: 32.0853,
    longitude: 34.7818,
    forecastDays: 3,      // כמה ימים קדימה להציג
  },

  // ---------- טבלת אקסל בענן ----------
  sheet: {
    // הלינק לקובץ (גוגל דרייב). הרובוט קורא אותו בעזרת "חשבון הרובוט", בהרשאת צפייה בלבד
    url: 'https://docs.google.com/spreadsheets/d/1UL4D0P7jezyUxBx_GwlHgEBMmYkc1bRm/edit',
  },

  // ---------- כל כמה זמן לרענן את המסך (בדקות) ----------
  refreshMinutes: {
    news: 5,
    markets: 5,
    weather: 30,
  },
};
