# איך הדאשבורד בנוי (למי שממשיך לעבוד עליו)

## חלקים
- **קוד:** ה-repo הזה (`triple-Sal/dashboard`, ציבורי – בלי נתונים).
- **רובוט:** `.github/workflows/update.yml` רץ כל 15 דקות ומריץ את `scripts/fetch-data.mjs`.
  הוא אוסף: חדשות (N12, FreshPlaza), שערים ומדדים (Yahoo), מזג אוויר (Open-Meteo), ומכולות מקובץ האקסל.
- **תצוגה:** Cloudflare Pages, פרויקט `roy-dashboard` → https://roy-dashboard.pages.dev
  מוגן ב-Cloudflare Access (קוד חד-פעמי למייל, רשימת מיילים מורשים). GitHub Pages כבוי.

## סודות ב-GitHub (Settings → Secrets → Actions)
| שם | מה זה |
|---|---|
| `CLOUDFLARE_API_TOKEN` | מפתח Cloudflare עם הרשאת Pages: Edit בלבד |
| `GOOGLE_SERVICE_ACCOUNT` | מפתח JSON של חשבון הרובוט `dashboard-bot@hybrid-subject-513512-e8.iam.gserviceaccount.com` (צפייה בלבד בקובץ) |

מספר חשבון Cloudflare (לא סודי) מוגדר ב-`update.yml`.

## הטבלה
- כרגע: קובץ Excel בגוגל דרייב (הלינק ב-`config.js` → `sheet.url`), לשונית "ייבוא", כותרות בשורה 6.
- עמודות: A מספר תיק, D סטטוס, E תאריך הגעה, G פרי, H זן, I מדינה, K ספק, L יבואן.
- כללים: סטטוס "שחרור" → ראשון ומהבהב. אחר כך הגעות ב-7 הימים הקרובים, ואם אין – 3 הבאות.
- הקוד: `scripts/google-sheet.mjs` (כניסה והורדה), `scripts/containers.mjs` (סינון).

## פרטיות
- נתוני המכולות לא נשמרים ב-repo, לא ב-cache של GitHub, ולא מודפסים בלוגים (הלוגים ציבוריים).

## מעבר ל-SharePoint (בתהליך)
- רועי הוא ה-admin של Microsoft 365, ועושה את ההגדרות בעצמו.
- הרשאה: `Files.SelectedOperations.Selected` (אפליקציה) – קריאה לקובץ אחד בלבד.
  תיעוד: https://learn.microsoft.com/graph/permissions-selected-overview
- ההרשאה לקובץ ניתנת ב-Graph Explorer: POST ל-`/drives/{driveId}/items/{itemId}/permissions` עם `roles: ["read"]`.
- ⚠️ זה "מנתק ירושה" בקובץ: לקובץ יש הרשאות ייחודיות. משתמשים שמתווספים לקבוצות קיימות באתר מקבלים גישה כרגיל,
  אבל הרשאות שמוסיפים ישירות לאתר לא חלות עליו. **לא ללחוץ "Restore inheritance"** בקובץ – זה מוריד את הגישה של הרובוט.
- העברת הקובץ לספרייה/אתר אחר מבטלת את הגישה של הרובוט (צריך לתת שוב).
