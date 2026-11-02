// ============================================================
//  התאמה בין שמות (עברית או אנגלית) לדגלים ולאייקוני פרי.
//  כדי להוסיף מדינה או פרי: מוסיפים שורה. אין חשיבות לאותיות גדולות/קטנות.
// ============================================================

// מדינה -> קוד דגל בינלאומי (שתי אותיות)
export const COUNTRIES = {
  il: ['ישראל', 'israel'],
  es: ['ספרד', 'spain'],
  it: ['איטליה', 'italy'],
  nl: ['הולנד', 'netherlands', 'holland'],
  gr: ['יוון', 'greece'],
  tr: ['טורקיה', 'turkey', 'türkiye', 'turkiye'],
  eg: ['מצרים', 'egypt'],
  ma: ['מרוקו', 'morocco'],
  za: ['דרום אפריקה', 'south africa', 'rsa'],
  cl: ['צ\'ילה', 'צילה', 'chile'],
  pe: ['פרו', 'peru'],
  ar: ['ארגנטינה', 'argentina'],
  br: ['ברזיל', 'brazil'],
  co: ['קולומביה', 'colombia'],
  ec: ['אקוודור', 'ecuador'],
  cr: ['קוסטה ריקה', 'costa rica'],
  mx: ['מקסיקו', 'mexico'],
  us: ['ארה"ב', 'ארצות הברית', 'usa', 'us', 'united states'],
  ca: ['קנדה', 'canada'],
  nz: ['ניו זילנד', 'new zealand', 'nz'],
  au: ['אוסטרליה', 'australia'],
  fr: ['צרפת', 'france'],
  pt: ['פורטוגל', 'portugal'],
  pl: ['פולין', 'poland'],
  de: ['גרמניה', 'germany'],
  be: ['בלגיה', 'belgium'],
  at: ['אוסטריה', 'austria'],
  in: ['הודו', 'india'],
  cn: ['סין', 'china'],
  th: ['תאילנד', 'thailand'],
  vn: ['וייטנאם', 'vietnam', 'viet nam'],
  ph: ['פיליפינים', 'philippines'],
  ke: ['קניה', 'kenya'],
  cy: ['קפריסין', 'cyprus'],
  jo: ['ירדן', 'jordan'],
  uy: ['אורוגוואי', 'uruguay'],
  rs: ['סרביה', 'serbia'],
  md: ['מולדובה', 'moldova'],
  ua: ['אוקראינה', 'ukraine'],
  ge: ['גאורגיה', 'georgia'],
  uz: ['אוזבקיסטן', 'uzbekistan'],
  tn: ['תוניסיה', 'tunisia'],
  gt: ['גואטמלה', 'guatemala'],
  hn: ['הונדורס', 'honduras'],
  do: ['הרפובליקה הדומיניקנית', 'dominican republic'],
  zw: ['זימבבואה', 'zimbabwe'],
  na: ['נמיביה', 'namibia'],
  sz: ['אסוואטיני', 'eswatini', 'swaziland'],
  mk: ['מקדוניה', 'north macedonia', 'macedonia'],
  al: ['אלבניה', 'albania'],
  ro: ['רומניה', 'romania'],
  bg: ['בולגריה', 'bulgaria'],
  hu: ['הונגריה', 'hungary'],
  gb: ['בריטניה', 'אנגליה', 'uk', 'united kingdom', 'england'],
  pk: ['פקיסטן', 'pakistan'],
  lk: ['סרי לנקה', 'sri lanka'],
  jp: ['יפן', 'japan'],
  kr: ['קוריאה', 'דרום קוריאה', 'korea', 'south korea'],
};

// פרי -> קוד אייקון (Twemoji). הסדר חשוב: ביטוי ארוך לפני קצר
export const FRUITS = [
  ['1f954', ['תפוח אדמה', 'תפודים', 'potato']],
  ['1f34f', ['תפוח ירוק', 'green apple', 'granny']],
  ['1f34e', ['תפוח', 'תפוחים', 'apple']],
  ['1f350', ['אגס', 'אגסים', 'pear']],
  ['1f34b', ['לימון', 'לימונים', 'ליים', 'lemon', 'lime']],
  ['1f34a', ['תפוז', 'תפוזים', 'קלמנטינה', 'מנדרינה', 'אשכולית', 'פומלה', 'הדר', 'orange', 'mandarin', 'clementine', 'tangerine', 'grapefruit', 'pomelo', 'citrus', 'easy peeler']],
  ['1f34c', ['בננה', 'בננות', 'banana']],
  ['1f347', ['ענב', 'ענבים', 'grape']],
  ['1f95d', ['קיווי', 'kiwi']],
  ['1f96d', ['מנגו', 'mango']],
  ['1f951', ['אבוקדו', 'avocado']],
  ['1f34d', ['אננס', 'pineapple']],
  ['1f352', ['דובדבן', 'דובדבנים', 'cherry', 'cherries']],
  ['1f351', ['אפרסק', 'נקטרינה', 'משמש', 'peach', 'nectarine', 'apricot']],
  ['1f353', ['תות', 'strawberry']],
  ['1fad0', ['פירות יער', 'אוכמניות', 'אוכמנית', 'blueberry', 'blueberries', 'berries']],
  ['1f349', ['אבטיח', 'watermelon']],
  ['1f348', ['מלון', 'melon']],
  ['1f965', ['קוקוס', 'coconut']],
  ['1f345', ['עגבני', 'tomato']],
  ['1f95c', ['אגוז', 'בוטן', 'nut', 'peanut']],
  ['1f9c5', ['בצל', 'onion']],
  ['1f955', ['גזר', 'carrot']],
];
export const GENERIC_FRUIT = '1f9fa'; // סל

const norm = (s) => String(s || '').trim().toLowerCase();

export function flagCode(country) {
  const n = norm(country);
  if (!n) return null;
  for (const [code, names] of Object.entries(COUNTRIES)) {
    if (names.some(x => n === x || n.includes(x) && x.length > 3)) return code;
  }
  return null;
}

export function fruitIcon(fruit) {
  const n = norm(fruit);
  for (const [code, names] of FRUITS) {
    if (names.some(x => n.includes(x))) return code;
  }
  return GENERIC_FRUIT;
}

export const twemoji = (code) =>
  `https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/${code}.svg`;
