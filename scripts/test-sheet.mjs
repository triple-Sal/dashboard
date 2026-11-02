// בדיקת חיבור לטבלה: מדפיס רק שם קובץ, שמות לשוניות וגודל – בלי שום תוכן.
import { CONFIG } from '../config.js';
import { driveFileInfo, readExcelFromDrive } from './google-sheet.mjs';

const info = await driveFileInfo(CONFIG.sheet);
console.log('File type:', info.mimeType, '| modified:', info.modifiedTime);
const wb = await readExcelFromDrive(CONFIG.sheet);
for (const name of wb.SheetNames) {
  console.log(`Tab #${wb.SheetNames.indexOf(name) + 1}: range ${wb.Sheets[name]['!ref'] || 'empty'}`);
}
console.log('✔ Connection OK');
